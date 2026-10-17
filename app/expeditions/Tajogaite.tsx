import { useState } from 'react';
import { Comparison, TAJOGAITE_PAIR } from '../components/Comparison';
import { StudyHeader, SourceNote, Readout } from './ResearchUI';
import s from '../styles/research.module.css';

const lenses = [
  { name: 'The whole landscape', x: 50, y: 50, zoom: 1, title: 'Before / after an eruption', note: 'The pair uses the same published framing. Move the divider to follow dark new lava across an inhabited and cultivated landscape. Colors are natural-color imagery, not a classified land-cover dataset.' },
  { name: 'The Atlantic edge', x: 12, y: 48, zoom: 1.9, title: 'A new edge to the island', note: 'Inspect the western coast where lava reached the Atlantic. The December view shows new coastal land. This lens applies the same crop to both images; it does not calculate coastline length or added area.' },
  { name: 'Fields & settlements', x: 36, y: 40, zoom: 1.8, title: 'An occupied landscape', note: 'Small pale rectangles mark structures and greenhouses in the source imagery. Clouds hide some of the later scene. Do not interpret every dark pixel as a destroyed building or count individual losses from this display.' },
];
export default function TajogaiteStudy() {
  const [lens, setLens] = useState(0);
  const item = lenses[lens];
  return <section id="signature-study" className={`${s.study} ${s.aftermath}`} data-study="tajogaite" data-lens={lens} aria-label="Tajogaite environmental change investigation">
    <StudyHeader index="05 / THE AFTERMATH" title="What remains in the frame">A landscape of homes, fields and roads becomes a field of lava. Investigate a genuine Landsat 8 pair acquired before and after the 2021 eruption.</StudyHeader>
    <div className={s.lensTabs} aria-label="Environmental investigation lenses">{lenses.map((item, i) => <button type="button" key={item.name} aria-pressed={lens === i} onClick={() => setLens(i)}><span>0{i + 1}</span>{item.name}</button>)}</div>
    <Comparison pair={TAJOGAITE_PAIR} focus={item} />
    <div className={s.afterNotes}><span className={s.dateSpan}>21 MAY<br /><em>15 DEC</em><small>2021 / LANDSAT 8 OLI</small></span><Readout eyebrow="ENVIRONMENTAL CHANGE LENS" title={item.title}>{item.note}</Readout></div>
    <SourceNote id="tajogaite-landsat" />
  </section>;
}
