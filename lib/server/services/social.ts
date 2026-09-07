import prisma from "@/app/api/util/prisma";
import { AppError } from "../http";

export const reactionService = {
  async get(videoId: string, userId: number) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new AppError("NOT_FOUND", "Video not found");
    const reaction = await prisma.reaction.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
    return reaction?.type ?? null;
  },

  async set(videoId: string, userId: number, type: "LIKE" | "DISLIKE") {
    const [user, video] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.video.findUnique({ where: { id: videoId } }),
    ]);
    if (!user) throw new AppError("NOT_FOUND", "User not found");
    if (!video) throw new AppError("NOT_FOUND", "Video not found");
    const existing = await prisma.reaction.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
    if (existing) {
      if (existing.type === type) return { status: "exists" as const };
      await prisma.reaction.update({
        where: { videoId_userId: { videoId, userId } },
        data: { type },
      });
      return { status: "updated" as const };
    }
    await prisma.reaction.create({ data: { videoId, userId, type } });
    return { status: "created" as const };
  },

  async remove(videoId: string, userId: number) {
    const existing = await prisma.reaction.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Reaction not found");
    await prisma.reaction.delete({ where: { videoId_userId: { videoId, userId } } });
  },
};

export const subscriptionService = {
  async isSubscribed(userId: number, channelId: number) {
    const existing = await prisma.subscription.findUnique({
      where: { userId_channelId: { userId, channelId } },
    });
    return !!existing;
  },

  async subscribe(userId: number, channelId: number) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new AppError("NOT_FOUND", "Channel not found");
    if (channel.userId === userId) throw new AppError("BAD_REQUEST", "Cannot subscribe to your own channel");
    try {
      const created = await prisma.subscription.create({ data: { userId, channelId } });
      return { status: "created" as const, subscription: created };
    } catch (e: unknown) {
      const { Prisma } = await import("@/app/generated/prisma/client");
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { status: "exists" as const, subscription: null };
      }
      throw e;
    }
  },

  async unsubscribe(userId: number, channelId: number) {
    try {
      await prisma.subscription.delete({
        where: { userId_channelId: { userId, channelId } },
      });
    } catch (e: unknown) {
      const { Prisma } = await import("@/app/generated/prisma/client");
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        throw new AppError("NOT_FOUND", "Subscription not found");
      }
      throw e;
    }
  },

  async listForUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("NOT_FOUND", "Invalid user ID");
    const subs = await prisma.subscription.findMany({
      where: { userId },
      select: { channel: { select: { id: true, name: true, image: true } } },
    });
    return subs.map((s) => ({ id: s.channel.id, name: s.channel.name, image: s.channel.image }));
  },

  async feedForUser(userId: number, page = 1, limit = 20) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("NOT_FOUND", "Invalid user ID");
    const videos = await prisma.video.findMany({
      where: { channel: { subscriptions: { some: { userId } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        views: true,
        createdAt: true,
        channel: { select: { id: true, name: true, image: true } },
      },
    });
    return videos;
  },
};

export const commentService = {
  async add(videoId: string, userId: number, content: string) {
    const [user, video] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.video.findUnique({ where: { id: videoId } }),
    ]);
    if (!user) throw new AppError("NOT_FOUND", "Invalid user ID");
    if (!video) throw new AppError("NOT_FOUND", "Invalid video ID");
    const created = await prisma.comment.create({
      data: { content, videoId, userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
    return {
      id: created.id,
      content: created.content,
      createdAt: created.createdAt,
      userId: created.user.id,
      name: created.user.name,
      image: created.user.image,
    };
  },

  async list(videoId: string, page = 1, limit = 50) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new AppError("NOT_FOUND", "Invalid video ID");
    const comments = await prisma.comment.findMany({
      where: { videoId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true, image: true } },
      },
    });
    const { timeSince } = await import("../presenters");
    return comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      image: c.user.image,
      content: c.content,
      createdAt: c.createdAt,
      timeSince: timeSince(c.createdAt),
    }));
  },
};
