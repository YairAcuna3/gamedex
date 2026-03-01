import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { tags, ...gameData } = await request.json();
  const { id } = await params;

  const game = await prisma.game.update({
    where: { id, userId: session.user.id },
    data: gameData,
  });

  if (tags !== undefined) {
    await prisma.gameTag.deleteMany({
      where: { gameId: id },
    });

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

  return NextResponse.json(game);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.game.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: "Juego eliminado" });
}
