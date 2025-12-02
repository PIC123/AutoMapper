export type Point = { x: number; y: number };

export type SegmentMask = {
  id: string;
  polygon: Point[];    // in image pixel coordinates
  area: number;        // number of pixels or approximate area
};

export type Mode = 'mural' | 'multi';

export type SurfaceSelection = {
  segmentId: string;
  polygon: Point[];    // possibly refined polygon
};

export type Homography = number[]; // 3x3 matrix, flattened row-major length 9

export type WarpRequest = {
  contentImageUrl: string;  // or base64
  homography: Homography;
  outputWidth: number;
  outputHeight: number;
};

export type WarpResponse = {
  warpedImageUrl: string; // or base64-encoded PNG
};

