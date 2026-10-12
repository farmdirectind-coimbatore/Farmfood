'use client';

import { useQuery } from '@tanstack/react-query';

interface SiteVideo {
  url: string | null;
  updatedAt: string | null;
}

async function fetchSiteVideo(): Promise<SiteVideo> {
  const res = await fetch('/api/site-video');
  if (!res.ok) throw new Error('Failed to load video');
  return res.json();
}

export default function HomePromoVideo() {
  const { data } = useQuery({
    queryKey: ['siteVideo'],
    queryFn: fetchSiteVideo,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (!data?.url) return null;

  return (
    <div className="lg:hidden mt-10 flex justify-center">
      <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/25 bg-black">
        <video
          key={data.url}
          src={data.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}
