import { Component, lazy, Suspense, useEffect, useId, useState, type ReactNode } from 'react';
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
  const activeSceneId = useArchiveStore(s => s.activeSceneId);
  const setRenderer = useArchiveStore(s => s.setRenderer);
  const setTerrainScene = useArchiveStore(s => s.setTerrainScene);
  const id = useId();
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(hasWebGL()); }, []);
  useEffect(() => () => { if (useArchiveStore.getState().activeSceneId === id) setRenderer('none'); }, [id, setRenderer]);
  const active = renderer === 'terrain' && activeSceneId === id;
  return <section aria-label={label}>
    {supported && !active && <button type="button" onClick={() => setTerrainScene(id)}>Explore the conceptual 3D study</button>}
    {active && supported ? <>
      <button type="button" onClick={() => setRenderer('none')}>Return to illustration</button>
      <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><TerrainCanvas>{children}</TerrainCanvas></Suspense></SceneBoundary>
    </> : fallback}
  </section>;
}
