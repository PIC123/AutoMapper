import React, { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { SegmentationOverlay } from '../components/SegmentationOverlay';
import { SegmentMask } from '../types/core';
import { segmentImage } from '../utils/api';

type MultiStep =
  | 'project_white'
  | 'capture_scene'
  | 'segment'
  | 'select_surfaces'
  | 'project_output';

export const MultiSurfaceWizard: React.FC = () => {
  const [step, setStep] = useState<MultiStep>('project_white');
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [masks, setMasks] = useState<SegmentMask[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgDimensions, setImgDimensions] = useState<{width: number, height: number} | null>(null);

  const handleCapture = async (blob: Blob) => {
    setSceneUrl(URL.createObjectURL(blob));
    setStep('segment');
    setLoading(true);
    try {
      const result = await segmentImage(blob);
      setMasks(result);
      setStep('select_surfaces');
    } catch (e) {
      console.error(e);
      alert('Segmentation failed');
      setStep('capture_scene');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
        {step === 'project_white' && (
            <div style={{ textAlign: 'center' }}>
                <h2>Multi-Surface Mode</h2>
                <p>Project white light to illuminate the scene.</p>
                <button onClick={() => setStep('capture_scene')} style={{ padding: 20, fontSize: 18 }}>
                    Start Capture
                </button>
            </div>
        )}

        {step === 'capture_scene' && (
            <div style={{ height: '70vh' }}>
                <h3>Capture Scene</h3>
                <CameraCapture onCapture={handleCapture} />
            </div>
        )}

        {step === 'segment' && (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <h3>Scanning surfaces...</h3>
                {loading && <p>Please wait...</p>}
            </div>
        )}

        {step === 'select_surfaces' && sceneUrl && (
            <div>
                <h3>Select Surfaces to Illuminate</h3>
                <p>Tap multiple objects.</p>
                <div style={{ border: '2px solid #ccc' }}>
                    <SegmentationOverlay 
                        imageUrl={sceneUrl} 
                        masks={masks} 
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onImageLoaded={(w, h) => setImgDimensions({width: w, height: h})}
                    />
                </div>
                <button 
                    onClick={() => setStep('project_output')} 
                    disabled={selectedIds.length === 0}
                    style={{marginTop: 20, padding: 10, width: '100%', background: 'blue', color: 'white'}}
                >
                    Project Selected ({selectedIds.length})
                </button>
            </div>
        )}

        {step === 'project_output' && (
            <div style={{ 
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
                {/* 
                    Composite View:
                    Draw the selected masks as white on black.
                */}
                {imgDimensions && (
                    <svg viewBox={`0 0 ${imgDimensions.width} ${imgDimensions.height}`} style={{ width: '100%', height: '100%' }}>
                         {masks.filter(m => selectedIds.includes(m.id)).map(mask => (
                             <polygon 
                                 key={mask.id} 
                                 points={mask.polygon.map(p => `${p.x},${p.y}`).join(' ')} 
                                 fill="white" 
                             />
                         ))}
                    </svg>
                )}
                
                <button 
                    onClick={() => setStep('select_surfaces')}
                    style={{ position: 'fixed', bottom: 20, left: 20 }}
                >
                    Back
                </button>
            </div>
        )}
    </div>
  );
};

