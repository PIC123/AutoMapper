import React, { useState } from 'react';
import { SegmentMask } from '../types/core';

type SegmentationOverlayProps = {
  imageUrl: string;
  masks: SegmentMask[];
  selectedIds: string[];
  onToggleSelect: (segmentId: string) => void;
  onImageLoaded?: (width: number, height: number) => void;
};

export const SegmentationOverlay: React.FC<SegmentationOverlayProps> = ({ 
  imageUrl, 
  masks, 
  selectedIds, 
  onToggleSelect,
  onImageLoaded
}) => {
  const [dimensions, setDimensions] = useState<{width: number, height: number} | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const dims = { width: img.naturalWidth, height: img.naturalHeight };
    setDimensions(dims);
    if (onImageLoaded) {
      onImageLoaded(dims.width, dims.height);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img 
        src={imageUrl} 
        alt="Scene" 
        onLoad={handleImageLoad}
        style={{ display: 'block', width: '100%', height: 'auto' }} 
      />
      
      {dimensions && (
        <svg 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'auto'
          }}
        >
          {masks.map(mask => {
            const isSelected = selectedIds.includes(mask.id);
            const points = mask.polygon.map(p => `${p.x},${p.y}`).join(' ');
            
            return (
              <polygon
                key={mask.id}
                points={points}
                fill={isSelected ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
                stroke={isSelected ? 'green' : 'white'}
                strokeWidth="2"
                onClick={() => onToggleSelect(mask.id)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

