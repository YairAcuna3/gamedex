import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { code, name, scope } = await request.json();

  const existingAward = await prisma.award.findUnique({
    where: { code },
  });

  if (existingAward) {
    return NextResponse.json(
      { error: "Ya existe un premio con ese código" },
      { status: 400 },
    );
  }

  const award = await prisma.award.create({
    data: {
      code,
      name,
      scope,
    },
  });

  return NextResponse.json(award, { status: 201 });
}
