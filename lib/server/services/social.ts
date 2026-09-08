import prisma from '../db';
import { AppError, isPrismaCode } from '../http';
import { MAX_PAGE_SIZE } from '../env';
import { timeSince } from '../presenters';

export const reactionService = {
  async get(videoId: string, _userId: number) {
    const [video, reaction] = await Promise.all([
      prisma.video.findUnique({ where: { id: videoId }, select: { id: true } }),
      prisma.reaction.findUnique({
        where: { videoId_userId: { videoId, userId: _userId } },
      }),
    ]);
    if (!video) throw new AppError('NOT_FOUND', 'Video not found');
    return reaction?.type ?? null;
  },

  async set(videoId: string, userId: number, type: 'LIKE' | 'DISLIKE') {
    const video = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } });
    if (!video) throw new AppError('NOT_FOUND', 'Video not found');
    const existing = await prisma.reaction.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
    if (existing) {
      if (existing.type === type) return { status: 'exists' as const };
      await prisma.reaction.update({
        where: { videoId_userId: { videoId, userId } },
        data: { type },
      });
      return { status: 'updated' as const };
    }
    try {
      await prisma.reaction.create({ data: { videoId, userId, type } });
    } catch (e: unknown) {
      if (isPrismaCode(e, 'P2002')) return { status: 'exists' as const };
      if (isPrismaCode(e, 'P2003')) throw new AppError('NOT_FOUND', 'Video not found');
      throw e;
    }
    return { status: 'created' as const };
  },

  async remove(videoId: string, userId: number) {
    try {
      await prisma.reaction.delete({ where: { videoId_userId: { videoId, userId } } });
    } catch (e: unknown) {
      if (isPrismaCode(e, 'P2025')) throw new AppError('NOT_FOUND', 'Reaction not found');
      throw e;
    }
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
    if (!channel) throw new AppError('NOT_FOUND', 'Channel not found');
    if (channel.userId === userId) throw new AppError('BAD_REQUEST', 'Cannot subscribe to your own channel');
    try {
      const created = await prisma.subscription.create({ data: { userId, channelId } });
      return { status: 'created' as const, subscription: created };
    } catch (e: unknown) {
      if (isPrismaCode(e, 'P2002')) {
        return { status: 'exists' as const, subscription: null };
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
      if (isPrismaCode(e, 'P2025')) {
        throw new AppError('NOT_FOUND', 'Subscription not found');
      }
      throw e;
    }
  },

  async listForUser(userId: number, page?: number, limit?: number) {
    const p = Math.max(1, Math.floor(page ?? 1));
    const l = Math.min(Math.max(1, Math.floor(limit ?? 20)), MAX_PAGE_SIZE);
    const subs = await prisma.subscription.findMany({
      where: { userId },
      skip: (p - 1) * l,
      take: l,
      select: { channel: { select: { id: true, name: true, image: true } } },
    });
    return subs.map((s) => ({ id: s.channel.id, name: s.channel.name, image: s.channel.image }));
  },

  async feedForUser(userId: number, page = 1, limit = 20) {
    const p = Math.max(1, Math.floor(page));
    const l = Math.min(Math.max(1, Math.floor(limit)), MAX_PAGE_SIZE);
    const videos = await prisma.video.findMany({
      where: { channel: { subscriptions: { some: { userId } } } },
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * l,
      take: l,
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
    try {
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
    } catch (e: unknown) {
      if (isPrismaCode(e, 'P2003')) throw new AppError('NOT_FOUND', 'Video or user not found');
      throw e;
    }
  },

  async list(videoId: string, page = 1, limit = 50) {
    const p = Math.max(1, Math.floor(page));
    const l = Math.min(Math.max(1, Math.floor(limit)), MAX_PAGE_SIZE);
    const [video, comments] = await Promise.all([
      prisma.video.findUnique({ where: { id: videoId }, select: { id: true } }),
      prisma.comment.findMany({
        where: { videoId },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: { select: { name: true, image: true } },
        },
      }),
    ]);
    if (!video) throw new AppError('NOT_FOUND', 'Invalid video ID');
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
