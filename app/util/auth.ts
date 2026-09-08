import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import prisma from "@/lib/server/db";
import { env, BCRYPT_ROUNDS } from "@/lib/server/env";

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  providers: [
    ...(env.githubId && env.githubSecret
      ? [
          GithubProvider({
            clientId: env.githubId,
            clientSecret: env.githubSecret,
          }),
        ]
      : []),
    ...(env.googleClientId && env.googleClientSecret
      ? [
          GoogleProvider({
            clientId: env.googleClientId,
            clientSecret: env.googleClientSecret,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
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
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        if (!user?.email) return false;
        const email = user.email.trim().toLowerCase();
        // Only fill null profile fields; never overwrite user-set values.
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          const data: { name?: string | null; image?: string | null } = {};
          const nextName = existing.name ?? user.name ?? null;
          const nextImage = existing.image ?? user.image ?? null;
          if (nextName !== existing.name) data.name = nextName;
          if (nextImage !== existing.image) data.image = nextImage;
          if (Object.keys(data).length > 0) {
            await prisma.user.update({ where: { email }, data });
          }
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
        session.user.id = (token.id as string | undefined) ?? "";
        session.user.channelId = (token.channelId as number | null | undefined) ?? null;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.channelId = (session as { channelId?: number | null }).channelId ?? null;
      }
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.trim().toLowerCase() },
          select: { id: true, channelId: true },
        });
        if (dbUser) {
          token.id = String(dbUser.id);
          token.channelId = dbUser.channelId;
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/logIn",
  },
};
