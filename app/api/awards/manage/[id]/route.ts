import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { name, scope } = await request.json();
  const { id } = await params;

  const award = await prisma.award.update({
    where: { id },
    data: {
      name,
      scope,
    },
  });

  return NextResponse.json(award);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const hasGameAwards = await prisma.gameAward.count({
    where: { awardId: id },
  });

  if (hasGameAwards > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar un premio que está asignado a juegos" },
      { status: 400 },
    );
  }

  await prisma.award.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Premio eliminado" });
}
