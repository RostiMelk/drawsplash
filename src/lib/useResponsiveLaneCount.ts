import { useEffect, useState } from 'react';

export const useResponsiveLaneCount = (): number => {
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const updateColumnCount = (entries: ResizeObserverEntry[]) => {
      const width = entries[0].contentRect.width || window.innerWidth;
      if (width < 300) return setColumnCount(1);
      if (width < 640) return setColumnCount(2);
      if (width < 1024) return setColumnCount(3);
      setColumnCount(4);
    };

    const resizeObserver = new ResizeObserver(updateColumnCount);

    resizeObserver.observe(document.body);

    updateColumnCount([{ contentRect: { width: window.innerWidth } } as ResizeObserverEntry]);

    return () => resizeObserver.disconnect();
  }, []);

  return columnCount;
};
