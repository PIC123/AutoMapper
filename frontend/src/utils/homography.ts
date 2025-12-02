import { Point, Homography } from '../types/core';

/**
 * Solves for the Homography Matrix H that maps src points to dst points.
 * src and dst must each have 4 points.
 * Uses Direct Linear Transform (DLT) with SVD (or Gaussian elimination for 8x8).
 * 
 * Since we have exactly 4 correspondences, we have 8 equations and 8 degrees of freedom (h33=1).
 * We can solve Ah = 0.
 */
export function computeHomography(src: Point[], dst: Point[]): Homography {
  if (src.length !== 4 || dst.length !== 4) {
    console.warn("Homography requires exactly 4 point pairs");
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  // Construct matrix A
  // For each pair (x,y) -> (u,v):
  // [ -x, -y, -1,  0,  0,  0, x*u, y*u, u ]
  // [  0,  0,  0, -x, -y, -1, x*v, y*v, v ]
  
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const s = src[i];
    const d = dst[i];
    A.push([-s.x, -s.y, -1, 0, 0, 0, s.x * d.x, s.y * d.x, d.x]);
    A.push([0, 0, 0, -s.x, -s.y, -1, s.x * d.y, s.y * d.y, d.y]);
  }

  // Solve Ah = 0 using Gaussian elimination to find the null space
  // Since we want h33 = 1, we can rearrange to solve 8x8 system.
  // Or closer to standard DLT: perform Gaussian elimination on 8x9 matrix A.
  
  // Gaussian elimination
  const N = 8;
  const M = 9;

  for (let col = 0; col < N; col++) {
    // Pivot
    let maxRow = col;
    for (let row = col + 1; row < N; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) {
        maxRow = row;
      }
    }
    
    // Swap
    [A[col], A[maxRow]] = [A[maxRow], A[col]];

    // Normalize pivot row
    if (Math.abs(A[col][col]) < 1e-8) continue; // Singular?

    for (let row = col + 1; row < N; row++) {
        const factor = A[row][col] / A[col][col];
        for (let k = col; k < M; k++) {
            A[row][k] -= A[col][k] * factor;
        }
    }
  }

  // Back substitution to find h
  const h: number[] = new Array(9).fill(0);
  h[8] = 1; // Constraint

  for (let i = N - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < M; j++) {
          sum += A[i][j] * h[j];
      }
      h[i] = -sum / A[i][i];
  }

  return h;
}
