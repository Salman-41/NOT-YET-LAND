import { useState } from 'react';
import { c } from './ui';
import { asset } from '../data/volcanoes';
export function Comparison() {
  const [value, setValue] = useState(50);
  return <div className={c('evidence-feature-art')}>
    <img width="1100" height="800" src={asset('st-helens')} className={c('before')} alt="Conceptual relief artwork inspired by Mount St. Helens; study A" />
    <img width="1100" height="800" src={asset('st-helens', true)} className={c('after')} style={{ clipPath: `inset(0 0 0 ${value}%)` }} alt="Alternative illustrative relief of Mount St. Helens; study B" />
    <div className={c('compare-divider')} style={{ left: `${value}%` }} aria-hidden="true" />
    <span className={c('label-before')}>STUDY A / ILLUSTRATION</span><span className={c('label-after')}>STUDY B / ILLUSTRATION</span>
    <input type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))} aria-label="Compare two conceptual terrain studies" aria-valuetext={`${value}% study A; ${100 - value}% study B`} />
    <output className={c('comparison-output', 'mono')} aria-live="polite">{value}% / {100 - value}%</output>
  </div>;
}
