import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../util/prisma';
import { handleRouteError, fail } from '@/lib/server/http';
import { registerSchema } from '@/lib/server/validation';
import { BCRYPT_ROUNDS } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());
    const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    try {
      await prisma.user.create({
        data: { email: body.email, password: hashedPassword, name: body.name },
      });
    } catch (e: unknown) {
      const { Prisma } = await import('@/app/generated/prisma/client');
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail('CONFLICT', 'User already exists with this email');
      }
      throw e;
    }
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/auth/register');
  }
}
