import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  prerender: ['/', '/atlas', '/expeditions', '/expedition/kilauea', '/expedition/reykjanes', '/expedition/st-helens', '/expedition/etna', '/expedition/tajogaite', '/expedition/vesuvius', '/subsurface', '/evidence', '/method'],
} satisfies Config;
