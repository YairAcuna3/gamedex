import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { gameId, awardCode, year, month } = await request.json();

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
  });

  if (!game) {
    return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
  }

  const award = await prisma.award.findUnique({
    where: { code: awardCode },
  });

  if (!award) {
    return NextResponse.json(
      { error: "Premio no encontrado" },
      { status: 404 },
    );
  }

  // Buscar o crear el período según el scope del premio
  let period;

  if (award.scope === "MONTHLY") {
    period = await prisma.awardPeriod.findFirst({
      where: {
        year,
        month,
      },
    });

    if (!period) {
      period = await prisma.awardPeriod.create({
        data: {
          year,
          month,
        },
      });
    }
  } else {
    // YEARLY
    period = await prisma.awardPeriod.findFirst({
      where: {
        year,
        month: null,
      },
    });

    if (!period) {
      period = await prisma.awardPeriod.create({
        data: {
          year,
          month: null,
        },
      });
    }
  }

  const gameAward = await prisma.gameAward.create({
    data: {
      gameId,
      awardId: award.id,
      periodId: period.id,
    },
  });

  return NextResponse.json(gameAward, { status: 201 });
}
