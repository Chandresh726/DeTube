import prisma from "../db";
import { AppError, isPrismaCode } from "../http";
import { MAX_PAGE_SIZE, TOP_SUPPORTERS_LIMIT } from "../env";
import { formatViews, timeSince, toVideoCard } from "../presenters";

async function requireVideo(id: string) {
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) throw new AppError("NOT_FOUND", "Video not found");
  return video;
}

export const videoService = {
  async getDetails(videoId: string) {
    // Read path first (404 before side effects), then increment views.
    const existing = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, channelId: true },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Video not found");

    const [video, reactionGroups, subscriberCount] = await Promise.all([
      prisma.video.update({
        where: { id: videoId },
        data: { views: { increment: 1 } },
        include: { channel: { select: { id: true, name: true, image: true } } },
      }),
      prisma.reaction.groupBy({
        by: ["type"],
        where: { videoId },
        _count: { type: true },
      }),
      prisma.subscription.count({ where: { channelId: existing.channelId } }),
    ]);

    let likeCount = 0;
    let dislikeCount = 0;
    for (const g of reactionGroups) {
      if (g.type === "LIKE") likeCount = g._count.type;
      else if (g.type === "DISLIKE") dislikeCount = g._count.type;
    }

    // Aggregate top supporters in SQL instead of in-memory reduce+sort.
    const grouped = await prisma.transaction.groupBy({
      by: ["userId"],
      where: { channelId: video.channelId, type: "THANKS", status: "SUCCESS" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: TOP_SUPPORTERS_LIMIT,
    });
    const users =
      grouped.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: grouped.map((g) => g.userId) } },
            select: { id: true, name: true, image: true },
          })
        : [];
    const byId = new Map(users.map((u) => [u.id, u]));
    const supporters = grouped.map((g) => ({
      id: g.userId,
      name: byId.get(g.userId)?.name ?? null,
      image: byId.get(g.userId)?.image ?? null,
      amount: (g._sum.amount ?? 0n).toString(),
    }));

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      views: formatViews(video.views),
      timeSince: timeSince(video.createdAt),
      channel: {
        id: video.channel.id,
        name: video.channel.name,
        image: video.channel.image,
        subscriberCount,
      },
      stats: { likeCount, dislikeCount },
      supporters,
    };
  },

  async getHome(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [videos, totalVideos] = await Promise.all([
      prisma.video.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          views: true,
          createdAt: true,
          channel: { select: { name: true, image: true } },
        },
      }),
      prisma.video.count(),
    ]);
    return {
      videos: videos.map(toVideoCard),
      totalVideos,
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
    };
  },

  async add(input: {
    channelId: number;
    videoId: string;
    title: string;
    description?: string;
    thumbnail: string;
    video: string;
    ownerUserId: number;
  }) {
    const channel = await prisma.channel.findUnique({ where: { id: input.channelId } });
    if (!channel) throw new AppError("NOT_FOUND", "Channel not found");
    if (channel.userId !== input.ownerUserId) {
      throw new AppError("FORBIDDEN", "Cannot upload to a channel you do not own");
    }
    try {
      const created = await prisma.video.create({
        data: {
          id: input.videoId,
          title: input.title,
          description: input.description || null,
          thumbnailUrl: input.thumbnail,
          videoUrl: input.video,
          channelId: input.channelId,
        },
      });
      return created;
    } catch (e) {
      // Let handleRouteError map P2002 (duplicate id) -> 409, P2003 -> 404.
      if (isPrismaCode(e, "P2002")) throw new AppError("CONFLICT", "Video already exists");
      throw e;
    }
  },

  async getLiked(userId: number, page?: number, limit?: number) {
    const p = Math.max(1, Math.floor(page ?? 1));
    const l = Math.min(Math.max(1, Math.floor(limit ?? 20)), MAX_PAGE_SIZE);
    const liked = await prisma.reaction.findMany({
      where: { userId, type: "LIKE" },
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * l,
      take: l,
      select: {
        createdAt: true,
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoUrl: true,
            views: true,
            channel: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    return liked.map((r) => ({
      id: r.video.id,
      title: r.video.title,
      description: r.video.description,
      thumbnailUrl: r.video.thumbnailUrl,
      videoUrl: r.video.videoUrl,
      views: r.video.views,
      likedAt: r.createdAt,
      channel: r.video.channel,
    }));
  },

  async requireVideo(id: string) {
    return requireVideo(id);
  },
};
