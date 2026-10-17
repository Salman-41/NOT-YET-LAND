import { useState } from 'react';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';

const periods = [
  { id: 'medieval', label: '11th–16th century', color: '#edb62d', text: 'The map’s yellow-orange medieval class records deposits older than the pink and red modern classes. Ages summarize geological and historical interpretation.' },
  { id: 'early-modern', label: '17th–18th century', color: '#dd9292', text: 'Pink deposits include the extensive 1669 southern flow field. The DANTE catalogue dates that flank eruption from 11 March to 11 July 1669 and describes the Monti Rossi fissure system.' },
  { id: 'modern', label: '19th century–map present', color: '#c83036', text: 'Red deposits record repeated younger lava emplacement. “Present” belongs to the published map, not today. The 1991–1993 flank eruption is one selected catalogue entry.' },
];
export default function EtnaStudy() {
  const [enabled, setEnabled] = useState<string[]>(periods.map(p => p.id));
  const [selected, setSelected] = useState(1);
  const [rift, setRift] = useState(false);
  const toggle = (id: string, index: number) => { setSelected(index); setEnabled(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]); };
  return <section id="signature-study" className={`${s.study} ${s.accumulation}`} data-study="etna" data-layers={enabled.length} aria-label="Etna deposit accumulation study">
    <StudyHeader index="04 / THE ACCUMULATION" title="One eruption over another">Etna is an archive written in overlapping deposits. Separate three published age classes; restore the complete map to read their relationship.</StudyHeader>
    <div className={s.etnaLayout}>
      <div className={s.layerControls}><span className={s.micro}>DEPOSIT AGE / ISOLATE COLOR CLASSES</span>{periods.map((period, i) => <label className={s.layerToggle} key={period.id}><input type="checkbox" checked={enabled.includes(period.id)} onChange={() => toggle(period.id, i)} /><span className={s.swatch} style={{ background: period.color }} /><span>{period.label}</span></label>)}
        <div className={s.buttonRow}><button type="button" onClick={() => setEnabled(periods.map(p => p.id))}>All deposits</button><button type="button" onClick={() => setEnabled([])}>Base only</button></div>
        <button type="button" className={s.structureButton} aria-pressed={rift} onClick={() => setRift(!rift)}>{rift ? 'Return to complete map' : 'Inspect summit / eruptive fissures'}</button>
        <p>Layers are isolated from the published raster colors. This is an age-class study, not a thickness model. The original legend remains available below.</p>
        <Readout eyebrow="SELECTED CLASS" title={periods[selected].label}>{periods[selected].text}</Readout>
      </div>
      <figure className={s.etnaMap}>
        <div className={s.etnaViewport} data-rift={rift}>
          <div className={s.etnaStack}>
            <img src="/research/etna-map.webp" width="500" height="595" alt="INGV historical Etna deposit map with crater-rim and eruptive-fissure symbols; complete original geographic labels and legend" loading="lazy" className={s.etnaBase} />
            {periods.filter(p => enabled.includes(p.id)).map(p => <img src={`/research/etna-${p.id}.webp`} width="500" height="595" alt="" aria-hidden="true" key={p.id} className={s.etnaLayer} />)}
          </div>
        </div>
        <figcaption>{rift ? 'ENLARGED SUMMIT / READ THE ORIGINAL FISSURE SYMBOLS' : `${enabled.length} OF 3 SELECTED AGE CLASSES VISIBLE`}<br />Branca et al. / INGV DANTE, CC BY 4.0. Raster color isolation by NOT YET LAND.</figcaption>
        <a href="/research/etna-map.webp" target="_blank" rel="noopener noreferrer" className={s.mapOriginal}>Read the full original map & legend ↗</a>
      </figure>
    </div>
    <SourceNote id="etna-dante" />
  </section>;
}
