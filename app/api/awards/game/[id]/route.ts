import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Verificar que el premio pertenece a un juego del usuario
  const gameAward = await prisma.gameAward.findUnique({
    where: { id },
    include: {
      game: true,
    },
  });

  if (!gameAward) {
    return NextResponse.json(
      { error: "Premio no encontrado" },
      { status: 404 },
    );
  }

  if (gameAward.game.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.gameAward.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Premio eliminado del juego" });
}
