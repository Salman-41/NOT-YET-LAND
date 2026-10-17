import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { c, Kicker, SourceReference } from '../components/ui';
import { Comparison, ST_HELENS_PAIR, TAJOGAITE_PAIR } from '../components/Comparison';
import { SOURCES, VOLCANOES } from '../data/volcanoes';
import { SCIENTIFIC_SOURCES, EVIDENCE_TYPES, type ScientificSource } from '../data/sources';
import frames from '../data/flow-frames.json';
import s from '../styles/research.module.css';

function EvidenceMedia({ source }: { source: ScientificSource }) {
  const [image, setImage] = useState(0);
  if (source.id === 'msh-landsat') return <Comparison pair={ST_HELENS_PAIR} />;
  if (source.id === 'tajogaite-landsat') return <Comparison pair={TAJOGAITE_PAIR} />;
  if (!source.assets?.length) return <div className={s.recordCaveat}><span className={s.micro}>SOURCE REFERENCE / NO HOSTED MEDIA</span><p>{source.measurement}. Consult the original source and the chapter’s evidence instrument for context.</p></div>;
  const current = source.assets[Math.min(image, source.assets.length - 1)];
  return <figure className={s.evidenceMedia}>
    <img src={current} alt={`${source.name} — ${source.id === 'hvo-flow-maps' ? frames[image].date : source.observationDate}; ${source.measurement}`} loading="lazy" />
    {source.assets.length > 1 && <div className={s.buttonRow} aria-label="Dated source images">{source.assets.map((asset, i) => <button type="button" key={asset} aria-pressed={image === i} onClick={() => setImage(i)}>{source.id === 'hvo-flow-maps' ? frames[i].date : `Observation ${i + 1}`}</button>)}</div>}
    <figcaption>{source.attribution}</figcaption>
  </figure>;
}

export default function Evidence() {
  const [params, setParams] = useSearchParams();
  const requested = SCIENTIFIC_SOURCES.find(source => source.id === params.get('source'));
  const [volcano, setVolcano] = useState(requested?.volcano ?? 'all');
  const [type, setType] = useState('all');
  const records = SCIENTIFIC_SOURCES.filter(source => (volcano === 'all' || source.volcano === volcano) && (type === 'all' || source.type === type));
  const selected = records.find(source => source.id === (params.get('source') ?? 'msh-landsat')) ?? records[0];
  const select = (id: string) => setParams({ source: id }, { preventScrollReset: true });
  const clear = () => { setVolcano('all'); setType('all'); setParams({}, { preventScrollReset: true }); };
  return <div className={c('view', 'evidence')}>
    <div className={c('evidence-head')}><div><Kicker>The evidence room / {SCIENTIFIC_SOURCES.length} research records</Kicker><h1>The ground<br /><em>on record.</em></h1></div><p className={c('support')}>A beautiful image can show an event. Evidence lets us ask what changed, when it changed, and how we know.</p></div>
    <section className={s.investigation} aria-label="Scientific evidence investigation">
      <header className={s.investigationHeader}><h2>Investigate the record.</h2><div className={s.filters}>
        <label>FIELD SITE<select aria-label="Filter evidence by volcano" value={volcano} onChange={e => setVolcano(e.target.value)}><option value="all">All six volcanoes</option>{VOLCANOES.map(v => <option key={v.slug} value={v.slug}>{v.name}</option>)}</select></label>
        <label>EVIDENCE TYPE<select aria-label="Filter evidence by type" value={type} onChange={e => setType(e.target.value)}><option value="all">All evidence types</option>{EVIDENCE_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
      </div></header>
      <p className={s.filterStatus} role="status">{records.length} {records.length === 1 ? 'record' : 'records'} found · Observations and interpretations carry separate labels.</p>
      {selected ? <div className={s.evidenceDesk}>
        <nav className={s.evidenceRecords} aria-label="Scientific evidence records">{records.map((source, i) => <button type="button" key={source.id} aria-pressed={source.id === selected.id} onClick={() => select(source.id)}><span>{String(i + 1).padStart(2, '0')} / {VOLCANOES.find(v => v.slug === source.volcano)?.name.toUpperCase()}</span><strong>{source.name}</strong><span>{source.type.toUpperCase()} / {source.classification.toUpperCase()}</span></button>)}</nav>
        <article className={s.evidenceDetail} aria-label="Selected scientific record" data-source-id={selected.id}>
          <span className={s.micro}>{selected.classification.toUpperCase()} / {selected.type.toUpperCase()}</span><h3>{selected.name}</h3>
          <EvidenceMedia source={selected} key={selected.id} />
          <dl className={s.recordFacts}>
            <div><dt>Observation / acquisition</dt><dd>{selected.observationDate}</dd></div><div><dt>Publisher / release</dt><dd>{selected.publisher}<br />{selected.publicationDate}</dd></div>
            <div><dt>Geographic coverage</dt><dd>{selected.coverage}</dd></div><div><dt>Measurement / method</dt><dd>{selected.measurement}</dd></div>
            <div><dt>License</dt><dd>{selected.license}</dd></div><div><dt>Processing in this archive</dt><dd>{selected.processing.join(' → ')}</dd></div>
          </dl>
          <div className={s.recordCaveat}><span className={s.micro}>WHAT THIS RECORD CANNOT TELL US</span><p>{selected.limitation}</p></div>
          <div className={s.evidenceActions}><a href={selected.url} target="_blank" rel="noopener noreferrer">Original source ↗</a><a href={selected.licenseUrl} target="_blank" rel="noopener noreferrer">License / terms ↗</a>{selected.originalDownload && <a href={selected.originalDownload} target="_blank" rel="noopener noreferrer">Publisher download ↗</a>}{selected.assets?.map((asset, i) => <a key={asset} href={asset} download>Download display asset {selected.assets!.length > 1 ? i + 1 : ''} ↓</a>)}<Link to={`/expedition/${selected.volcano}#signature-study`}>Explore expedition ↗</Link></div>
        </article>
      </div> : <div className={s.empty}><p>No records match these filters.</p><button type="button" onClick={clear}>Reset filters</button></div>}
    </section>
    <section className={c('source-list')} id="spatial-sources"><Kicker>Further reading / The original archive</Kicker><h2>Nothing without<br /><em>a source.</em></h2>{SOURCES.map((source, index) => <SourceReference key={source.url} source={source} index={index} />)}</section>
    <div className={c('evidence-note')}><div className={c('note')}><Kicker>Scientific transparency</Kicker><h3>Observation ≠ reconstruction.</h3><p>The satellite pairs and published flow maps record observations. Etna’s historical deposit mapping includes interpretation. Vesuvius’s illustrated sequence and St. Helens’s silhouette are explanatory reconstructions with no measured thickness or geometry.</p></div><div className={c('note')}><Kicker>Media & licensing</Kicker><h3>Trace every transformation.</h3><p>Every new research record lists its observation date, original source, coverage, method, rights and processing. USGS public-domain media, reusable NASA observations and CC BY research figures are hosted locally; no non-commercial data is used. <a href="/research/sources.json" download>Download the complete source registry ↓</a></p></div></div>
  </div>;
}
