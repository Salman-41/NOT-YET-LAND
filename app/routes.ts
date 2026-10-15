import { type RouteConfig, index, route } from '@react-router/dev/routes';
export default [
  index('routes/home.tsx'),
  route('atlas', 'routes/atlas.tsx'),
  route('expeditions', 'routes/expeditions.tsx'),
  route('expedition/:slug', 'routes/expedition.tsx'),
  route('subsurface', 'routes/subsurface.tsx'),
  route('evidence', 'routes/evidence.tsx'),
  route('method', 'routes/method.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
