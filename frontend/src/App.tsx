import React, { useState } from 'react';
import { Mode } from './types/core';
import { MuralWizard } from './pages/MuralWizard';
import { MultiSurfaceWizard } from './pages/MultiSurfaceWizard';
import { ProjectorView } from './components/ProjectorView';

const ModeSelector: React.FC<{ onSelect: (m: Mode) => void }> = ({ onSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
      <h1>AutoMapper</h1>
      <button onClick={() => onSelect('mural')} style={{ padding: 20, fontSize: 20, width: 200, cursor: 'pointer' }}>
        Mural Mode (2D)
      </button>
      <button onClick={() => onSelect('multi')} style={{ padding: 20, fontSize: 20, width: 200, cursor: 'pointer' }}>
        Multi-Surface (3D)
      </button>
      <div style={{ marginTop: 50 }}>
        <a href="/projector" target="_blank" style={{ fontSize: 18 }}>Open Projector View</a>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Simple routing check
  const path = window.location.pathname;
  if (path === '/projector') {
    return <ProjectorView pattern="white" />;
  }

  const [mode, setMode] = useState<Mode | null>(null);

  if (!mode) {
    return <ModeSelector onSelect={setMode} />;
  }

  return (
    <div>
      <div style={{ padding: 10, background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Mode: {mode === 'mural' ? 'Mural (2D)' : 'Multi-Surface'}</span>
        <button onClick={() => setMode(null)} style={{ padding: '5px 10px' }}>Exit to Menu</button>
      </div>
      {mode === 'mural' ? <MuralWizard /> : <MultiSurfaceWizard />}
    </div>
  );
};

export default App;
