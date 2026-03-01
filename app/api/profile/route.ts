import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      description: true,
      photo: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { name, description, photo } = await request.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      description,
      photo,
    },
  });

  return NextResponse.json(user);
}
