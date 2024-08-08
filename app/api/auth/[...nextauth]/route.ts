import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import prisma from "../../util/prisma";

export const authOptions: NextAuthOptions = {
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
          return null; // Return null for missing credentials
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null; // Return null if no user found
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null; // Return null if password is invalid
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          channelId: user.channelId,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'github' || account.provider === 'google') {
        if (user) {
          await prisma.user.upsert({
            where: { email: user.email as string },
            update: {
              name: user.name as string,
              image: user.image as string,
            },
            create: {
              email: user.email as string,
              name: user.name as string,
              image: user.image as string,
            },
          });
        }
        return true;
      }

      // If using CredentialsProvider, just return true if the user exists
      if (user && user.email) {
        return true;
      }
      return false; // Ensure invalid credentials are handled
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as number;
        session.user.channelId = token.channelId as number | undefined;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.channelId = session.channelId;
      }
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.channelId = dbUser.channelId;
        }
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/logIn', // Redirect to custom login page
  },
  // debug: true
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };