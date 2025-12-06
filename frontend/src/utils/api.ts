import { SegmentMask, WarpRequest } from '../types/core';

// CHANGE THIS to your ngrok URL when running on mobile
// e.g., 'https://your-ngrok-id.ngrok-free.app'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fileToBase64 = (blob: Blob): Promise<string> => {
// ... existing code ...
