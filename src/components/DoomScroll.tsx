'use client';

import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFilters } from '@/context/FiltersProvider';
import { fetchUnsplashImages } from '@/lib/unsplash';
import { useResponsiveLaneCount } from '@/lib/useResponsiveLaneCount';
import { LoaderIcon } from 'lucide-react';

export const DoomScroll = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const lanes = useResponsiveLaneCount();
  const { filters } = useFilters();

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['unsplash-images', JSON.stringify(filters)],
    queryFn: ({ pageParam, signal }) => fetchUnsplashImages(filters, pageParam, signal),
    getNextPageParam: (lastPage) =>
      lastPage.nextPage <= lastPage.images.total_pages ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });

  const images = data?.pages?.flatMap((page) => page.images.results) || [];

  const rowVirtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const image = images[i]; // We estimate image size based on aspect ratio, not the image height itself.
      const aspectRatio = image.width / image.height;
      const laneWidth = (parentRef.current?.clientWidth ?? window.innerWidth) / lanes;
      return Math.round(laneWidth / aspectRatio);
    },
    scrollMargin: 32,
    overscan: 5,
    lanes,
  });

  useEffect(() => {
    const controller = new AbortController();

    const handleScroll = () => {
      if (isFetchingNextPage || !hasNextPage) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = rowVirtualizer.getTotalSize();
      const threshold = documentHeight - window.innerHeight * 2;

      if (scrollBottom >= threshold) fetchNextPage();
    };

    window.addEventListener('scroll', handleScroll, {
      signal: controller.signal,
      passive: true,
    });

    return () => controller.abort();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, rowVirtualizer.getTotalSize]);

  return (
    <main
      ref={parentRef}
      className="relative container mx-auto min-h-screen"
      style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const image = images[virtualRow.index];
        return (
          <motion.div
            key={virtualRow.index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 p-2"
            style={{
              left: `${(virtualRow.lane / lanes) * 100}%`,
              width: `${100 / lanes}%`,
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <img
              src={image.urls.thumb}
              alt={image.alt_description || ''}
              width={image.width}
              height={image.height}
              className="size-full rounded-lg object-cover"
              srcSet={`${image.urls.thumb} 1x, ${image.urls.small} 2x, ${image.urls.regular} 3x`}
            />
          </motion.div>
        );
      })}

      {status === 'pending' && (
        <motion.div
          className="grid h-screen place-items-center text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }} // No need to show if internet connection is quick
        >
          <LoaderIcon className="w-6 animate-spin" />
        </motion.div>
      )}
    </main>
  );
};
