import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            name?: string;
            email?: string;
            image?: string;
            channelId?: number;
        }
    }

    interface User {
        id: number;
        channelId?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number;
        channelId?: number;
    }
}
