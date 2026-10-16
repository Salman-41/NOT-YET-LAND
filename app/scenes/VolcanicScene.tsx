import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import { ACESFilmicToneMapping, CanvasTexture, Color, DoubleSide, MeshStandardMaterial, Plane, SRGBColorSpace, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsInstance } from 'three-stdlib';
import { KILAUEA_FEATURES, type SceneMetrics, type TerrainGrid, type TerrainManifest } from '../data/terrain';
import { createSectionCap, createTerrainGeometry, createTerrainWalls, elevationToWorld, featureWithinBounds, featureWorldPosition, INTERPRETIVE_BLOCK_DEPTH, sampleGridHeight, sectionPlanePosition, terrainShape } from './terrainGeometry';

export type VolcanicSceneProps = {
  manifest: TerrainManifest;
  heights: Uint16Array;
  grid: TerrainGrid;
  section: number;
  mode: 'surface' | 'section';
  featureId: string;
  onFeatureSelect: (id: string) => void;
  onReady: (metrics: SceneMetrics) => void;
  onContextLost: () => void;
  active: boolean;
  quality: 'low' | 'high';
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function contourMaterial(manifest: TerrainManifest, plane: Plane) {
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.02, clippingPlanes: [plane] });
  const shape = terrainShape(manifest);
  const intervalMeters = Math.max(20, Math.round(shape.elevationRange / 120) * 10);
  material.onBeforeCompile = shader => {
    shader.uniforms.uContourInterval = { value: intervalMeters * shape.unitsPerMeter * shape.verticalExaggeration };
    shader.uniforms.uContourColor = { value: new Color('#cbd0ad') };
    shader.vertexShader = `varying float vTerrainHeight;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrainHeight = position.y;');
    shader.fragmentShader = `varying float vTerrainHeight; uniform float uContourInterval; uniform vec3 uContourColor;\n${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      float contourCoordinate = vTerrainHeight / uContourInterval;
      float contourDistance = abs(fract(contourCoordinate + 0.5) - 0.5);
      float contourWidth = max(fwidth(contourCoordinate) * 0.7, 0.008);
      float contour = 1.0 - smoothstep(contourWidth, contourWidth * 1.9, contourDistance);
      diffuseColor.rgb = mix(diffuseColor.rgb, uContourColor, contour * 0.18);`);
  };
  material.customProgramCacheKey = () => 'dem-height-contours-v1';
  return material;
}

function sectionMaterial() {
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.96, side: DoubleSide });
  material.onBeforeCompile = shader => {
    shader.vertexShader = `varying vec2 vSectionPosition;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSectionPosition = position.xy;');
    shader.fragmentShader = `varying vec2 vSectionPosition;\n${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      vec2 chamber = vec2(vSectionPosition.x / 1.08, (vSectionPosition.y + 1.48) / 0.52);
      bool reservoirOpening = dot(chamber, chamber) < 1.0;
      bool conduitOpening = abs(vSectionPosition.x) < 0.075 && vSectionPosition.y > -1.2;
      if (reservoirOpening || conduitOpening) discard;`);
  };
  material.customProgramCacheKey = () => 'interpretive-strata-cap-v1';
  return material;
}

function CameraRig({ manifest, grid, heights, mode, featureId, active }: Pick<VolcanicSceneProps, 'manifest' | 'grid' | 'heights' | 'mode' | 'featureId' | 'active'>) {
  const { camera, invalidate, size } = useThree();
  const controls = useRef<OrbitControlsInstance>(null);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const lastView = useRef('');
  const reduced = useReducedMotion();
  useEffect(() => {
    const orbit = controls.current;
    if (!orbit || !active) return;
    const view = [manifest.id, grid.width, grid.height, mode, featureId, reduced, size.width, size.height].join('/');
    if (lastView.current === view) { invalidate(); return; }
    lastView.current = view;
    transition.current?.kill();
    const selected = KILAUEA_FEATURES.find(feature => feature.id === featureId && featureWithinBounds(manifest, feature));
    const point = selected ? featureWorldPosition(manifest, grid, heights, selected) : [0, 0, 0];
    const target = mode === 'section' ? { x: 0, y: -0.65, z: -0.2 } : { x: point[0] * 0.45, y: point[1] * 0.4, z: point[2] * 0.45 };
    const fit = Math.max(1, 0.98 / (size.width / size.height));
    const position = mode === 'section'
      ? { x: 6.5 * fit, y: 3.8 * fit, z: 11 * fit }
      : { x: 7.6 * fit + target.x, y: 9 * fit + target.y, z: 11 * fit + target.z };
    const update = () => { orbit.update(); invalidate(); };
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.set(position.x, position.y, position.z);
      orbit.target.set(target.x, target.y, target.z);
      update();
    } else {
      const timeline = gsap.timeline({ onUpdate: update });
      timeline.to(camera.position, { ...position, duration: 1.1, ease: 'power2.inOut' }, 0);
      timeline.to(orbit.target, { ...target, duration: 1.1, ease: 'power2.inOut' }, 0);
      transition.current = timeline;
    }
    return () => { transition.current?.kill(); };
  }, [active, camera, featureId, grid, heights, invalidate, manifest, mode, reduced, size.height, size.width]);
  useEffect(() => { if (!active) transition.current?.kill(); }, [active]);
  return <OrbitControls ref={controls} makeDefault enabled={active} enablePan={false} enableDamping={false} minDistance={7} maxDistance={29} minPolarAngle={0.16} maxPolarAngle={Math.PI * 0.49} onStart={() => transition.current?.kill()} onChange={() => invalidate()} />;
}

/** Native GPU sprites avoid nested ReactDOM roots during clipping and route teardown. */
function FeatureMarker({ point, number, selected, onSelect }: { point: [number, number, number]; number: number; selected: boolean; onSelect: () => void }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 80;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#0e1a14'; context.fillRect(0, 0, 128, 80);
      context.strokeStyle = selected ? '#e77d4b' : '#647368'; context.lineWidth = 4; context.strokeRect(2, 2, 124, 76);
      context.fillStyle = selected ? '#ff9a60' : '#e9e7df'; context.font = '40px monospace'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(String(number).padStart(2, '0'), 64, 42);
    }
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace;
    return map;
  }, [number, selected]);
  useEffect(() => () => texture.dispose(), [texture]);
  const choose = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(); };
  return <group position={[point[0], point[1] + 0.035, point[2]]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={choose}><ringGeometry args={[selected ? 0.13 : 0.09, selected ? 0.17 : 0.12, 32]} /><meshBasicMaterial color={selected ? '#f89359' : '#d7d8bf'} side={DoubleSide} depthTest={false} depthWrite={false} /></mesh>
    <mesh position={[0, 0.12, 0]} onClick={choose}><sphereGeometry args={[0.065, 12, 12]} /><meshBasicMaterial color={selected ? '#ff9a60' : '#e5e3cd'} depthTest={false} depthWrite={false} /></mesh>
    <sprite position={[0, 0.34, 0]} scale={[0.32, 0.2, 1]} onClick={choose}><spriteMaterial map={texture} depthTest={false} depthWrite={false} transparent /></sprite>
  </group>;
}

/** Measures actual CPU render submission, with a bounded six-frame warm-up. */
function RendererProbe({ onReady, onContextLost, quality, grid, mode }: Pick<VolcanicSceneProps, 'onReady' | 'onContextLost' | 'quality' | 'grid' | 'mode'>) {
  const { gl, invalidate } = useThree();
  const samples = useRef<number[]>([]);
  const reported = useRef(false);
  const ready = useRef(onReady), lost = useRef(onContextLost);
  useEffect(() => { ready.current = onReady; lost.current = onContextLost; }, [onReady, onContextLost]);
  useEffect(() => { samples.current = []; reported.current = false; invalidate(); }, [grid, invalidate, mode, quality]);
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => { event.preventDefault(); lost.current(); };
    canvas.addEventListener('webglcontextlost', handleLost);
    return () => canvas.removeEventListener('webglcontextlost', handleLost);
  }, [gl]);
  useFrame(({ gl: renderer, scene, camera }) => {
    const before = performance.now();
    renderer.render(scene, camera);
    if (reported.current) return;
    samples.current.push(performance.now() - before);
    if (samples.current.length < 6) { invalidate(); return; }
    reported.current = true;
    const warmed = samples.current.slice(1).sort((a, b) => a - b);
    const geometries = new Set<BufferGeometry>();
    scene.traverse(object => { const geometry = (object as unknown as { geometry?: BufferGeometry }).geometry; if (geometry) geometries.add(geometry); });
    const context = renderer.getContext();
    ready.current({
      triangles: renderer.info.render.triangles,
      vertices: Array.from(geometries).reduce((total, geometry) => total + (geometry.getAttribute('position')?.count ?? 0), 0),
      drawCalls: renderer.info.render.calls,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      frameMs: warmed[Math.floor(warmed.length / 2)],
      quality,
      renderer: String(context.getParameter(context.RENDERER)),
      firstFrameMs: samples.current[0],
      sampledFrames: samples.current.length,
      timingMethod: 'CPU render submission; median of five warm frames. Not GPU frame time or FPS.',
      gridWidth: grid.width,
      gridHeight: grid.height,
      pixelRatio: renderer.getPixelRatio(),
      mode,
    });
  }, 1);
  return null;
}

function GeologicalModel(props: VolcanicSceneProps) {
  const { manifest, grid, heights, section, mode, featureId, onFeatureSelect } = props;
  const shape = useMemo(() => terrainShape(manifest), [manifest]);
  const reveal = mode === 'section' ? Math.max(0, Math.min(100, section)) : 0;
  const cutZ = sectionPlanePosition(manifest, reveal);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, -1), 0), []);
  plane.constant = cutZ + 0.0001;
  const surface = useMemo(() => createTerrainGeometry(manifest, grid, heights), [manifest, grid, heights]);
  const walls = useMemo(() => createTerrainWalls(manifest, grid, heights), [manifest, grid, heights]);
  const cap = useMemo(() => createSectionCap(manifest, grid, heights, reveal), [manifest, grid, heights, reveal]);
  const surfaceMaterial = useMemo(() => contourMaterial(manifest, plane), [manifest, plane]);
  const capMaterial = useMemo(sectionMaterial, []);
  useEffect(() => () => { surface.dispose(); walls.dispose(); }, [surface, walls]);
  useEffect(() => () => cap.dispose(), [cap]);
  useEffect(() => () => surfaceMaterial.dispose(), [surfaceMaterial]);
  useEffect(() => () => capMaterial.dispose(), [capMaterial]);
  const conduitTop = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, 0.5, cutZ / shape.depth + 0.5));
  const features = KILAUEA_FEATURES.filter(feature => featureWithinBounds(manifest, feature));
  return <>
    <hemisphereLight args={['#d9e2d0', '#182b22', 0.85]} />
    <ambientLight intensity={0.15} />
    <directionalLight position={[4, 9, 7]} intensity={2.3} color="#fff3d6" />
    <directionalLight position={[-6, 3, -5]} intensity={0.8} color="#8aa598" />
    <mesh geometry={surface} material={surfaceMaterial} />
    <mesh geometry={walls}><meshStandardMaterial vertexColors roughness={1} side={DoubleSide} clippingPlanes={[plane]} /></mesh>
    <mesh position={[0, -INTERPRETIVE_BLOCK_DEPTH, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[shape.width, shape.depth]} /><meshStandardMaterial color="#192e25" side={DoubleSide} clippingPlanes={[plane]} /></mesh>
    {reveal > 0 && <group>
      <mesh geometry={cap} material={capMaterial} />
      <mesh position={[0, -1.48, cutZ]} scale={[1.08, 0.52, 0.30]}><sphereGeometry args={[1, 40, 24]} /><meshStandardMaterial color="#efad6b" emissive="#c9471c" emissiveIntensity={1.2} roughness={0.65} side={DoubleSide} clippingPlanes={[plane]} /></mesh>
      <mesh position={[0, -1.48, cutZ + 0.0002]} scale={[1.08, 0.52, 1]}><circleGeometry args={[1, 48]} /><meshStandardMaterial color="#efa363" emissive="#c9471c" emissiveIntensity={0.9} roughness={0.7} /></mesh>
      <mesh position={[0, (conduitTop - 1.2) / 2, cutZ]}><cylinderGeometry args={[0.05, 0.075, conduitTop + 1.2, 16]} /><meshStandardMaterial color="#f8bf73" emissive="#d45e28" emissiveIntensity={1.1} roughness={0.7} side={DoubleSide} clippingPlanes={[plane]} /></mesh>
      <mesh position={[0, (conduitTop - 1.2) / 2, cutZ + 0.0002]}><planeGeometry args={[0.105, conduitTop + 1.2]} /><meshStandardMaterial color="#f8bf73" emissive="#d45e28" emissiveIntensity={1.1} roughness={0.7} /></mesh>
      <pointLight position={[0, -0.9, cutZ + 0.45]} color="#ef7a43" intensity={1.4} distance={3} decay={2} />
    </group>}
    {features.map((feature, index) => {
      const point = featureWorldPosition(manifest, grid, heights, feature);
      if (point[2] > cutZ + 0.01) return null;
      return <FeatureMarker key={feature.id} point={point} number={index + 1} selected={feature.id === featureId} onSelect={() => onFeatureSelect(feature.id)} />;
    })}
    <gridHelper args={[16, 16, '#344d3d', '#243b2f']} position={[0, -INTERPRETIVE_BLOCK_DEPTH - 0.025, 0]} />
    <CameraRig {...props} />
    <RendererProbe {...props} />
  </>;
}

export default function VolcanicScene(props: VolcanicSceneProps) {
  const low = props.quality === 'low';
  return <div style={{ position: 'absolute', inset: 0 }}>
    <Canvas
      frameloop={props.active ? 'demand' : 'never'}
      dpr={low ? 1 : [1, 1.5]}
      camera={{ position: [7, 7, 10], fov: 42, near: 0.1, far: 90 }}
      gl={{ antialias: !low, alpha: false, powerPreference: low ? 'low-power' : 'high-performance', preserveDrawingBuffer: false }}
      onCreated={({ gl, camera }) => {
        gl.localClippingEnabled = true;
        gl.setClearColor('#0c1913');
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = SRGBColorSpace;
        (camera as PerspectiveCamera).lookAt(0, -0.2, 0);
      }}
      role="img"
      aria-label="Interactive elevation model of Kīlauea. The surface is measured; underground layers and magma shapes are interpretive. Use the adjacent controls for keyboard access."
    >
      <GeologicalModel {...props} />
    </Canvas>
  </div>;
}
