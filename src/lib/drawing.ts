import type { DrawQueryResponse } from '@/app/api/drawing/route';

export async function submitDrawing(canvas: HTMLCanvasElement): Promise<string> {
  const base64 = canvas.toDataURL('image/png');
  const response = await fetch(base64);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('image', blob, 'drawing.png');

  const res = await fetch('/api/drawing', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to submit drawing: ${res.status} ${res.statusText}`);
  }

  const json: DrawQueryResponse = await res.json();
  return json.query;
}
