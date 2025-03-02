'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoaderIcon, PencilIcon, RotateCcwIcon, SearchIcon } from 'lucide-react';
import { DrawInput } from '@/components/DrawInput';
import { DockItem } from '@/components/DockItem';
import { useFilters } from '@/context/FiltersProvider';
import type { Stroke } from '@/types/drawing';
import type { DrawQueryResponse } from '@/app/api/drawing/route';

type Color = {
  name: string;
  hex: string;
};

const colors: Color[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'Rose', hex: '#ff6b6b' },
  { name: 'Sage', hex: '#7fb069' },
  { name: 'Ocean', hex: '#4a90e2' },
  { name: 'Amber', hex: '#ffd93d' },
  { name: 'Lavender', hex: '#9f7aea' },
];

export const Dock = () => {
  const { filters, dispatch } = useFilters();
  const [showDrawInput, setShowDrawInput] = useState(false);
  const [color, setColor] = useState(colors[0].hex);
  const [currentStroke, setCurrentStroke] = useState<[number, number, number][]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartStroke = useCallback((points: [number, number, number][]) => {
    setCurrentStroke(points);
  }, []);

  const handleUpdateStroke = useCallback((points: [number, number, number][]) => {
    setCurrentStroke(points);
  }, []);

  const handleEndStroke = useCallback(() => {
    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke, color }]);
      setCurrentStroke([]);
    }
  }, [currentStroke, color]);

  const resetCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
  }, []);

  const submitCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    try {
      const base64 = canvas.toDataURL('image/png');
      const response = await fetch(base64);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'drawing.png');
      const res = await fetch('/api/drawing', {
        method: 'POST',
        body: formData,
      });
      const json: DrawQueryResponse = await res.json();
      dispatch({ type: 'SET_QUERY', payload: json.query });
      setShowDrawInput(false);
    } catch (error) {
      console.error('Error submitting drawing:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const toggleDrawing = useCallback(() => {
    setShowDrawInput((prev) => !prev);
  }, []);

  const baseListStyles = 'flex items-center justify-center gap-2';

  return (
    <div className="fixed bottom-6 grid w-full place-items-center gap-3">
      <motion.nav
        layout="preserve-aspect"
        className="relative z-10 row-start-2 flex items-center rounded-full border border-slate-200 bg-white p-2 shadow-xl"
      >
        <ul className={baseListStyles}>
          <li>
            <DockItem onClick={toggleDrawing} title="Draw" icon={PencilIcon} disabled={isLoading} />
          </li>

          <AnimatePresence mode="wait">
            <motion.li
              key={showDrawInput ? 'show-draw' : 'hide-draw'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              {showDrawInput ? (
                <ul className={baseListStyles}>
                  <li>
                    <DockItem
                      onClick={resetCanvas}
                      title="Reset"
                      icon={RotateCcwIcon}
                      disabled={isLoading}
                    />
                  </li>

                  {colors.map((c) => (
                    <li key={c.hex}>
                      <DockItem
                        onClick={() => setColor(c.hex)}
                        title={c.name}
                        color={c.hex}
                        active={color === c.hex}
                        disabled={isLoading}
                      />
                    </li>
                  ))}

                  <li>
                    <DockItem
                      onClick={submitCanvas}
                      title="Search"
                      icon={isLoading ? LoaderIcon : SearchIcon}
                      disabled={isLoading}
                      className={isLoading ? 'animate-spin' : ''}
                    />
                  </li>
                </ul>
              ) : (
                <h1 className="pr-2 pl-1 text-sm font-medium text-slate-700">
                  {filters.query
                    ? `Searching "${filters.query}"`
                    : 'Ever wanted to draw to search images? Me neither'}
                </h1>
              )}
            </motion.li>
          </AnimatePresence>
        </ul>
      </motion.nav>

      <AnimatePresence>
        {showDrawInput && (
          <motion.div
            initial={{ opacity: 0, y: 300, scale: 0.1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 300, scale: 0.1 }}
            transition={{ originY: 0 }}
          >
            <div className="max-w-2xl rounded-lg border-8 border-white shadow-lg">
              <DrawInput
                ref={canvasRef}
                color={color}
                strokes={strokes}
                currentStroke={currentStroke}
                onStartStroke={handleStartStroke}
                onUpdateStroke={handleUpdateStroke}
                onEndStroke={handleEndStroke}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
