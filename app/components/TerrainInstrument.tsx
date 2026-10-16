import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { c, Kicker } from './ui';
import { SectionDiagram } from './SectionDiagram';
import { fetchTerrain, KILAUEA_FEATURES, sampleElevation, type SceneMetrics } from '../data/terrain';
import { useArchiveStore } from '../state/archive';
import styles from '../styles/terrain-instrument.module.css';

const VolcanicScene = lazy(() => import('../scenes/VolcanicScene'));
type TerrainData = Awaited<ReturnType<typeof fetchTerrain>>;
type Mode = 'surface' | 'section';

class TerrainBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function TerrainInstrument({ id = 'terrain-study', context = 'landscape' }: { id?: string; context?: 'landscape' | 'section' }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const automaticAttempt = useRef(false);
  const manualQuality = useRef(false);
  const loadStarted = useRef(0);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [requested, setRequested] = useState(false);
  const [quality, setQuality] = useState<'low' | 'high'>('low');
  const [data, setData] = useState<TerrainData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('The survey remains readable as a static elevation study.');
  const [mode, setMode] = useState<Mode>('surface');
  const [section, setSection] = useState(0);
  const [featureId, setFeatureId] = useState('halemaumau');
  const [metrics, setMetrics] = useState<SceneMetrics | null>(null);
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const renderer = useArchiveStore(s => s.renderer);
  const activeSceneId = useArchiveStore(s => s.activeSceneId);
  const setTerrainScene = useArchiveStore(s => s.setTerrainScene);
  const ownsRenderer = renderer === 'terrain' && activeSceneId === id;
  const active = ownsRenderer && requested && !!data && status !== 'error';
  const selected = KILAUEA_FEATURES.find(f => f.id === featureId) ?? KILAUEA_FEATURES[0];

  const requestScene = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) throw new Error('WebGL2 unavailable');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setStatus('error');
      setMessage('WebGL2 is unavailable. The measured hillshade and section diagram remain fully readable.');
      return;
    }
    loadStarted.current = performance.now();
    setMessage('Loading the elevation grid and terrain engine…');
    setStatus('loading');
    setRequested(true);
    setAttempt(v => v + 1);
    setTerrainScene(id);
  }, [id, setTerrainScene]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');
    const adapt = () => {
      if (!manualQuality.current) setQuality(media.matches ? 'high' : 'low');
    };
    adapt(); media.addEventListener('change', adapt);
    return () => media.removeEventListener('change', adapt);
  }, []);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0.01 });
    observer.observe(element);
    const change = () => setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', change); };
  }, []);

  useEffect(() => {
    if (!visible || automaticAttempt.current) return;
    automaticAttempt.current = true;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number });
    if (window.innerWidth >= 700 && !connection.connection?.saveData && (connection.deviceMemory ?? 4) > 2) requestScene();
  }, [visible, requestScene]);

  useEffect(() => {
    if (!requested) return;
    const abort = new AbortController();
    loadStarted.current = performance.now();
    setStatus('loading'); setData(null); setLoadMs(null); setMetrics(null);
    fetchTerrain(quality, abort.signal).then(value => {
      setData(value);
      setMessage('Elevation samples loaded. Preparing the measured surface…');
    }).catch(error => {
      if (abort.signal.aborted) return;
      setStatus('error'); setMessage(error instanceof Error ? error.message : 'The terrain could not be loaded.');
      if (useArchiveStore.getState().activeSceneId === id) useArchiveStore.getState().setRenderer('none');
    });
    return () => abort.abort();
  }, [requested, quality, id, attempt]);

  useEffect(() => () => {
    if (useArchiveStore.getState().activeSceneId === id) useArchiveStore.getState().setRenderer('none');
  }, [id]);

  const handleFailure = useCallback(() => {
    setStatus('error');
    setMessage('3D rendering is unavailable or its context was lost. The measured hillshade and accessible section diagram remain available.');
    if (useArchiveStore.getState().activeSceneId === id) useArchiveStore.getState().setRenderer('none');
  }, [id]);
  const handleReady = useCallback((value: SceneMetrics) => {
    setMetrics(value); setStatus('ready');
    setLoadMs(previous => previous ?? Math.round(performance.now() - loadStarted.current));
    setMessage('Measured surface ready. Drag to orbit; use the field points and section controls to investigate.');
  }, []);

  function setReveal(value: number) { setSection(value); setMode(value === 0 ? 'surface' : 'section'); }
  function activateSection() { setMode('section'); setSection(v => v === 0 ? 50 : v); }
  function returnToSurface() { setMode('surface'); setSection(0); }
  const state = active ? status : status === 'error' ? 'fallback' : ownsRenderer ? 'loading' : 'static';

  return <section id={id} className={styles.instrument} aria-labelledby={`${id}-title`} data-testid="terrain-instrument" data-scene-state={state} data-mode={mode} data-section={section} data-quality={quality} data-render-active={active && visible && documentVisible} data-triangles={metrics?.triangles ?? 0} data-scene-metrics={metrics ? JSON.stringify({ ...metrics, readyMs: loadMs }) : ''}>
    <div className={styles.heading}><div><Kicker>{context === 'section' ? 'Spatial instrument / 02 — the inferred interior' : 'Spatial instrument / 01 — the measured surface'}</Kicker><h2 id={`${id}-title`}>{context === 'section' ? <>Cut through<br /><em>the earth.</em></> : <>The ground,<br /><em>surveyed.</em></>}</h2></div><div className={styles.introduction}><p>A real elevation record of Kīlauea’s summit. Read the surface, then open a deliberately generalized interpretation of what lies below.</p><div className={styles.legend}><span><i /> OBSERVED / ARCHIVED ELEVATION</span><span><i /> INFERRED / INTERIOR GEOMETRY</span></div></div></div>
    <div className={styles.layout}>
      <div className={styles.viewport}>
        <div ref={stageRef} className={styles.stage} data-testid="terrain-stage">
          <div className={styles.staticArt} aria-hidden={active}>
            {mode === 'section' ? <SectionDiagram reveal={section} /> : <img src="/terrain/kilauea/preview.webp" alt="Hillshade calculated from the archived USGS elevation samples of Kīlauea’s summit" loading="lazy" width="1024" height="1024" />}
          </div>
          {active && data && <div className={styles.canvasHost}><TerrainBoundary key={attempt} onFailure={handleFailure}><Suspense fallback={null}><VolcanicScene manifest={data.manifest} heights={data.heights} grid={data.grid} section={section} mode={mode} featureId={featureId} onFeatureSelect={setFeatureId} onReady={handleReady} onContextLost={handleFailure} active={visible && documentVisible} quality={quality} /></Suspense></TerrainBoundary></div>}
          <div className={styles.stageTop}><span>{!active && mode === 'section' ? 'GENERALIZED DIAGRAM / NOT TO SCALE' : 'KĪLAUEA / SUMMIT STUDY'}</span><span>{active ? '3D / ' : 'STATIC / '}{mode === 'surface' ? 'SURFACE' : `SECTION ${section}%`}</span></div>
          <div className={styles.stageBottom}><span>{active ? 'ARCHIVED SURVEY' : mode === 'surface' ? 'N ↑' : 'GENERALIZED ANATOMY'}<br />{!active && mode === 'section' ? 'DIAGRAM SURFACE / ALSO SCHEMATIC' : `GEOGRAPHIC SCALE / ${data ? `${(data.manifest.widthMeters / 1000).toFixed(2)} × ${(data.manifest.depthMeters / 1000).toFixed(2)} KM` : 'SEE SOURCE RECORD'}`}</span><span>{!active && mode === 'section' ? 'VERTICAL SCALE / NOT REPRESENTATIVE' : `VERTICAL EXAGGERATION / ${data?.manifest.verticalExaggeration ?? 1.5}×`}<br />INTERIOR / SCHEMATIC, NOT DEPTH CALIBRATED</span></div>
          {mode === 'section' && <div className={styles.sectionLegend}><span>UPPER EDGE / {active ? 'OBSERVED DEM' : 'SCHEMATIC SVG'}</span><span>STRATA / GENERALIZED</span><span>CONDUIT + STORAGE / INTERPRETED</span></div>}
          {ownsRenderer && status === 'loading' && <div className={styles.loading} role="status"><span />Preparing the terrain study…</div>}
          {!active && <div className={styles.staticCaption}><span>{status === 'error' ? 'STATIC FALLBACK' : 'ARCHIVED ELEVATION / HILLSHADE'}</span><button type="button" onClick={requestScene}>{status === 'error' ? 'Try the 3D study again' : 'Load the 3D study'} <b aria-hidden="true">↗</b></button></div>}
        </div>
        <div className={styles.status} aria-live="polite">{message}</div>
        <div className={styles.observation}><span>OBSERVATION LOG / {selected.label.toUpperCase()}</span><strong>{data ? <>{Math.round(sampleElevation(data.manifest, data.grid, data.heights, selected)).toLocaleString()}<em> m</em></> : 'A surface record.'}</strong><p>{data ? 'An approximate elevation sampled from this archived DEM. The height encoding preserves source units; the visual relief is exaggerated by 1.5×.' : 'The hillshade comes from the archived elevation crop. Load the 3D study to sample the retained height grid.'}</p></div>
      </div>
      <aside className={styles.controls} aria-label="Terrain and geological section controls">
        <div className={styles.controlKicker}>FIELD INSTRUMENT / KĪLAUEA</div>
        <h3>{mode === 'section' ? 'An interior, interpreted.' : 'An archive, in relief.'}</h3>
        <p>{mode === 'section' ? 'The upper edge follows the DEM. The strata, conduit and melt-storage form below are generalized teaching geometry. Their position, depth and shape are not measured.' : 'The surface geometry comes from elevation samples, not a displaced noise field. Colour and lighting are editorial treatments; the archive is not current monitoring.'}</p>
        <div className={styles.modeControls}><button type="button" onClick={returnToSurface} aria-pressed={mode === 'surface'}>Surface view</button><button type="button" onClick={activateSection} aria-pressed={mode === 'section'}>Activate section</button></div>
        <label htmlFor={`${id}-reveal`}>SECTION POSITION / <output id="cutValue">{section}%</output></label>
        <input id={`${id}-reveal`} type="range" min="0" max="100" step="1" value={section} onChange={e => setReveal(Number(e.target.value))} aria-label="Geological section reveal" aria-valuetext={`${section}% section reveal; interior structures are interpretive`} />
        <div className={styles.commands}><button type="button" onClick={returnToSurface}>Surface / 0%</button><button type="button" onClick={() => setReveal(100)}>Full section / 100%</button></div>
        <div className={styles.featureHeading}>SURFACE POINTS / APPROXIMATE LOCATIONS</div><div className={styles.features}>{KILAUEA_FEATURES.map(feature => <button key={feature.id} type="button" aria-pressed={featureId === feature.id} onClick={() => setFeatureId(feature.id)}>{feature.label}<span aria-hidden="true">↗</span></button>)}</div>
        <div className={styles.featureReadout} aria-live="polite"><strong>{selected.label}</strong><span>{selected.lat.toFixed(3)}° N / {Math.abs(selected.long).toFixed(3)}° W{data ? ` / ~${Math.round(sampleElevation(data.manifest, data.grid, data.heights, selected))} M` : ''}</span><p>{selected.description}</p></div>
        <label htmlFor={`${id}-quality`}>RENDER DETAIL</label><select id={`${id}-quality`} value={quality} onChange={e => { manualQuality.current = true; setQuality(e.target.value as 'low' | 'high'); }}><option value="low">Field / lower geometry budget</option><option value="high">Detail / higher geometry budget</option></select>
        {active && <button type="button" className={styles.staticButton} onClick={() => { setMessage('Static elevation study. The field points and section controls remain available.'); useArchiveStore.getState().setRenderer('none'); }}>Return to static study</button>}
      </aside>
    </div>
    <div className={styles.provenance}><div><span>01 / OBSERVED SURFACE</span><p>USGS 3DEP archived bare-earth elevation. A composite source, not a real-time survey. Sampling and vertical datum are recorded in the data manifest.</p><a href={data?.manifest.source.url ?? 'https://www.usgs.gov/3d-elevation-program'} target="_blank" rel="noopener noreferrer">SOURCE RECORD ↗</a> · <a href={data?.manifest.source.licenseUrl ?? 'https://www.usgs.gov/3d-elevation-program/about-3dep-products-services'} target="_blank" rel="noopener noreferrer">PUBLIC-DOMAIN TERMS ↗</a></div><div><span>02 / INFERRED INTERIOR</span><p>The 3D section’s upper edge uses observed terrain; everything beneath is interpretive. The static SVG fallback is entirely generalized, including its surface, and is not a measured image of Kīlauea.</p><Link to={context === 'section' ? '/expedition/kilauea#terrain-study' : '/subsurface'}>{context === 'section' ? 'RETURN TO THE LANDSCAPE ↗' : 'CONTINUE BELOW THE SURFACE ↗'}</Link></div></div>
    {metrics && <details className={styles.metrics}><summary>Instrument measurements</summary><p data-testid="scene-metrics">{metrics.vertices.toLocaleString()} vertices / {metrics.triangles.toLocaleString()} triangles / {metrics.drawCalls} draw calls / {metrics.geometries} GPU geometries / {metrics.textures} textures. First ready: {loadMs} ms. Renderer: {metrics.renderer}. Quality: {metrics.quality}.</p><p>These are local instrument observations, not a cross-device frame-rate guarantee. Rendering rests when idle and pauses when the study is outside the viewport.</p></details>}
  </section>;
}
