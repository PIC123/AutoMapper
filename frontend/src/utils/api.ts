import { SegmentMask, WarpRequest } from '../types/core';

// For local development with Azure Functions: http://localhost:7071/api
// For production, this will be your Azure Function App URL.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

export const fileToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const res = reader.result as string;
        // Keep the prefix for display, but API might want clean base64.
        // Our backend logic now handles the prefix separation.
        resolve(res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function segmentImage(imageBlob: Blob): Promise<SegmentMask[]> {
  // Convert blob to base64 for JSON payload
  const base64Image = await fileToBase64(imageBlob);

  const res = await fetch(`${API_BASE}/segment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });

  if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Segment request failed: ${txt}`);
  }
  const data = await res.json();
  return data.masks as SegmentMask[];
}

export async function warpImage(req: WarpRequest): Promise<string> {
  const res = await fetch(`${API_BASE}/warp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Warp request failed: ${txt}`);
  }
  const data = await res.json();
  return data.warpedImageUrl as string;
}
