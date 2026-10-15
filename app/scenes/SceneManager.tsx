import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useArchiveStore } from '../state/archive';

const TerrainCanvas = lazy(() => import('./TerrainCanvas'));

export function hasWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { useArchiveStore.getState().setRenderer('none'); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** One optional terrain viewport. MapLibre and R3F never own active contexts together.
 * Phase 2 can pass licensed geometry as children; artwork remains the SSR fallback.
 * Mount this at a single exhibition instrument, not once per field record.
 */
export function SceneManager({ children, fallback, label }: { children: ReactNode; fallback: ReactNode; label: string }) {
  const renderer = useArchiveStore(s => s.renderer);
  const setRenderer = useArchiveStore(s => s.setRenderer);
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(hasWebGL()); }, []);
  useEffect(() => () => { if (useArchiveStore.getState().renderer === 'terrain') setRenderer('none'); }, [setRenderer]);
  return <section aria-label={label}>
    {supported && renderer !== 'terrain' && <button type="button" onClick={() => setRenderer('terrain')}>Explore the conceptual 3D study</button>}
    {renderer === 'terrain' && supported ? <>
      <button type="button" onClick={() => setRenderer('none')}>Return to illustration</button>
      <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><TerrainCanvas>{children}</TerrainCanvas></Suspense></SceneBoundary>
    </> : fallback}
  </section>;
}
