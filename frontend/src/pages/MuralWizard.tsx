import React, { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { SegmentationOverlay } from '../components/SegmentationOverlay';
import { CornerAdjuster } from '../components/CornerAdjuster';
import { SegmentMask, Point } from '../types/core';
import { segmentImage, warpImage, fileToBase64 } from '../utils/api';

type MuralStep = 
  | 'project_white'
  | 'capture_scene'
  | 'segment'
  | 'select_mural'
  | 'adjust_corners'
  | 'choose_content'
  | 'warp_preview'
  | 'project_output';

export const MuralWizard: React.FC = () => {
  const [step, setStep] = useState<MuralStep>('project_white');
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [masks, setMasks] = useState<SegmentMask[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [muralCorners, setMuralCorners] = useState<Point[]>([]);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [warpedUrl, setWarpedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (blob: Blob) => {
    setSceneUrl(URL.createObjectURL(blob));
    setStep('segment');
    setLoading(true);
    try {
      const result = await segmentImage(blob);
      setMasks(result);
      setStep('select_mural');
    } catch (e) {
      console.error(e);
      alert('Segmentation failed');
      setStep('capture_scene');
    } finally {
      setLoading(false);
    }
  };

  const handleMuralSelect = (id: string) => {
    setSelectedSegmentId(id);
  };

  const confirmSelection = () => {
    if (!selectedSegmentId) return;
    const mask = masks.find(m => m.id === selectedSegmentId);
    if (mask) {
      const xs = mask.polygon.map(p => p.x);
      const ys = mask.polygon.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      setMuralCorners([
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ]);
      setStep('adjust_corners');
    }
  };

  const handleCornerConfirm = (corners: Point[]) => {
    setMuralCorners(corners);
    setStep('choose_content');
  };

  const handleContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContentFile(file);
      setContentUrl(URL.createObjectURL(file));
    }
  };

import { computeHomography } from '../utils/homography';

// ... inside generateWarp ...
  const generateWarp = async () => {
     if (!contentFile || !contentUrl) return;
     setLoading(true);
     try {
       const base64Content = await fileToBase64(contentFile);
       
       // REAL HOMOGRAPHY COMPUTATION
       // Source corners: (0,0), (W,0), (W,H), (0,H)
       // We need actual image dimensions of the content
       const img = new Image();
       img.src = contentUrl;
       await new Promise(r => img.onload = r);
       const W = img.naturalWidth;
       const H = img.naturalHeight;
       
       const srcPoints = [
           {x: 0, y: 0},
           {x: W, y: 0},
           {x: W, y: H},
           {x: 0, y: H}
       ];
       
       // Destination points are muralCorners (which are in camera image space)
       // However, we want to project to the SCREEN space. 
       // If the camera is the projector (co-located) and full-screen, 
       // we assume camera pixels ≈ projector pixels for this MVP.
       // Ideally we map Camera -> Projector via calibration.
       // For now, we assume 1:1 mapping (simple feedback loop).
       
       // computeHomography(src, dst)
       const homographyMatrix = computeHomography(srcPoints, muralCorners);
       
       const res = await warpImage({
         contentImageUrl: base64Content,
         homography: homographyMatrix,
         outputWidth: 1920, // Should ideally match projector resolution or window.innerWidth
         outputHeight: 1080
       });
       setWarpedUrl(res);
       setStep('warp_preview');
     } catch (e) {
       console.error(e);
       alert('Warp failed');
       setStep('choose_content');
     } finally {
       setLoading(false);
     }
  };

  if (step === 'project_output') {
      return (
          <div style={{ width: '100vw', height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {warpedUrl && <img src={warpedUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
              <button 
                onClick={() => setStep('warp_preview')}
                style={{ position: 'fixed', top: 20, left: 20, zIndex: 100 }}
              >
                Exit
              </button>
          </div>
      );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      {step === 'project_white' && (
         <div style={{ textAlign: 'center' }}>
             <h2>Step 1: Project White</h2>
             <p>Ensure your projector is connected and displaying a white screen.</p>
             <button onClick={() => setStep('capture_scene')} style={{ padding: 20, fontSize: 18 }}>
                I'm Ready - Start Capture
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
            <h3>Analyzing scene...</h3>
            {loading && <p>Sending image to SAM...</p>}
          </div>
      )}

      {step === 'select_mural' && sceneUrl && (
          <div>
              <h3>Select Mural Surface</h3>
              <p>Tap the surface you want to map onto.</p>
              <div style={{ border: '2px solid #ccc' }}>
                <SegmentationOverlay 
                    imageUrl={sceneUrl} 
                    masks={masks} 
                    selectedIds={selectedSegmentId ? [selectedSegmentId] : []}
                    onToggleSelect={handleMuralSelect}
                />
              </div>
              <button disabled={!selectedSegmentId} onClick={confirmSelection} style={{marginTop: 20, padding: 10, width: '100%'}}>
                  Confirm Selection
              </button>
          </div>
      )}

      {step === 'adjust_corners' && sceneUrl && (
          <div>
              <h3>Adjust Corners</h3>
              <p>Drag the corners to match the surface exactly.</p>
              <div style={{ border: '2px solid #ccc' }}>
                <CornerAdjuster 
                    imageUrl={sceneUrl}
                    initialCorners={muralCorners}
                    onConfirm={handleCornerConfirm}
                />
              </div>
          </div>
      )}
      
      {step === 'choose_content' && (
          <div>
              <h3>Choose Content</h3>
              <input type="file" accept="image/*" onChange={handleContentUpload} />
              {contentUrl && (
                  <div>
                      <img src={contentUrl} style={{ maxWidth: 200, marginTop: 10 }} />
                      <br/>
                      <button onClick={generateWarp} style={{marginTop: 10, padding: 10}}>
                          {loading ? 'Warping...' : 'Next: Preview'}
                      </button>
                  </div>
              )}
          </div>
      )}

      {step === 'warp_preview' && warpedUrl && (
          <div>
              <h3>Preview</h3>
              <div style={{ border: '1px solid #333' }}>
                  <img src={warpedUrl} style={{ width: '100%' }} />
              </div>
              <br/>
              <button onClick={() => setStep('project_output')} style={{marginTop: 10, padding: 20, width: '100%', fontSize: 18, background: 'green', color: 'white'}}>
                  Project Output (Fullscreen)
              </button>
          </div>
      )}
    </div>
  );
};

