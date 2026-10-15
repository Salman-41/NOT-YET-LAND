import { c, ArrowLink, Kicker } from '../components/ui';
export const meta = () => [{ title: 'Uncharted ground — NOT YET LAND' }, { name: 'robots', content: 'noindex' }];
export default function NotFound() {
  return <div className={c('method', 'error-page')}><Kicker>Field record / Not found</Kicker><h1 className={c('display')}>Uncharted ground.</h1><p className={c('support')}>This location is outside our six field records.</p><ArrowLink to="/atlas">Return to the atlas</ArrowLink></div>;
}
