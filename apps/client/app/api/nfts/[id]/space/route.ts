import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/src/server/helpers/getServerSession";
import { prisma } from "@/src/server/prisma";

import { paramsSchema } from "../types";
import { Params } from "../types";
import { GetNftSpaceResponse } from "./types";

// Get nft space
export async function GET(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session || !session.address) return new Response("Unauthorized", { status: 401 });

  const { id } = paramsSchema.parse(params);

  const spaceNft = await prisma.spaceNFT.findFirst({
    where: { publicId: id, Space: { owner: session.address } },
    include: { Space: true },
  });
  if (!spaceNft) return new Response("Space NFT not found", { status: 404 });

  const json: GetNftSpaceResponse = { spaceId: spaceNft.Space.publicId };
  return NextResponse.json(json);
}
