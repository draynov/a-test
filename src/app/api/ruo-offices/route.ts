import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offices = await prisma.ruoOffice.findMany({
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(offices, { status: 200 });
  } catch (error) {
    console.error('Error fetching RUO offices:', error);
    return NextResponse.json({ error: 'Failed to fetch RUO offices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, region } = body;

    const errors: Record<string, string> = {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Името е задължително';
    }

    if (!region || typeof region !== 'string' || region.trim().length === 0) {
      errors.region = 'Регионът е задължителен';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const normalizedName = name.trim();
    const normalizedRegion = region.trim();

    const duplicate = await prisma.ruoOffice.findFirst({
      where: {
        OR: [{ name: normalizedName }, { region: normalizedRegion }],
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Вече съществува РУО офис с това име или регион' }, { status: 409 });
    }

    const created = await prisma.ruoOffice.create({
      data: {
        name: normalizedName,
        region: normalizedRegion,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating RUO office:', error);
    return NextResponse.json({ error: 'Failed to create RUO office' }, { status: 500 });
  }
}