'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Clapperboard } from 'lucide-react';
import { getHomeVideoData } from '../util/fetch/video';
import VideoCard from './video/VideoCard';
import VideoCardLoading from './loading/VideoCardLoading';
import VideosLoading from './loading/VideosLoading';
import { EmptyState } from '@/components/shared/empty-state';

type HomeVideo = { id: string; [k: string]: unknown };

const PAGE_LIMIT = 12;

const HomePage = () => {
  const [videos, setVideos] = useState<HomeVideo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchVideos = async (p: number) => {
      try {
        setLoading(true);
        const response = await getHomeVideoData(p, PAGE_LIMIT);
        if (cancelled) return;
        const { videos: fresh, totalPages } = response;
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v.id));
          const deduped = (fresh as HomeVideo[]).filter((v) => !seen.has(v.id));
          return [...prev, ...deduped];
        });
        setHasMore(p < totalPages);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load videos');
          toast.error('Failed to load videos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVideos(page);
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (loading && videos.length === 0) return <VideosLoading />;
  if (error && videos.length === 0) {
    return <EmptyState icon={Clapperboard} title="Couldn't load videos" description={error} />;
  }
  if (!loading && videos.length === 0) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="No videos yet"
        description="Be the first to upload a video."
        actionLabel="Upload video"
        actionHref="/uploadVideo"
      />
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video as never} showChannel={true} />
      ))}
      <div ref={sentinelRef} aria-hidden className="col-span-full h-8" />
      {loading && Array.from({ length: 6 }).map((_, i) => <VideoCardLoading key={`home-skeleton-${i}`} />)}
    </div>
  );
};

export default HomePage;
