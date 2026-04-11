import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const email = body.email?.toLowerCase().trim();
  const password = body.password?.trim();
  const name = body.name?.trim() || null;

  if (!email || !password) {
    return NextResponse.json({ error: "Email и парола са задължителни." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Паролата трябва да е поне 8 символа." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Потребител с този email вече съществува." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  return NextResponse.json({
    user: {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    },
  }, { status: 201 });
}
