import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls } from '@react-three/drei';

export default function TerrainCanvas({ children }: { children: ReactNode }) {
  return <div style={{ height: 'min(70vh, 720px)', minHeight: 320 }}>
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 4, 7], fov: 42 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.4} /><directionalLight position={[4, 8, 3]} intensity={2} />
      {children}<OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={15} enableDamping={false} /><AdaptiveDpr pixelated />
    </Canvas>
  </div>;
}
