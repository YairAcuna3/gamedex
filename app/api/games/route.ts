import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    include: {
      awards: {
        include: {
          award: true,
          period: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(games);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { tags, ...gameData } = await request.json();

  const game = await prisma.game.create({
    data: {
      ...gameData,
      userId: session.user.id,
    },
  });

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName },
        });
      }

      await prisma.gameTag.create({
        data: {
          gameId: game.id,
          tagId: tag.id,
        },
      });
    }
  }

  return NextResponse.json(game, { status: 201 });
}
