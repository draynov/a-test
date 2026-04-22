import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const office = await prisma.ruoOffice.findUnique({ where: { id } });

    if (!office) {
      return NextResponse.json({ error: 'RUO office not found' }, { status: 404 });
    }

    return NextResponse.json(office, { status: 200 });
  } catch (error) {
    console.error('Error fetching RUO office by id:', error);
    return NextResponse.json({ error: 'Failed to fetch RUO office' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.ruoOffice.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'RUO office not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, region } = body;

    const errors: Record<string, string> = {};

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      errors.name = 'Името трябва да е текст';
    }

    if (region !== undefined && (typeof region !== 'string' || region.trim().length === 0)) {
      errors.region = 'Регионът трябва да е текст';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const nextName = typeof name === 'string' ? name.trim() : existing.name;
    const nextRegion = typeof region === 'string' ? region.trim() : existing.region;

    if (nextName !== existing.name || nextRegion !== existing.region) {
      const duplicate = await prisma.ruoOffice.findFirst({
        where: {
          OR: [{ name: nextName }, { region: nextRegion }],
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicate) {
        return NextResponse.json({ error: 'Вече съществува РУО офис с това име или регион' }, { status: 409 });
      }
    }

    const updated = await prisma.ruoOffice.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name: name.trim() } : {}),
        ...(typeof region === 'string' ? { region: region.trim() } : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating RUO office:', error);
    return NextResponse.json({ error: 'Failed to update RUO office' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.ruoOffice.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ error: 'RUO office not found' }, { status: 404 });
    }

    await prisma.ruoOffice.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting RUO office:', error);
    return NextResponse.json({ error: 'Failed to delete RUO office' }, { status: 500 });
  }
}