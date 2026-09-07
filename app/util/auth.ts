import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from "next-auth";
import prisma from "../api/util/prisma";
import { env, BCRYPT_ROUNDS } from "@/lib/server/env";

export const authOptions: NextAuthOptions = {
    secret: env.nextAuthSecret,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                const email = credentials.email.trim().toLowerCase();
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user?.password) {
                    return null;
                }
                const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                if (!isValidPassword) {
                    return null;
                }
                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    channelId: user.channelId,
                } as any;
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'github' || account?.provider === 'google') {
                if (!user?.email) return false;
                const email = user.email.trim().toLowerCase();
                // Only fill null profile fields; never overwrite user-set values.
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    await prisma.user.update({
                        where: { email },
                        data: {
                            name: existing.name ?? user.name ?? undefined,
                            image: existing.image ?? user.image ?? undefined,
                        },
                    });
                } else {
                    await prisma.user.create({
                        data: {
                            email,
                            name: user.name ?? null,
                            image: user.image ?? null,
                        },
                    });
                }
                return true;
            }
            if (user?.email) {
                return true;
            }
            return false;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id as unknown as string;
                (session.user as any).channelId = token.channelId as number | undefined;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                token.channelId = (session as { channelId?: number }).channelId;
            }
            if (user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email.trim().toLowerCase() },
                    select: { id: true, channelId: true },
                });
                if (dbUser) {
                    (token as any).id = String(dbUser.id);
                    (token as any).channelId = dbUser.channelId;
                }
            }
            return token;
        }
    },
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/logIn',
    },
};

export { BCRYPT_ROUNDS };
