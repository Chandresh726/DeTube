import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/db';
import bcrypt from 'bcryptjs';
import { handleRouteError, fail, isPrismaCode } from '@/lib/server/http';
import { registerSchema } from '@/lib/server/validation';
import { BCRYPT_ROUNDS, RATE_LIMIT_MAX_AUTH } from '@/lib/server/env';
import { rateLimitByIp, getClientIp } from '@/lib/server/rate-limit';

export async function POST(req: NextRequest) {
  try {
    rateLimitByIp('auth:register', getClientIp(req), RATE_LIMIT_MAX_AUTH);
    const body = registerSchema.parse(await req.json());
    const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    try {
      await prisma.user.create({
        data: { email: body.email, password: hashedPassword, name: body.name },
      });
    } catch (e: unknown) {
      if (isPrismaCode(e, 'P2002')) {
        return fail('CONFLICT', 'User already exists with this email');
      }
      throw e;
    }
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/auth/register');
  }
}
