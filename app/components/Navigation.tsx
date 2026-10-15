import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useArchiveStore } from '../state/archive';
import { c } from './ui';

export function Wordmark({ small = false }: { small?: boolean }) {
  return <span className={c('wordmark', small && 'small')}><span className={c('brand-glyph')} aria-hidden="true"><b /></span><span>NOT YET<br />LAND<span className={c('brand-stop')}>.</span></span></span>;
}
const menuItems = [['/', '00 / The Index'], ['/atlas', '01 / Field Atlas'], ['/expeditions', '02 / Expeditions'], ['/evidence', '03 / Evidence Room'], ['/subsurface', '04 / Below the Surface'], ['/method', '05 / Method & Credits']];

export function Navigation() {
  const { pathname } = useLocation();
  const open = useArchiveStore(s => s.menuOpen);
  const setOpen = useArchiveStore(s => s.setMenuOpen);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const light = ['/atlas', '/evidence', '/subsurface'].includes(pathname);
  useEffect(() => { setOpen(false); }, [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => panel.current?.querySelector<HTMLAnchorElement>('a')?.focus(), 0);
    function keydown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
      if (e.key === 'Tab') {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('a, button') ?? []);
        const index = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault(); items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
      }
    }
    document.addEventListener('keydown', keydown);
    return () => { clearTimeout(focusTimer); document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', keydown); };
  }, [open, setOpen]);
  return <>
    <header className={c('topbar', (light || open) && 'dark', open && 'menu-header')}>
      <Link to="/" aria-label="Not Yet Land, index"><Wordmark /></Link>
      <div className={c('header-center')}>AN INCOMPLETE PLANET <span className={c('header-cross')}>✳</span> FIELD ARCHIVE 001–006</div>
      <nav className={c('desktopnav')} aria-label="Main navigation">{[['/', 'Index'], ['/atlas', 'Atlas'], ['/expeditions', 'Expeditions'], ['/evidence', 'Evidence']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => c((isActive || (to === '/expeditions' && pathname.startsWith('/expedition/'))) && 'active')}>{label}</NavLink>)}</nav>
      <button ref={toggle} type="button" className={c('menu-toggle')} aria-label="Open menu" aria-expanded={open} aria-controls="menuPanel" onClick={() => setOpen(!open)}><span className={c('menu-icon')} aria-hidden="true">+</span><span className={c('menu-label')}>MENU</span></button>
    </header>
    {open && <button className={c('menu-backdrop')} aria-label="Close navigation" onClick={() => { setOpen(false); toggle.current?.focus(); }} tabIndex={-1} />}
    <div ref={panel} id="menuPanel" className={c('menu-panel', open && 'open')} inert={!open} aria-hidden={!open} role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label="Site navigation">
      <button type="button" className={c('menu-toggle', 'panel-close')} aria-label="Close menu" onClick={() => { setOpen(false); toggle.current?.focus(); }}><span className={c('menu-icon')} aria-hidden="true">×</span><span className={c('menu-label')}>MENU</span></button>
      <div className={c('menu-meta', 'mono')}>NAVIGATION / SIX PLACES</div><nav className={c('menu-links')} aria-label="All pages">{menuItems.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>
      <div className={c('menu-bottom', 'mono')}>AN INDEPENDENT DIGITAL FIELD STUDY<br />NOT A HAZARD FORECAST</div>
    </div>
  </>;
}
