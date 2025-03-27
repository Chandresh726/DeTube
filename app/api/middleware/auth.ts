import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../util/auth';

export async function authenticateUser(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }
    
    return session;
}
