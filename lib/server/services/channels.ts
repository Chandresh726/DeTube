import prisma from "../db";
import { AppError } from "../http";
import { formatViews, timeSince } from "../presenters";

export const channelService = {
  async getById(channelId: number, page?: number, limit?: number) {
    const paginated = page !== undefined || limit !== undefined;
    const p = page ?? 1;
    const l = limit ?? 20;
    const [channel, subscriberCount] = await Promise.all([
      prisma.channel.findUnique({
        where: { id: channelId },
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          videos: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
              videoUrl: true,
              views: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            ...(paginated ? { skip: (p - 1) * l, take: l } : {}),
          },
        },
      }),
      prisma.subscription.count({ where: { channelId } }),
    ]);
    if (!channel) throw new AppError("NOT_FOUND", "Channel not found");
    return {
      id: channel.id,
      name: channel.name,
      image: channel.image,
      description: channel.description,
      stats: { subscriberCount },
      videos: channel.videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        videoUrl: v.videoUrl,
        views: formatViews(v.views),
        timeSince: timeSince(v.createdAt),
      })),
    };
  },

  async register(ownerUserId: number, input: { channelName: string; description: string; logo: string }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.channel.findUnique({ where: { userId: ownerUserId } });
      if (existing) throw new AppError("CONFLICT", "User already has a channel");
      const created = await tx.channel.create({
        data: {
          name: input.channelName,
          image: input.logo,
          description: input.description,
          userId: ownerUserId,
        },
      });
      // Keep denormalized User.channelId in sync (legacy column, see schema notes).
      await tx.user.update({ where: { id: ownerUserId }, data: { channelId: created.id } });
      return created;
    });
  },
};
