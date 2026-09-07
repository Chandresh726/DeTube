import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      channelId?: number | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    channelId?: number | null;
  }
}
