import { useState } from 'react';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';
import frames from '../data/flow-frames.json';

export default function KilaueaStudy() {
  const [step, setStep] = useState(0);
  const [detail, setDetail] = useState(false);
  const [annotation, setAnnotation] = useState(0);
  const frame = frames[step];
  const notes = [
    ['The lower rift, not the summit', 'The 2018 flows reached communities in lower Puna. This map desk covers the lower East Rift Zone; the separate 3D study below covers the summit and is not a dated 2018 comparison.'],
    ['A coastline in revision', 'Read the historical coastline and mapped flow margins together. Lava reaching the ocean added land; a colored boundary is a mapping observation, not a prediction of the next flow.'],
    ['The edge of knowledge', 'Vegetation, cloud and fast-moving fronts made early mapping difficult. These are dated operational snapshots, not daily contours reconstructed between observations.'],
  ];
  return <section id="signature-study" className={`${s.study} ${s.flowDesk}`} data-study="kilauea" data-step={step} aria-label="Kīlauea lava progression study">
    <StudyHeader index="01 / THE LIVING SURFACE" title="Follow the advancing edge">A map is a pause in an unfinished event. Move through three actual HVO maps, keeping their dates, margins and legends intact.</StudyHeader>
    <div className={s.mapDesk}>
      <div className={s.datedMap} data-detail={detail}>
        <div className={s.figureStrip}><span>USGS / LOWER EAST RIFT ZONE</span><span>DATED MAPPED FOOTPRINTS</span></div>
        <div className={s.mapViewport} tabIndex={detail ? 0 : undefined} role="region" aria-label="Dated lava map; enlarged view scrolls horizontally and vertically"><img src={frame.asset} width="2200" height="1700" alt={`Original USGS lava-flow map, ${frame.date}; published flow boundaries, fissures, roads, coastline, scale and legend retained`} loading="lazy" /></div>
        <div className={s.mapTools}><button type="button" aria-pressed={detail} onClick={() => setDetail(!detail)}>{detail ? 'Fit complete map' : 'Enlarge map / scroll to inspect'}</button><a href={frame.asset} target="_blank" rel="noopener noreferrer">Open full map ↗</a></div>
      </div>
      <div className={s.mapLog}>
        <span className={s.micro}>MAPPING RECORD / {String(step + 1).padStart(2, '0')}</span><p className={s.largeDate}>{frame.date}</p>
        <label className={s.micro} htmlFor="flow-date">DATE OF MAPPED OBSERVATION</label><input id="flow-date" type="range" min="0" max={frames.length - 1} value={step} aria-label="Lava map date" aria-valuetext={frame.date} onChange={e => setStep(Number(e.target.value))} />
        <div className={s.dateTabs} aria-label="Mapped observations">{frames.map((item, i) => <button type="button" key={item.asset} aria-pressed={step === i} onClick={() => setStep(i)}><span>0{i + 1}</span>{item.date}</button>)}</div>
        <p>{frame.note}</p>
      </div>
    </div>
    <div className={s.annotationRow}><div className={s.buttonRow} aria-label="Flow map annotations">{['Eruption locations', 'Changing coast', 'Mapping uncertainty'].map((label, i) => <button type="button" key={label} aria-pressed={annotation === i} onClick={() => setAnnotation(i)}>{label}</button>)}</div><Readout eyebrow="READ THE MAP" title={notes[annotation][0]}>{notes[annotation][1]}</Readout></div>
    <SourceNote id="hvo-flow-maps" />
  </section>;
}
