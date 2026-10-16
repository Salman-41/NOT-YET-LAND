import { ArrowLink, Kicker, c } from '../components/ui';
import { TerrainInstrument } from '../components/TerrainInstrument';

export default function Subsurface() {
  return <div className={c('view', 'subsurface-view', 'spatial-subsurface')}>
    <div className={c('subsurface-head')}><div><Kicker>EXPERIMENT / 007 — THE INVISIBLE GEOGRAPHY</Kicker><h1>Below the<br /><em>surface.</em></h1></div><div><p className={c('support')}>The part of a volcano we cannot photograph is often the part we most want to understand.</p><p className={c('mono', 'dim')}>OBSERVED TERRAIN / INTERPRETIVE INTERIOR</p></div></div>
    <TerrainInstrument id="section-instrument" context="section" />
    <div className={c('geosection-bottom')}><Kicker>WHAT WE CAN KNOW</Kicker><p className={c('support')}>Earthquakes trace movement. Surface deformation measures change. Rock samples preserve chemistry. Each is an imperfect window into the processes below.</p><ArrowLink to="/evidence">Read the evidence</ArrowLink></div>
  </div>;
}
