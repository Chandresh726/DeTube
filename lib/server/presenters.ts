export function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: Array<[number, string]> = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, label] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n === 1 ? '' : 's'} ago`;
  }
  return `${Math.max(0, Math.floor(seconds))} seconds ago`;
}

export function formatViews(count: number): string {
  const table: Array<[number, string]> = [
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1000, 'k'],
  ];
  for (const [threshold, suffix] of table) {
    if (count >= threshold) return `${(count / threshold).toFixed(1)}${suffix}`;
  }
  return String(count);
}

export function toVideoCard(video: {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  createdAt: Date;
  channel: { name: string; image: string | null };
}) {
  return {
    id: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl,
    views: formatViews(video.views),
    timeSince: timeSince(video.createdAt),
    channel: { name: video.channel.name, image: video.channel.image },
  };
}
