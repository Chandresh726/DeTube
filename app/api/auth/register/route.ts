import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        });

        return NextResponse.json({ message: 'User created successfully', user }, { status: 200 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
