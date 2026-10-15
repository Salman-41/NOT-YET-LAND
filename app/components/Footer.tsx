import { Link } from 'react-router';
import { Wordmark } from './Navigation';
import { c } from './ui';
export function Footer() { return <footer className={c('site-footer')}><Link to="/" aria-label="Not Yet Land, index"><Wordmark small /></Link><div><div className={c('mono', 'dim')}>FIELD ARCHIVE / 2026</div><p>The ground beneath us has a history.<br />Some of it is still being written.</p></div><nav className={c('footer-links')} aria-label="Footer"><Link to="/atlas">THE ATLAS ↗</Link><Link to="/evidence">SOURCE REGISTER ↗</Link><Link to="/method">ABOUT THIS STUDY ↗</Link></nav><div className={c('mono', 'dim')}>ILLUSTRATIVE EXPERIENCE<br />NOT FOR SAFETY DECISIONS</div></footer>; }
