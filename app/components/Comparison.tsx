import { useId, useState } from 'react';
import styles from '../styles/research.module.css';

export interface ImagePair {
  id: string; before: string; after: string; beforeLabel: string; afterLabel: string;
  beforeAlt: string; afterAlt: string; description: string;
}
export const ST_HELENS_PAIR: ImagePair = {
  id: 'msh-landsat', before: '/research/st-helens-before.webp', after: '/research/st-helens-after.webp',
  beforeLabel: '1973 / BEFORE', afterLabel: '1983 / AFTER',
  beforeAlt: 'USGS false-color Landsat image of Mount St. Helens in 1973, before the 1980 collapse',
  afterAlt: 'USGS false-color Landsat image of the same Mount St. Helens region in 1983, after the collapse',
  description: 'USGS publisher-paired satellite images. 1983 includes three years of subsequent change. False color; no elevation difference calculated.',
};
export const TAJOGAITE_PAIR: ImagePair = {
  id: 'tajogaite-landsat', before: '/research/tajogaite-before.webp', after: '/research/tajogaite-after.webp',
  beforeLabel: '21 MAY 2021', afterLabel: '15 DEC 2021',
  beforeAlt: 'NASA Landsat 8 natural-color view of western La Palma on 21 May 2021, before the eruption',
  afterAlt: 'Matching NASA Landsat 8 view of western La Palma on 15 December 2021, showing dark lava fields, new coastal land and clouds',
  description: 'NASA / USGS Landsat 8 OLI. Same published framing and natural-color treatment. Clouds obscure part of the December view.',
};
export function Comparison({ pair = ST_HELENS_PAIR, focus }: { pair?: ImagePair; focus?: { x: number; y: number; zoom: number } }) {
  const [value, setValue] = useState(50);
  const id = useId();
  const transform = focus ? { transform: `scale(${focus.zoom})`, transformOrigin: `${focus.x}% ${focus.y}%` } : undefined;
  return <figure className={styles.comparison} data-comparison={pair.id}>
    <div className={styles.compareImages}>
      <img width="1000" height={pair.id === 'msh-landsat' ? 792 : 667} src={pair.after} alt={pair.afterAlt} loading="lazy" style={transform} />
      <div className={styles.beforeClip} style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }} data-before-clip>
        <img width="1000" height={pair.id === 'msh-landsat' ? 792 : 667} src={pair.before} alt={pair.beforeAlt} loading="lazy" style={transform} />
      </div>
      <div className={styles.divider} style={{ left: `${value}%` }} aria-hidden="true"><span>↔</span></div>
      <span className={styles.beforeLabel}>{pair.beforeLabel}</span><span className={styles.afterLabel}>{pair.afterLabel}</span>
    </div>
    <div className={styles.compareControls}>
      <label htmlFor={id}>REVEAL THE EARLIER LANDSCAPE <output>{value}%</output></label>
      <input id={id} type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))} aria-describedby={`${id}-caption`} aria-label={`Compare ${pair.id === 'msh-landsat' ? 'Mount St. Helens 1973 and 1983' : 'La Palma May and December 2021'}`} aria-valuetext={`${value}% earlier image; ${100 - value}% later image`} />
      <div className={styles.buttonRow}><button type="button" onClick={() => setValue(100)}>Earlier only</button><button type="button" onClick={() => setValue(50)}>Split view</button><button type="button" onClick={() => setValue(0)}>Later only</button></div>
    </div>
    <figcaption id={`${id}-caption`}>{pair.description}</figcaption>
  </figure>;
}
