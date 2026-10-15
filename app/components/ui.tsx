import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from '../styles/exhibition.module.css';
import type { Volcano, Source } from '../data/volcanoes';

export const c = (...names: (string | undefined | false)[]) => names.filter(Boolean).flatMap(name => String(name).split(' ')).map(name => styles[name] ?? name).join(' ');

export function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  const content = <>{children}<span className={c('arr')} aria-hidden="true">↗</span></>;
  return /^https?:/.test(to)
    ? <a className={c('arrow-link', className)} href={to} target="_blank" rel="noopener noreferrer">{content}</a>
    : <Link className={c('arrow-link', className)} to={to}>{content}</Link>;
}
export function Kicker({ children }: { children: ReactNode }) { return <div className={c('kicker')}>{children}</div>; }
export function Annotation({ children, className = '' }: { children: ReactNode; className?: string }) { return <p className={c('mono', 'dim', className)}>{children}</p>; }
export function SourceReference({ source, index }: { source: Source; index: number }) {
  return <a className={c('source-row')} href={source.url} target="_blank" rel="noopener noreferrer">
    <span className={c('snum')}>{String(index + 1).padStart(2, '0')}</span>
    <div><h3>{source.title}</h3><p>{source.description}</p></div>
    <span className={c('source-type')}>{source.type}<br />{source.author}</span><span className={c('arr')} aria-hidden="true">↗</span>
  </a>;
}
export function ChapterTransition({ next }: { next: Volcano }) {
  return <section className={c('index-thesis', 'chapter-transition')}><Kicker>Your next expedition</Kicker>
    <h2>Keep following<br />the <em>fault lines.</em></h2><div className={c('bottom')}>
      <ArrowLink to={`/expedition/${next.slug}`}>Next: {next.name}</ArrowLink><ArrowLink to="/atlas">Return to the atlas</ArrowLink>
    </div></section>;
}
