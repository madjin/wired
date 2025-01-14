import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { z } from "zod";

import { fetchDBSpaceMetadata } from "@/src/server/helpers/fetchDBSpaceMetadata";
import { fetchNFTSpaceMetadata } from "@/src/server/helpers/fetchNFTSpaceMetadata";
import { fetchSpaceMetadata } from "@/src/server/helpers/fetchSpaceMetadata";
import { readSpaceMetadata } from "@/src/server/helpers/readSpaceMetadata";
import { toHex } from "@/src/utils/toHex";

import RainbowkitWrapper from "../(navbar)/RainbowkitWrapper";
import SessionProvider from "../(navbar)/SessionProvider";
import { SPACE_ID_LENGTH } from "../api/projects/constants";
import App from "./App";
import { SpaceUriId } from "./types";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = searchParamsSchema.safeParse(searchParams);
  if (!params.success) return {};

  const id = readSpaceId(params.data);

  let metadata;

  if (id.type === "uri") {
    metadata = await readSpaceMetadata(id.value);
  } else {
    metadata = await fetchSpaceMetadata(id);
  }

  if (!metadata) return {};

  const { title, description, creator, image } = metadata;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      creators: creator ? [creator] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
      card: image ? "summary_large_image" : "summary",
    },
  };
}

export default async function Play({ searchParams }: Props) {
  // Call cookies() to force this route to be dynamic
  // It should be dynamic because of searchParams, but it's not due to a bug in Next.js
  cookies();

  const params = searchParamsSchema.safeParse(searchParams);
  if (!params.success) return notFound();

  const id = readSpaceId(params.data);

  let metadata;

  if (id.type === "tokenId") {
    metadata = await fetchNFTSpaceMetadata(id.value);
  } else if (id.type === "id") {
    metadata = await fetchDBSpaceMetadata(id.value);

    // If space has a token, redirect to the token page
    if (metadata && metadata.tokenId !== null) redirect(`/play?tokenId=${toHex(metadata.tokenId)}`);
  } else {
    metadata = await readSpaceMetadata(id.value);
  }

  if (!metadata) notFound();

  return (
    <SessionProvider>
      <RainbowkitWrapper>
        <App id={id} metadata={metadata} />
      </RainbowkitWrapper>
    </SessionProvider>
  );
}

function readSpaceId(params: Params): SpaceUriId {
  if ("id" in params) {
    return { type: "id", value: params.id };
  } else if ("tokenId" in params) {
    return { type: "tokenId", value: parseInt(params.tokenId) };
  } else {
    return { type: "uri", value: params.uri };
  }
}

const httpsSchema = z.string().refine((param) => param.startsWith("https://"));

const idSchema = z.string().refine((param) => {
  return param.length === SPACE_ID_LENGTH;
});

const tokenIdSchema = z.string().refine((param) => {
  return param.startsWith("0x");
});

const searchParamsSchema = z.union([
  z.object({ id: idSchema }),
  z.object({ tokenId: tokenIdSchema }),
  z.object({ uri: httpsSchema }),
]);

type Params = z.infer<typeof searchParamsSchema>;
