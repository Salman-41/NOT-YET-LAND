import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError, Link } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { RouteMotion } from './components/RouteMotion';
import { c, ArrowLink, Kicker } from './components/ui';

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'preload', href: '/fonts/NotoSerifDisplay-Regular.ttf', as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' as const },
];

export function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#101614" /><Meta /><Links /></head><body><a href="#main" className={c('skip')}>Skip to content</a>{children}<ScrollRestoration /><Scripts /></body></html>;
}
export default function App() {
  return <><RouteMotion /><Navigation /><main id="main" tabIndex={-1}><Outlet /></main><Footer /></>;
}
export function ErrorBoundary() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <><Navigation /><main id="main" className={c('method', 'error-page')}><Kicker>{missing ? 'Field record / Not found' : 'Field archive / Interrupted'}</Kicker><h1 className={c('display')}>{missing ? 'Uncharted ground.' : 'A break in the record.'}</h1><p className={c('support')}>{missing ? 'This location is outside our six field records.' : 'The archive could not load this record. Reload the page to try again.'}</p><ArrowLink to="/atlas">Return to the atlas</ArrowLink><p><Link to="/">The Index ↗</Link></p></main><Footer /></>;
}
