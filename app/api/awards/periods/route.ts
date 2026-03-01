import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.awardPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(periods);
}
