import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/dist/client/link";
import Head from "next/dist/shared/lib/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useSession } from "../../../client/auth/useSession";
import { trpc } from "../../../client/trpc";
import { getNavbarLayout } from "../../../home/layouts/NavbarLayout/NavbarLayout";
import MetaTags from "../../../home/MetaTags";
import ProfilePicture from "../../../home/ProfilePicture";
import SpaceCard from "../../../home/SpaceCard";
import { prisma } from "../../../server/prisma";
import { appRouter } from "../../../server/router/_app";
import Button from "../../../ui/Button";
import Spinner from "../../../ui/Spinner";
import { isFromCDN } from "../../../utils/isFromCDN";
import { hexDisplayToNumber, numberToHexDisplay } from "../../../utils/numberToHexDisplay";

export const getServerSideProps = async ({ res, query }: GetServerSidePropsContext) => {
  const ONE_MINUTE_IN_SECONDS = 60;
  const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

  res.setHeader(
    "Cache-Control",
    `public, max-age=0, s-maxage=${ONE_MINUTE_IN_SECONDS}, stale-while-revalidate=${ONE_WEEK_IN_SECONDS}`
  );

  const id = query.id as string;
  const isAddress = id.length === 42;

  const ssg = await createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      res,
      session: null,
    },
  });

  if (isAddress) {
    await ssg.social.profile.byAddress.prefetch({ address: id });
  } else {
    await ssg.social.profile.byId.prefetch({ id: hexDisplayToNumber(id) });
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export default function User({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAddress = id.length === 42;

  const { data: profileAddress, isLoading: isLoadingAddress } =
    trpc.social.profile.byAddress.useQuery(
      { address: id },
      {
        enabled: isAddress,
        refetchOnWindowFocus: false,
      }
    );

  const { data: profileId, isLoading: isLoadingId } = trpc.social.profile.byId.useQuery(
    { id: hexDisplayToNumber(id) },
    {
      enabled: !isAddress,
      refetchOnWindowFocus: false,
    }
  );

  const profile = isAddress ? profileAddress : profileId;
  const isLoading = isAddress ? isLoadingAddress : isLoadingId;
  const isUser = status === "authenticated" && profile?.owner === session?.address;

  const { data: spaces, isLoading: isLoadingSpaces } = trpc.space.latest.useQuery(
    { owner: profile?.owner },
    {
      enabled: profile?.owner !== undefined,
      refetchOnWindowFocus: false,
    }
  );

  // Force change page on hash change
  useEffect(() => {
    function onHashChange() {
      router.replace(window.location.href);
    }

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [router]);

  if (!isAddress && !isLoading && profile === null)
    return <div className="pt-12 text-center text-lg">User not found.</div>;

  return (
    <>
      <MetaTags
        title={
          profile ? (profile.handle ? profile.handle.string : numberToHexDisplay(profile.id)) : id
        }
        description={profile?.metadata?.description ?? undefined}
        image={profile?.metadata?.image ?? undefined}
      />

      <Head>
        <meta property="og:type" content="profile" />
        <meta property="og:profile:username" content={profile?.handle?.full} />
        <meta property="og:profile:first_name" content={profile?.handle?.string} />
      </Head>

      {isLoading ? (
        <div className="flex justify-center pt-12">
          <Spinner />
        </div>
      ) : (
        <div className="max-w-content mx-auto">
          <div className="h-48 w-full bg-sky-100 md:h-64 lg:rounded-xl">
            <div className="relative h-full w-full object-cover">
              {profile?.metadata?.animation_url &&
                (isFromCDN(profile.metadata.animation_url) ? (
                  <Image
                    src={profile.metadata.animation_url}
                    priority
                    fill
                    sizes="80vw"
                    alt=""
                    className="h-full w-full object-cover lg:rounded-xl"
                  />
                ) : (
                  <img
                    src={profile.metadata.animation_url}
                    alt=""
                    className="h-full w-full object-cover lg:rounded-xl"
                    crossOrigin="anonymous"
                  />
                ))}
            </div>
          </div>

          <section className="flex justify-center px-4 pb-4 md:px-0">
            <div className="flex w-full flex-col items-center space-y-2">
              <div className="z-10 -mt-16 flex w-32 rounded-full ring-4 ring-white">
                <ProfilePicture
                  src={profile?.metadata?.image}
                  circle
                  uniqueKey={profile?.handle?.full ?? id}
                  size={128}
                />
              </div>

              <div className="flex flex-col items-center pt-1">
                {profile?.handle ? (
                  <div>
                    <span className="text-2xl font-black">{profile.handle.string}</span>
                    <span className="text-xl font-bold text-neutral-400">
                      #{profile.handle.id.toString().padStart(4, "0")}
                    </span>
                  </div>
                ) : null}

                <div className="text-lg text-neutral-500">{isAddress ? id : profile?.owner}</div>
              </div>

              {/* <div className="flex w-full justify-center space-x-4 py-2 text-lg">
                <div className="flex flex-col items-center md:flex-row md:space-x-1">
                  <div className="font-bold">{0}</div>
                  <div className="text-neutral-500">Following</div>
                </div>

                <div className="flex flex-col items-center md:flex-row md:space-x-1">
                  <div className="font-bold">{0}</div>
                  <div className="text-neutral-500">Followers</div>
                </div>
              </div> */}

              {profile?.metadata?.description && (
                <div className="w-full">
                  <div className="whitespace-pre-line text-center">
                    {profile.metadata.description}
                  </div>
                </div>
              )}

              <div className="flex w-full justify-center space-x-2">
                {isUser ? (
                  <Link href="/settings">
                    <div>
                      <Button variant="outlined" rounded="small">
                        <div className="px-6">Edit profile</div>
                      </Button>
                    </div>
                  </Link>
                ) : null}

                {/* {twitter && (
                  <Button variant="outlined" rounded="small">
                    <a
                      href={`https://twitter.com/${twitter.value}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      <FaTwitter className="text-lg" />
                    </a>
                  </Button>
                )} */}
              </div>
            </div>
          </section>

          <section className="flex w-full flex-col items-center px-4 md:items-start md:px-0">
            <div className="flex w-full flex-col items-center space-y-2">
              <div className="flex flex-wrap space-x-4 pt-4">
                {/* {location && (
                  <AttributeRow icon={<MdOutlineLocationOn />}>{location.value}</AttributeRow>
                )} */}

                {/* {website && (
                  <AttributeRow icon={<MdLink />}>
                    <a
                      href={website.value}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {website.value}
                    </a>
                  </AttributeRow>
                )} */}
              </div>
            </div>
          </section>

          {isLoadingSpaces ? (
            <div className="flex justify-center pt-12">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {spaces?.map(({ id, metadata }) => {
                return (
                  <Link href={`/space/${numberToHexDisplay(id)}`} key={id}>
                    <SpaceCard id={id} metadata={metadata} animateEnter />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

User.getLayout = getNavbarLayout;