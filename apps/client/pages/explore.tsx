import {
  Append,
  Count,
  Distinct,
  Index,
  Lambda,
  Map,
  Match,
  Paginate,
  Select,
  Var,
} from "faunadb";
import { NextPageContext } from "next";
import Link from "next/link";
import { useState } from "react";

import Carousel from "../src/components/base/Carousel";
import { getNavbarLayout } from "../src/components/layouts/NavbarLayout/NavbarLayout";
import AvatarCard from "../src/components/lens/AvatarCard";
import SpaceCard from "../src/components/lens/SpaceCard";
import MetaTags from "../src/components/ui/MetaTags";
import {
  ExplorePublicationsDocument,
  ExplorePublicationsQuery,
  ExplorePublicationsQueryVariables,
  GetPublicationsDocument,
  GetPublicationsQuery,
  GetPublicationsQueryVariables,
  PaginatedResultInfo,
  Post,
  PublicationSortCriteria,
  PublicationTypes,
} from "../src/generated/graphql";
import { client } from "../src/helpers/faunadb/client";
import { lensClient } from "../src/helpers/lens/client";
import { getMediaImageSSR } from "../src/helpers/lens/hooks/useMediaImage";
import { AppId } from "../src/helpers/lens/types";
import { useIsMobile } from "../src/helpers/utils/useIsMobile";
import { useQueryPagination } from "../src/helpers/utils/useQueryPagination";

const HOT_SPACES_LIMIT = 6;

async function fetchHotSpaces() {
  try {
    //get hot spaces
    const doc = await client.query(
      Select(
        "data",
        Map(
          Distinct(Paginate(Match(Index("Space-View-Event-Ids")))),
          Lambda(
            "id",
            Append(
              [Var("id")],
              [
                Count(
                  Select(
                    "data",
                    Paginate(Match(Index("Space-View-Events-By-Id"), Var("id")))
                  )
                ),
              ]
            )
          )
        )
      )
    );

    const spaceViews = doc as Array<[number, string]>;

    //only take the top spaces
    const topSpaceViews = spaceViews.slice(0, HOT_SPACES_LIMIT);

    ///get space publications
    const spacesQuery = await lensClient
      .query<GetPublicationsQuery, GetPublicationsQueryVariables>(
        GetPublicationsDocument,
        {
          request: {
            publicationIds: topSpaceViews.map(([_, id]) => id),
          },
        }
      )
      .toPromise();

    const items = (spacesQuery.data?.publications.items as Post[]) ?? [];
    const sortedItems = items.sort((a, b) => {
      const aViews = topSpaceViews.find(([_, id]) => id === a.id)?.[0] ?? 0;
      const bViews = topSpaceViews.find(([_, id]) => id === b.id)?.[0] ?? 0;

      return bViews - aViews;
    });

    //fetch media images
    const fetchedItems = sortedItems.map((item) => {
      if (!item.metadata.media[0]) return item;
      const newItem = { ...item };
      newItem.metadata.image = getMediaImageSSR(item.metadata.media[0]);
      return newItem;
    });

    return fetchedItems;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function fetchLatestSpaces(pageInfo?: PaginatedResultInfo, limit = 3) {
  const latestAvatarsQuery = await lensClient
    .query<ExplorePublicationsQuery, ExplorePublicationsQueryVariables>(
      ExplorePublicationsDocument,
      {
        request: {
          sources: [AppId.space],
          sortCriteria: PublicationSortCriteria.Latest,
          publicationTypes: [PublicationTypes.Post],
          limit,
          cursor: pageInfo?.next,
        },
      }
    )
    .toPromise();

  const explore = latestAvatarsQuery.data?.explorePublications;

  const items = (explore?.items as Post[]) ?? [];
  const info = explore?.pageInfo as PaginatedResultInfo;

  const fetchedItems = items.map((item) => {
    if (!item.metadata.media[0]) return item;
    const newItem = { ...item };
    newItem.metadata.image = getMediaImageSSR(item.metadata.media[0]);
    return newItem;
  });

  return {
    items: fetchedItems,
    info,
  };
}

async function fetchLatestAvatars(pageInfo?: PaginatedResultInfo, limit = 5) {
  const latestAvatarsQuery = await lensClient
    .query<ExplorePublicationsQuery, ExplorePublicationsQueryVariables>(
      ExplorePublicationsDocument,
      {
        request: {
          sources: [AppId.avatar],
          sortCriteria: PublicationSortCriteria.Latest,
          publicationTypes: [PublicationTypes.Post],
          limit,
          cursor: pageInfo?.next,
        },
      }
    )
    .toPromise();

  const explore = latestAvatarsQuery.data?.explorePublications;

  const items = (explore?.items as Post[]) ?? [];
  const info = explore?.pageInfo as PaginatedResultInfo;

  const fetchedItems = items.map((item) => {
    if (!item.metadata.media[0]) return item;
    const newItem = { ...item };
    newItem.metadata.image = getMediaImageSSR(item.metadata.media[0]);
    return newItem;
  });

  return {
    items: fetchedItems,
    info,
  };
}

export async function getServerSideProps({ res }: NextPageContext) {
  res?.setHeader("Cache-Control", "s-maxage=120");

  const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;

  const pageInfo: PaginatedResultInfo = {
    totalCount: -1,
    next: JSON.stringify({ timestamp: oneMonthAgo }),
  };

  //fetch the first page
  const firstLatestSpaces = await fetchLatestSpaces(pageInfo);
  const firstLatestAvatars = await fetchLatestAvatars(pageInfo);

  //also fetch the next page
  const secondPageSpaces = await fetchLatestSpaces(firstLatestSpaces.info);
  const secondPageAvatars = await fetchLatestAvatars(firstLatestAvatars.info);

  //fetch hot spaces
  const hotSpaces = await fetchHotSpaces();

  const props: Props = {
    initialLatestSpaces: [
      ...firstLatestSpaces.items,
      ...secondPageSpaces.items,
    ],
    initialLatestSpacesInfo: secondPageSpaces.info,
    initialLatestAvatars: [
      ...firstLatestAvatars.items,
      ...secondPageAvatars.items,
    ],
    initialLatestAvatarsInfo: secondPageAvatars.info,
    hotSpaces: hotSpaces ?? [],
  };

  return {
    props,
  };
}

interface Props {
  initialLatestSpaces: Post[];
  initialLatestSpacesInfo: PaginatedResultInfo;
  initialLatestAvatars: Post[];
  initialLatestAvatarsInfo: PaginatedResultInfo;
  hotSpaces: Post[];
}

export default function Explore({
  initialLatestSpaces,
  initialLatestSpacesInfo,
  initialLatestAvatars,
  initialLatestAvatarsInfo,
  hotSpaces,
}: Props) {
  const isMobile = useIsMobile();
  const spaceLimit = isMobile ? 1 : 3;
  const avatarLimit = isMobile ? 1 : 5;

  const latestSpaces = useQueryPagination({
    pageSize: spaceLimit,
    initialCache: initialLatestSpaces,
    initialPageInfo: initialLatestSpacesInfo,
    fetchNextPage: (page) => fetchLatestSpaces(page, spaceLimit),
  });

  const latestAvatars = useQueryPagination({
    pageSize: avatarLimit,
    initialCache: initialLatestAvatars,
    initialPageInfo: initialLatestAvatarsInfo,
    fetchNextPage: (page) => fetchLatestAvatars(page, avatarLimit),
  });

  const [hotSpacesPage, setHotSpacesPage] = useState(0);
  const disableHotSpacesBack = hotSpacesPage === 0;
  const disableHotSpacesForward =
    hotSpacesPage === hotSpaces.length / spaceLimit - 1;

  return (
    <>
      <MetaTags title="Explore" />

      <div className="flex justify-center py-8 mx-4">
        <div className="max-w space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="font-black text-3xl">Explore</div>
          </div>

          {hotSpaces.length > 0 && (
            <Carousel
              title="🔥 Hot Spaces"
              back={!disableHotSpacesBack}
              forward={!disableHotSpacesForward}
              onBack={() => {
                if (disableHotSpacesBack) return;
                setHotSpacesPage(hotSpacesPage - 1);
              }}
              onForward={() => {
                if (disableHotSpacesForward) return;
                setHotSpacesPage(hotSpacesPage + 1);
              }}
            >
              {hotSpaces.map((space) => (
                <Link key={space.id} href={`/space/${space.id}`} passHref>
                  <a
                    className="h-40 transition duration-500"
                    style={{
                      transform: `translate(calc(-${
                        hotSpacesPage * spaceLimit
                      }00% + ${
                        spaceLimit > 1 ? Math.min(hotSpacesPage, 1) * 15 : 0
                      }%))`,
                    }}
                  >
                    <SpaceCard space={space} />
                  </a>
                </Link>
              ))}
            </Carousel>
          )}

          {latestSpaces.cache.length > 0 && (
            <Carousel
              title="✨ Latest Spaces"
              back={!latestSpaces.disableBack}
              forward={!latestSpaces.disableNext}
              onBack={latestSpaces.back}
              onForward={latestSpaces.next}
            >
              {latestSpaces.cache.map((space) => (
                <Link key={space.id} href={`/space/${space.id}`} passHref>
                  <a
                    className="h-40 transition duration-500"
                    style={{
                      transform: `translate(calc(-${
                        latestSpaces.page * spaceLimit
                      }00% + ${
                        spaceLimit > 1 ? Math.min(latestSpaces.page, 1) * 15 : 0
                      }%))`,
                    }}
                  >
                    <SpaceCard space={space} />
                  </a>
                </Link>
              ))}
            </Carousel>
          )}

          {latestAvatars.cache.length > 0 && (
            <Carousel
              title="✨ Latest Avatars"
              back={!latestAvatars.disableBack}
              forward={!latestAvatars.disableNext}
              onBack={latestAvatars.back}
              onForward={latestAvatars.next}
            >
              {latestAvatars.cache.map((avatar) => (
                <Link key={avatar.id} href={`/avatar/${avatar.id}`} passHref>
                  <a
                    className="h-64 transition duration-500"
                    style={{
                      transform: `translate(calc(-${
                        latestAvatars.page * avatarLimit
                      }00% + ${
                        avatarLimit > 1
                          ? Math.min(latestAvatars.page, 1) * 15
                          : 0
                      }%))`,
                    }}
                  >
                    <AvatarCard avatar={avatar} />
                  </a>
                </Link>
              ))}
            </Carousel>
          )}
        </div>
      </div>
    </>
  );
}

Explore.getLayout = getNavbarLayout;
