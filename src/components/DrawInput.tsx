'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Stroke } from '@/types/drawing';

type DrawEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

const DRAWING_WIDTH = 800;
const DRAWING_HEIGHT = 600;
const DRAWING_FILL_COLOR = '#f3f3f3';
const LINE_WIDTH = 8;

interface Props {
  ref: React.RefObject<HTMLCanvasElement | null>;
  color: string;
  strokes: Stroke[];
  currentStroke: [number, number, number][];
  onStartStroke: (points: [number, number, number][]) => void;
  onUpdateStroke: (points: [number, number, number][]) => void;
  onEndStroke: () => void;
}

export const DrawInput = ({
  ref,
  color,
  strokes,
  currentStroke,
  onStartStroke,
  onUpdateStroke,
  onEndStroke,
}: Props) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);

  const drawStroke = useCallback((stroke: Stroke) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const points = stroke.points;
    if (points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = ref.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = DRAWING_FILL_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Completed strokes
    strokes.forEach(drawStroke);

    // In-progress stroke
    if (currentStroke.length > 0) {
      drawStroke({ points: currentStroke, color });
    }
  }, [currentStroke, color, drawStroke, strokes, ref]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    const ctx = ctxRef.current;
    if (!ctx) return;

    canvas.width = DRAWING_WIDTH;
    canvas.height = DRAWING_HEIGHT;
    ctx.fillStyle = DRAWING_FILL_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    redrawCanvas();
    rectRef.current = canvas.getBoundingClientRect();
  }, [redrawCanvas, ref]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCoordinates = useCallback(
    (e: MouseEvent | React.Touch) => {
      const canvas = ref.current;
      if (!canvas || !rectRef.current) return null;

      const rect = rectRef.current;
      const clientX = e instanceof MouseEvent ? e.clientX : e.clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.clientY;

      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    },
    [ref],
  );

  const startDrawing = useCallback(
    (e: DrawEvent) => {
      const c = getCoordinates('touches' in e ? e.touches[0] : e.nativeEvent);
      if (!c) return;
      setIsDrawing(true);
      onStartStroke([[c.x, c.y, 0.5]]);
    },
    [getCoordinates, onStartStroke],
  );

  const draw = useCallback(
    (e: DrawEvent) => {
      if (!isDrawing) return;
      const c = getCoordinates('touches' in e ? e.touches[0] : e.nativeEvent);
      if (!c) return;
      onUpdateStroke([...currentStroke, [c.x, c.y, 0.5]]);
    },
    [isDrawing, getCoordinates, onUpdateStroke, currentStroke],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onEndStroke();
  }, [isDrawing, onEndStroke]);

  return (
    <canvas
      ref={ref}
      className="block w-full cursor-crosshair"
      style={{ aspectRatio: `${DRAWING_WIDTH}/${DRAWING_HEIGHT}` }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};
