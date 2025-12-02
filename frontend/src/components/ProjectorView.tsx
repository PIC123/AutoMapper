import React from 'react';

type PatternType = 'white' | 'checkerboard';

type ProjectorViewProps = {
  pattern: PatternType;
};

export const ProjectorView: React.FC<ProjectorViewProps> = ({ pattern }) => {
  const style: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    overflow: 'hidden'
  };

  if (pattern === 'checkerboard') {
    return (
      <div style={{
        ...style,
        backgroundColor: 'white',
        backgroundImage: `
          linear-gradient(45deg, #000 25%, transparent 25%),
          linear-gradient(-45deg, #000 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #000 75%),
          linear-gradient(-45deg, transparent 75%, #000 75%)
        `,
        backgroundSize: '100px 100px',
        backgroundPosition: '0 0, 0 50px, 50px -50px, -50px 0px'
      }} />
    );
  }

  return (
    <div style={style}>
      {/* Just white screen */}
    </div>
  );
};

