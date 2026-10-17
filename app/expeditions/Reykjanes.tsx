import { useState } from 'react';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';

const episodes = [
  { date: '18 DEC 2023', title: 'The northern opening', image: 'january', note: 'The December lava field remains warm in the 16 January thermal observation. Select January to read the younger flow beside it.', method: '16 JAN 2024 / LANDSAT 9 TIRS-2 / THERMAL OVER DEM' },
  { date: '14 JAN 2024', title: 'A fissure nearer the town', image: 'january', note: 'Two fissures opened near Grindavík. Yellow in the published thermal map identifies warm January flows; the December field is also labeled. Warmth is not a lava-thickness measurement.', method: '16 JAN 2024 / LANDSAT 9 TIRS-2 / THERMAL OVER DEM' },
  { date: '29 MAY 2024', title: 'The same system, another field', image: 'june', note: 'The 2 June optical view records the late-May episode. Infrared information makes hot lava bright. Its framing differs from the January thermal map; this is episode browsing, not a registered image subtraction.', method: '02 JUN 2024 / LANDSAT / INFRARED-ENHANCED OPTICAL VIEW' },
];
export default function ReykjanesStudy() {
  const [episode, setEpisode] = useState(1);
  const [structure, setStructure] = useState(false);
  const [mapped, setMapped] = useState(false);
  const [detail, setDetail] = useState(false);
  const mapNotes = ['Orange / December 2023: compare the segmented northern traces with the black older crater row.', 'Green / January 2024: the mapped fissures extend south toward Grindavík, away from many of the other episodes.', 'Red / May–June 2024: trace the published segments near Hagafell. Brown dotted faults are inferred; brown solid faults are visible.'];
  const record = episodes[episode];
  return <section id="signature-study" className={`${s.study} ${s.fracture}`} data-study="reykjanes" data-episode={episode} aria-label="Reykjanes fissure episode study">
    <StudyHeader index="02 / THE FRACTURE" title="The line opens again">A fissure system has no single center. Read successive openings along the Sundhnúkur crater row, within the Reykjanes plate-boundary zone.</StudyHeader>
    <div className={s.fractureLayout}>
      <div className={s.episodeRail} aria-label="Documented eruption episodes">{episodes.map((item, i) => <button type="button" key={item.date} aria-pressed={i === episode} onClick={() => setEpisode(i)}><span className={s.micro}>0{i + 1} / {item.date}</span><strong>{item.title}</strong><span aria-hidden="true">↗</span></button>)}
        <p className={s.micro}>ARCHIVED EPISODES / NOT A LIVE HAZARD MAP</p>
        <button type="button" className={s.structureButton} aria-pressed={structure} onClick={() => { setStructure(!structure); setMapped(false); }}>{structure ? 'Return to satellite observation' : 'Read the plate-boundary setting'}</button>
        <button type="button" className={s.structureButton} aria-pressed={mapped} onClick={() => { setMapped(!mapped); setStructure(false); }}>{mapped ? 'Return to satellite fields' : 'Read the mapped fissures'}</button>
      </div>
      <div className={s.fissureObservation}>
        {mapped ? <figure className={s.fissureMap} data-detail={detail}>
          <div className={s.buttonRow}><button type="button" onClick={() => setDetail(!detail)}>{detail ? 'Fit complete fissure map' : 'Enlarge fissure map / scroll to inspect'}</button><a href="/research/reykjanes-fissures.webp" target="_blank" rel="noopener noreferrer">Open full map ↗</a></div>
          <div className={s.mapViewport} tabIndex={detail ? 0 : undefined} role="region" aria-label="Published fissure map; enlarged view scrolls horizontally and vertically"><img src="/research/reykjanes-fissures.webp" width="2200" height="1534" alt="Rhodes and colleagues Figure 7: six episodes of mapped fissures colored by date, with visible and inferred faults, original legend and scale" loading="lazy" /></div>
          <figcaption>OBSERVATION / MAPPED FISSURE TRACES, 2023–2024<br />Rhodes et al. (2026), Fig. 7 / CC BY 4.0. Original legend retained. Gray outlines show older lava, not these eruption fields.</figcaption>
        </figure> : structure ? <div className={s.plateDrawing}>
          <svg viewBox="0 0 700 620" role="img" aria-label="Conceptual diagram of oblique plate divergence and linear fissures; not a geographic or measured fissure map">
            <path d="M320 80L405 180L335 300L410 400L350 545" fill="none" stroke="#8d9a8e" strokeWidth="2" strokeDasharray="8 8" />
            <path d="M345 190l-35 75m65 62l-40 80m38 45l-22 47" fill="none" stroke="#f37543" strokeWidth="7" />
            <path d="M220 280l-90 40 25-30m-25 30l38 4M465 333l90-40-25 30m25-30l-38-4" fill="none" stroke="#e9e7df" strokeWidth="2" />
            <g fill="#e9e7df" fontFamily="monospace" fontSize="14"><text x="65" y="210">NORTH AMERICAN</text><text x="65" y="232">PLATE</text><text x="460" y="430">EURASIAN</text><text x="460" y="452">PLATE</text><text x="390" y="125">FISSURE ZONE</text><text x="40" y="575">CONCEPTUAL / NO DISTANCE SCALE</text></g>
          </svg>
          <p>The peninsula crosses an oblique spreading zone. Short orange segments explain linear openings; their position and length are illustrative. This drawing is separate from the satellite evidence.</p>
        </div> : <figure><div className={s.episodeImage} data-episode={episode}><img src={`/research/reykjanes-${record.image}.webp`} width="720" height={record.image === 'january' ? 765 : 480} alt={record.image === 'january' ? 'NASA thermal map dated 16 January 2024, with labeled December 2023 and January 2024 lava fields near Grindavík' : 'NASA infrared-enhanced Landsat view on 2 June 2024 showing the fissure eruption and hot lava flows north of Grindavík'} loading="lazy" />{record.image === 'january' && <div className={s.episodeLocator} aria-hidden="true" />}</div><figcaption>{record.method}<br />NASA Earth Observatory / Lauren Dauphin, using USGS Landsat data.<br />{record.image === 'january' && 'Dashed locator selects a labeled thermal field; it is not a mapped boundary.'}</figcaption></figure>}
      </div>
    </div>
    <Readout eyebrow={record.date} title={record.title}>{mapped ? mapNotes[episode] : record.note}</Readout>
    <SourceNote id={mapped || structure ? 'reykjanes-fissures' : record.image === 'june' ? 'reykjanes-june' : 'reykjanes-observations'} />
  </section>;
}
