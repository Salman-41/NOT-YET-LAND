import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Kicker } from '../components/ui';
import { sourceById } from '../data/sources';
import s from '../styles/research.module.css';

export function StudyHeader({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return <header className={s.studyHeader}><div><Kicker>FIELD INSTRUMENT / {index}</Kicker><h2>{title}<span>.</span></h2></div><p>{children}</p></header>;
}
export function SourceNote({ id }: { id: string }) {
  const source = sourceById(id);
  return <aside className={s.sourceNote} aria-label="Scientific provenance">
    <div><span className={s.micro}>{source.classification.toUpperCase()} / {source.type.toUpperCase()}</span><p>{source.attribution}</p><p className={s.caveat}>{source.limitation}</p></div>
    <div className={s.sourceLinks}><a href={source.url} target="_blank" rel="noopener noreferrer">Original research ↗</a><Link to={`/evidence?source=${id}`}>Inspect this evidence ↗</Link><a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">Reuse terms ↗</a></div>
  </aside>;
}
export function Readout({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className={s.readout} role="status" aria-atomic="true"><span className={s.micro}>{eyebrow}</span><h3>{title}</h3><p>{children}</p></div>;
}
