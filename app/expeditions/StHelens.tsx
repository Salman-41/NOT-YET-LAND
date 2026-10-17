import { useState } from 'react';
import { Comparison } from '../components/Comparison';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';

const timeline = [
  { date: '20 MAR 1980', title: 'The reawakening', text: 'A magnitude 4.2 earthquake marked a conspicuous return of unrest. Smaller earthquakes had begun earlier in March.' },
  { date: '27 MAR 1980', title: 'Steam breaks through', text: 'Steam-driven explosions opened a crater through the summit ice cap. The north flank continued to deform in the following weeks.' },
  { date: '18 MAY / 08:32 PDT', title: 'The northern flank fails', text: 'A magnitude 5.1 earthquake accompanied failure of the bulging north flank. Rapid unloading released the directed blast.' },
  { date: '1980–1986', title: 'A new interior grows', text: 'Later eruptions built a lava dome inside the open crater. The 1983 satellite image records this evolving aftermath, not the instant of collapse.' },
];
export default function StHelensStudy() {
  const [view, setView] = useState<'record' | 'absence'>('record');
  const [collapse, setCollapse] = useState(70);
  const [event, setEvent] = useState(2);
  return <section id="signature-study" className={`${s.study} ${s.collapse}`} data-study="st-helens" data-view={view} aria-label="Mount St. Helens collapse investigation">
    <StudyHeader index="03 / THE COLLAPSE" title="A mountain, with an absence">On 18 May 1980 the northern flank gave way. Compare the satellite record, then examine a deliberately simplified reconstruction of what was removed.</StudyHeader>
    <div className={s.modeTabs} aria-label="Collapse study view"><button type="button" aria-pressed={view === 'record'} onClick={() => setView('record')}>01 / Satellite record</button><button type="button" aria-pressed={view === 'absence'} onClick={() => setView('absence')}>02 / Reveal the missing flank</button></div>
    {view === 'record' ? <Comparison /> : <div className={s.absence}>
      <div className={s.figureStrip}><span>NORTHERN FLANK / EXPLANATORY PROFILE</span><span>RECONSTRUCTION / NOT A DEM</span></div>
      <svg viewBox="0 0 1200 530" role="img" aria-label="Qualitative silhouette of Mount St. Helens before and after northern flank collapse; outline not measured">
        <path d="M40 452L190 405L335 310L470 105L555 68L650 194L785 315L970 421L1160 465" fill="none" stroke="#b8b8a3" strokeDasharray="5 7" />
        <path d="M40 452L190 405L335 310L470 105L555 68L650 194L785 315L970 421L1160 465L1160 510H40Z" fill="#a27a53" opacity={1 - collapse / 100} />
        <path d="M40 452L190 405L335 310L470 174L558 201L643 353L750 390L970 421L1160 465V510H40Z" fill="#3e4940" stroke="#bdc3ad" />
        <path d="M555 68V201M545 68H580M545 201H580" fill="none" stroke="#f37543" strokeWidth="2" />
        <g fill="#eee9d9" fontSize="16" fontFamily="monospace"><text x="605" y="85">9,677 FT / BEFORE</text><text x="605" y="220">8,363 FT / AFTER</text><text x="735" y="350">OPEN TO THE NORTH →</text><text x="55" y="495">DRAWN PROFILE / NO HORIZONTAL SCALE</text></g>
      </svg>
      <label className={s.micro} htmlFor="collapse-reveal">REMOVE THE NORTHERN FLANK / {collapse}%</label><input id="collapse-reveal" type="range" min="0" max="100" value={collapse} aria-label="Missing northern flank reveal" aria-valuetext={`${collapse}% ghost profile removed; illustrative silhouette`} onChange={e => setCollapse(Number(e.target.value))} />
      <p>USGS reports a summit reduction of 1,314 feet. The dashed ghost and drawn crater explain this loss; they do not morph two measured terrain models. The satellite pair above provides the observed regional record.</p>
    </div>}
    <div className={s.collapseMetric}><span>1,314<small>FT REMOVED / USGS REPORTED</small></span><p>The missing summit is only part of the story. The failure opened the volcano to the north and transformed the surrounding landscape.</p></div>
    <div className={s.timeline} aria-label="Historical eruption timeline">{timeline.map((item, i) => <button type="button" aria-pressed={event === i} key={item.date} onClick={() => setEvent(i)}><span>{item.date}</span><strong>{item.title}</strong></button>)}</div>
    <Readout eyebrow={timeline[event].date} title={timeline[event].title}>{timeline[event].text}</Readout>
    <p className={s.inlineReference}>Historical chronology: <a href="https://pubs.usgs.gov/gip/msh/reawakening.html" target="_blank" rel="noopener noreferrer">USGS: Reawakening and initial activity ↗</a></p>
    <SourceNote id={view === 'record' ? 'msh-landsat' : 'msh-collapse'} />
    {view === 'record' && <p className={s.inlineReference}>Chronology and summit heights: <a href="https://pubs.usgs.gov/fs/2000/fs036-00/" target="_blank" rel="noopener noreferrer">USGS Fact Sheet 036-00 ↗</a></p>}
  </section>;
}
