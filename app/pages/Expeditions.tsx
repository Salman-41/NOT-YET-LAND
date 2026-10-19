import { Link } from 'react-router';
import { c, Kicker } from '../components/ui';
import { VOLCANOES, asset } from '../data/volcanoes';
export default function Expeditions() {
  return <div className={c('view', 'chapter-index')}><div className={c('head')}><div><Kicker>Field expeditions / Six chapters</Kicker><h1>Where the<br /><i>ground moves.</i></h1></div><p className={c('support')}>One planet. Six geological stories. Enter a chapter, manipulate an interpretation, then follow the published evidence.</p></div><div className={c('chapter-rows')}>{VOLCANOES.map((v, i) => <Link className={c('chapter-row')} to={`/expedition/${v.slug}`} key={v.slug}><span className={c('mono', 'dim')}>0{i + 1}</span><span className={c('chapter-row-image')}><img src={asset(v.art)} alt="" width="180" height="120" loading="lazy" /></span><strong>{v.name}<small>{v.region} / {v.year}</small></strong><span className={c('subtitle', 'mono', 'muted')}>{v.subtitle}<br />{v.region}</span><span className={c('right-arrow')} aria-hidden="true">↗</span></Link>)}</div></div>;
}
