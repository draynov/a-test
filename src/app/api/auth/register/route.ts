import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
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

  try {
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

    return NextResponse.json(
      {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021") {
        return NextResponse.json(
          { error: 'Липсва таблица "User" в базата. Пусни supabase-user.sql в SQL Editor.' },
          { status: 500 },
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json({ error: "Потребител с този email вече съществува." }, { status: 409 });
      }

      return NextResponse.json(
        {
          error: "Prisma грешка при регистрация.",
          code: error.code,
          details: error.message,
        },
        { status: 500 },
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error: "Грешка при връзка с базата.",
          code: error.errorCode ?? "INIT_ERROR",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Регистрацията е неуспешна. Провери Database URL и SQL таблиците в Supabase.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
