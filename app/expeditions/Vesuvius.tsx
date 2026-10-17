import { useState } from 'react';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';

export const STRATA = [
  { unit: 'EU1', name: 'The opening ash', material: 'Fine ash / opening activity', color: '#b8aa90', evidence: 'A basal fine-ash deposit is recognized in the regional succession. Its distribution varies; this is not a layer present uniformly beneath every street in Pompeii.', account: 'Pliny’s letters describe the developing eruption cloud from a distant viewpoint. They do not provide a sediment-by-sediment excavation log.', inference: 'Modern stratigraphic interpretation relates the opening deposits to interaction between rising magma and external water.' },
  { unit: 'EU2', name: 'White pumice fall', material: 'Light pumice / sustained fallout', color: '#e5d6b5', evidence: 'Light pumice forms a major fallout unit in the published sequence. The diagram uses an arbitrary thickness and clast pattern.', account: 'A towering, branching cloud was described by Pliny. Connecting that account to a particular preserved bed is a modern correlation.', inference: 'A sustained eruption column transported pumice downwind. The illustrated falling clasts explain a process; they are not a simulated dispersal field.' },
  { unit: 'EU3', name: 'The pumice darkens', material: 'Gray pumice / changing erupted material', color: '#8e8a78', evidence: 'Dark pumice overlies the white-pumice sequence; ash-flow deposits are interbedded in parts of the regional succession.', account: 'Eyewitness accounts are valuable but incomplete. The narrator’s location and the interval before the letters were written limit exact correlations.', inference: 'Changes in pumice composition and intermittent column instability help reconstruct how the eruption evolved.' },
  { unit: 'EU4', name: 'The density currents', material: 'Ash-rich current deposits', color: '#5e6256', evidence: 'Ash-rich pyroclastic-current deposits record a major change in eruptive behavior. Grain size and structures differ with distance and local topography.', account: 'Pliny described a dark cloud spreading toward Misenum. Relating this description to the geological sequence requires interpretation.', inference: 'Sedimentary structures support transport in turbulent density currents. The diagram groups later burial schematically; it does not display all eight eruptive units.' },
];
export default function VesuviusStudy() {
  const [exposed, setExposed] = useState(4);
  const [selected, setSelected] = useState(1);
  const [kind, setKind] = useState<'evidence' | 'account' | 'inference'>('evidence');
  const item = STRATA[selected];
  const excavate = (value: number) => { setExposed(value); if (value > 0) setSelected(Math.min(selected, value - 1)); };
  return <section id="signature-study" className={`${s.study} ${s.buried}`} data-study="vesuvius" data-exposed={exposed} aria-label="Vesuvius illustrated stratigraphy excavation">
    <StudyHeader index="06 / THE BURIED WORLD" title="Read from the ground up">Excavate an illustrated sequence. A deposit, an eyewitness account and a modern reconstruction are different kinds of evidence; read each in its own voice.</StudyHeader>
    <div className={s.excavationLayout}>
      <div className={s.trench}>
        <div className={s.figureStrip}><span>79 CE / SELECTED REGIONAL UNITS</span><span>NOT TO SCALE</span></div>
        <div className={s.strataWall}>
          {[...STRATA].reverse().map((layer, reverseIndex) => { const i = 3 - reverseIndex; return <button type="button" key={layer.unit} className={`${s.stratum} ${s[`stratum${i}`]}`} style={{ backgroundColor: layer.color }} data-visible={i < exposed} aria-pressed={selected === i} disabled={i >= exposed} onClick={() => setSelected(i)} aria-label={`Inspect ${layer.unit}: ${layer.name}`}><span>{i < exposed ? layer.unit : 'UNEXCAVATED'}</span><strong>{i < exposed ? layer.material : '· · ·'}</strong></button>; })}
          <div className={s.romanGround}><svg viewBox="0 0 600 100" role="img" aria-label="Illustrated Roman masonry beneath the deposits; an imagined architectural fragment, not a surveyed archaeological remain"><path d="M20 80V32H150V80M70 32V12H130V32M195 80V10H280V80M195 40H280M330 80V38Q380-10 430 38V80M490 80V20H570V80M0 88H600" fill="none" stroke="currentColor" strokeWidth="3" /></svg><span>ROMAN GROUND / ILLUSTRATED REMAINS</span></div>
        </div>
        <label htmlFor="excavate" className={s.micro}>EXPOSE THE SEQUENCE / {exposed} OF 4 SELECTED UNITS</label><input id="excavate" type="range" min="0" max="4" step="1" value={exposed} aria-label="Excavation units exposed" aria-valuetext={`${exposed} of 4 generalized units exposed from the base upward`} onChange={e => excavate(Number(e.target.value))} />
        <div className={s.buttonRow}><button type="button" onClick={() => excavate(Math.min(4, exposed + 1))} disabled={exposed === 4}>Expose next unit</button><button type="button" onClick={() => excavate(0)}>Cover the sequence</button><button type="button" onClick={() => excavate(4)}>Expose all</button></div>
      </div>
      <div className={s.strataReading}>
        <span className={s.unitNumber}>{exposed === 0 ? '—' : item.unit}</span>
        <div className={s.evidenceVoices} aria-label="Kinds of historical evidence">{([['evidence', 'Deposit evidence'], ['account', 'Historical account'], ['inference', 'Modern reconstruction']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}</div>
        <Readout eyebrow={kind === 'evidence' ? 'OBSERVED DEPOSITS / SYNTHESIZED' : kind === 'account' ? 'HISTORICAL ACCOUNT / PARAPHRASED' : 'INTERPRETATION'} title={exposed === 0 ? 'The record is covered' : item.name}>{exposed === 0 ? 'Expose the sequence to inspect a selected deposit. The illustrated wall is generalized; bed thicknesses and architecture are not measurements.' : item[kind]}</Readout>
        <p className={s.caveat}>Selected units EU1–EU4 after INGV’s regional synthesis. Not every unit occurs at every site. Exact calendar dating is debated; this chapter uses 79 CE.</p>
        <p className={s.inlineReference}>Read the historical testimony: <a href="https://dcc.dickinson.edu/pliny-letters/6-16" target="_blank" rel="noopener noreferrer">Pliny 6.16 ↗</a> · <a href="https://dcc.dickinson.edu/pliny-letters/6-20" target="_blank" rel="noopener noreferrer">Pliny 6.20 ↗</a>. No modern translation is reproduced.</p>
      </div>
    </div>
    <SourceNote id="vesuvius-strata" />
  </section>;
}
