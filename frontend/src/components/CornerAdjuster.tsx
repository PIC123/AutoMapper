import React, { useState, useRef } from 'react';
import { Point } from '../types/core';

type CornerAdjusterProps = {
  imageUrl: string;
  initialCorners: Point[];
  onConfirm: (corners: Point[]) => void;
};

export const CornerAdjuster: React.FC<CornerAdjusterProps> = ({ imageUrl, initialCorners, onConfirm }) => {
  const [corners, setCorners] = useState<Point[]>(initialCorners);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getScale = () => {
    if (!imgRef.current) return 1;
    return imgRef.current.clientWidth / imgRef.current.naturalWidth;
  };

  const handleMove = (e: React.PointerEvent) => {
    if (activeCorner === null || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scale = getScale();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const newCorners = [...corners];
    newCorners[activeCorner] = { x, y };
    setCorners(newCorners);
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', touchAction: 'none' }}
      onPointerMove={handleMove}
      onPointerUp={() => setActiveCorner(null)}
      onPointerLeave={() => setActiveCorner(null)}
    >
      <img ref={imgRef} src={imageUrl} style={{ width: '100%', display: 'block' }} draggable={false} />
      {corners.map((p, i) => {
        const scale = imgRef.current ? getScale() : 1;
        return (
          <div
            key={i}
            onPointerDown={(e) => {
              e.stopPropagation();
              setActiveCorner(i);
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerUp={(e) => {
               e.stopPropagation();
               setActiveCorner(null);
               (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            }}
            style={{
              position: 'absolute',
              left: p.x * scale - 15,
              top: p.y * scale - 15,
              width: 30,
              height: 30,
              backgroundColor: 'rgba(255,0,0,0.7)',
              borderRadius: '50%',
              cursor: 'grab',
              zIndex: 10
            }}
          />
        );
      })}
       <button 
        onClick={() => onConfirm(corners)}
        style={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            zIndex: 20
        }}
      >
        Confirm Corners
      </button>
    </div>
  );
};

