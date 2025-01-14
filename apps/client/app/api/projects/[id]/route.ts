import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/src/env.mjs";
import { getServerSession } from "@/src/server/helpers/getServerSession";
import { listObjectsRecursive } from "@/src/server/helpers/listObjectsRecursive";
import { prisma } from "@/src/server/prisma";
import { s3Client } from "@/src/server/s3";
import { S3Path } from "@/src/utils/s3Paths";

import { Params, paramsSchema, patchSchema } from "./types";

// Get project
export async function GET(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session || !session.address) return new Response("Unauthorized", { status: 401 });

  const { id } = paramsSchema.parse(params);

  // Verify user owns the project
  const project = await prisma.project.findFirst({
    where: { publicId: id, owner: session.address },
    include: { Space: true },
  });
  if (!project) return new Response("Project not found", { status: 404 });

  return NextResponse.json(project);
}

// Update project
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session || !session.address) return new Response("Unauthorized", { status: 401 });

  const { id } = paramsSchema.parse(params);
  const { title, description, spaceId } = patchSchema.parse(await request.json());

  // Verify user owns the project
  const found = await prisma.project.findFirst({ where: { publicId: id, owner: session.address } });
  if (!found) return new Response("Project not found", { status: 404 });

  // Verify user owns the space, if provided
  const space = spaceId
    ? await prisma.space.findFirst({
        where: { publicId: spaceId, owner: session.address },
      })
    : null;
  if (spaceId && !space) return new Response("Space not found", { status: 404 });

  // Update project
  await prisma.project.update({
    where: { publicId: id },
    data: {
      title,
      description,
      spaceId: spaceId === undefined ? undefined : space ? space.id : null,
    },
  });

  return NextResponse.json({ success: true });
}

// Delete project
export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session || !session.address) return new Response("Unauthorized", { status: 401 });

  const { id } = paramsSchema.parse(params);

  // Verify user owns the project
  const found = await prisma.project.findFirst({ where: { publicId: id, owner: session.address } });
  if (!found) return new Response("Project not found", { status: 404 });

  // Get objects from S3
  const allObjects = await listObjectsRecursive(S3Path.project(id).directory);

  await Promise.all([
    // Delete objects from S3
    s3Client.send(
      new DeleteObjectsCommand({
        Bucket: env.S3_BUCKET,
        Delete: { Objects: allObjects.map(({ Key }) => ({ Key })) },
      })
    ),

    // Delete project from database
    prisma.project.delete({ where: { publicId: id } }),
  ]);

  return NextResponse.json({ success: true });
}
