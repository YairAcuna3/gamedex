import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const periods = await prisma.awardPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      gameAwards: {
        where: {
          game: { userId: session.user.id },
        },
        include: {
          award: true,
          game: {
            select: {
              id: true,
              name: true,
              image: true,
              platform: true,
            },
          },
        },
      },
    },
  });

  // Only return periods that have at least one award for this user
  const filtered = periods.filter((p) => p.gameAwards.length > 0);

  return NextResponse.json(filtered);
}
