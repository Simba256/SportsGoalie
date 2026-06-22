'use client';

import { MeshGradient } from '@paper-design/shaders-react';
import { useEffect, useState } from 'react';

interface MeshGradientBgProps {
  colors?: string[];
  distortion?: number;
  swirl?: number;
  speed?: number;
  offsetX?: number;
  veilOpacity?: number;
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function MeshGradientBg({
  colors = [
    '#060f28',
    '#0f2847',
    '#1F3864',
    '#1850b4',
    '#37b5ff',
    '#0a2040',
  ],
  distortion = 0.9,
  swirl = 0.7,
  speed = 0.38,
  offsetX = 0.06,
  veilOpacity = 0.45,
}: MeshGradientBgProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setWebglSupported(checkWebGL());
    setMounted(true);
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!mounted) return null;

  if (!webglSupported) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(145deg, ${colors[0] ?? '#060f28'} 0%, ${colors[2] ?? '#1F3864'} 50%, ${colors[0] ?? '#060f28'} 100%)`,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <>
      <MeshGradient
        width={dimensions.width}
        height={dimensions.height}
        colors={colors}
        distortion={distortion}
        swirl={swirl}
        grainMixer={0}
        grainOverlay={0}
        speed={speed}
        offsetX={offsetX}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Dark veil so text stays readable over the bright gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(6, 15, 40, ${veilOpacity})`,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
