# Dependency compatibility

Verified on 15 October 2026 using the published npm package manifests, the local npm cache, and the primary documentation linked below. All direct dependencies are pinned to exact stable versions; no alpha, beta, canary, or experimental dependency is selected.

## Selected versions

| Package | Version | Compatibility decision / primary source |
| --- | --- | --- |
| `react`, `react-dom` | `19.3.0` | Identical versions; stable React 19. [Published versions](https://www.npmjs.com/package/react?activeTab=versions) |
| `react-router`, `@react-router/dev`, `@react-router/node` | `7.18.4` | Requested v7 framework mode; all packages kept aligned. Dev package accepts Vite 5/6/7/8 and TypeScript 5/6, requires Node 20+. Upgraded from the cached 7.15.1 after the vulnerability check. [Versioned manifest](https://github.com/remix-run/react-router/blob/react-router%407.18.4/packages/react-router-dev/package.json) |
| `vite` | `6.4.3` | Stable compatible Vite release available locally. Its Node range includes Node 20.19.2; React Router explicitly supports Vite 6. [Vite 6 documentation](https://v6.vite.dev/guide/) |
| `typescript` | `5.9.3` | Within React Router's declared `^5.1.0` peer range. TypeScript 7 is deliberately excluded. [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) |
| `@react-three/fiber` | `9.8.1` | R3F v9 is the React 19 compatibility line. Published peers accept React `>=19 <19.4` and Three `>=0.156`. [v9 migration](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide), [published manifest](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/package.json) |
| `@react-three/drei` | `10.7.9` | Peers require Fiber 9, React 19, Three `>=0.159`; all satisfied. [Versioned manifest](https://github.com/pmndrs/drei/blob/v10.7.9/package.json), [Drei documentation](https://drei.docs.pmnd.rs/) |
| `three` / `@types/three` | `0.186.1` / `0.186.0` | Runtime and types use the same r186 release family. [Three installation](https://threejs.org/manual/#en/installation) |
| `gsap` | `3.15.0` | Includes ScrollTrigger; no separate plugin dependency. [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) |
| `maplibre-gl` | `6.14.0` | Stable patched v6; loaded only in the browser with its Vite worker URL. Uses named exports and requires WebGL2; preserve the illustration fallback. No API credential is needed for an owned local style/source. [Versioned manifest](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/package.json), [v6 migration](https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/) |
| `zustand` | `5.0.15` | React peer `>=18`, satisfied by React 19. [Zustand documentation](https://zustand.docs.pmnd.rs/getting-started/introduction) |
| `vitest` | `3.2.7` | Stable v3 accepts Node 20 and Vite 6. Main unreleased Vitest documentation has a higher Node requirement, so it is intentionally avoided. [v3 documentation](https://v3.vitest.dev/guide/), [versioned manifest](https://github.com/vitest-dev/vitest/blob/v3.2.7/packages/vitest/package.json) |
| `@playwright/test` | `1.64.0` | Published engine requires Node 20+. [Playwright installation](https://playwright.dev/docs/intro) |
| `@types/react`, `@types/react-dom`, `@types/node` | `19.3.0`, `19.3.0`, `20.19.43` | Match the React major and the local Node 20 runtime. |
| `isbot` | `5.2.2` | Explicit framework build dependency; prevents React Router from starting an implicit install. [Package](https://www.npmjs.com/package/isbot) |
| `camera-controls` override | `3.1.0` | Satisfies Drei's `^3.1.0` dependency and supports Node `>=20.11`. The newer 3.1.2 raises its engine to Node 22. Requires npm `>=10.8.2`; the project selects npm 10.9.4. [Versioned manifest](https://github.com/yomotsu/camera-controls/blob/v3.1.0/package.json) |

The checked-in lockfile is the authoritative transitive dependency resolution. These pins prioritize a reproducible, compatible foundation rather than automatically selecting a new major release from `latest`.

## Static React Router framework deployment

Use the official React Router Vite plugin (`reactRouter()` from `@react-router/dev/vite`) and the framework route manifest. Disable the runtime server while explicitly pre-rendering every public URL:

```ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  prerender: [
    '/', '/atlas', '/expeditions',
    '/expedition/kilauea', '/expedition/reykjanes',
    '/expedition/st-helens', '/expedition/etna',
    '/expedition/tajogaite', '/expedition/vesuvius',
    '/subsurface', '/evidence', '/method',
  ],
} satisfies Config;
```

An explicit list includes concrete values for the dynamic expedition route. `prerender: true` alone cannot discover dynamic parameter values. React Router writes the static HTML and navigation payloads to `build/client`; publish that directory. A host should resolve each route's `index.html`. If SPA fallback is desired, use `__spa-fallback.html` after checking static files first.

`ssr: false` disables a production application server; it does **not** disable build-time rendering. Keep route imports/rendering safe without `window`, `document`, WebGL, or map constructors. Initialize browser instruments in effects or client-only lazy components. `@react-router/node` remains necessary for the framework build. Do not use server `action` or `headers` exports.

Primary source: [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering), [SPA mode and build-time rendering](https://reactrouter.com/how-to/spa).

## Runtime and browser boundaries

- The provided environment runs Node `20.19.2`. Installation uses npm `10.9.4` to meet all resolved package engine requirements; `packageManager` records this version. Use npm 10.9.4 or newer with Node 20.19+, or Node 22.12+ with a compatible npm. The system npm 9 can run project scripts, but should not resolve this dependency tree. See the implementation report for the executed build and test results.
- Keep one shared R3F scene host and render only the active experience; do not create a Canvas in each editorial section. MapLibre owns a separate renderer only while its atlas instrument is active.
- Treat conceptual terrain as illustration. Do not label a procedural mesh or decorative raster as measured elevation data.
- The initial HTML, navigation, text, native form controls, and original artwork must work without WebGL. WebGL checks and failures should preserve those fallbacks.
- GSAP effects should use scoped cleanup and respect `prefers-reduced-motion`. Use ordinary document scrolling.

Package manifest compatibility does not replace runtime verification. Tests and the production pre-render build validate the selected versions together.
