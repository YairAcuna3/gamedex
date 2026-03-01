import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const awards = await prisma.award.findMany({
    orderBy: { code: "asc" },
  });

  return NextResponse.json(awards);
}
