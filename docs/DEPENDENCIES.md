# Dependency compatibility

Verified on 15 October 2026 using the published npm package manifests, the local npm cache, and the primary documentation linked below. All direct dependencies are pinned to exact stable versions; no direct alpha, beta, canary, or experimental dependency is selected.

## Selected versions

| Package | Version | Compatibility decision / primary source |
| --- | --- | --- |
| `react`, `react-dom` | `19.3.0` | Identical versions; stable React 19. [Published versions](https://www.npmjs.com/package/react?activeTab=versions) |
| `react-router`, `@react-router/dev`, `@react-router/node` | `7.18.4` | Requested v7 framework mode; all packages kept aligned. Dev package accepts Vite 5/6/7/8 and TypeScript 5/6, requires Node 20+. Upgraded from the cached 7.15.1 after the vulnerability check. [Versioned manifest](https://github.com/remix-run/react-router/blob/react-router%407.18.4/packages/react-router-dev/package.json) |
| `vite` | `6.4.3` | Stable compatible Vite release available locally. Its Node range includes Node 22; React Router explicitly supports Vite 6. [Vite 6 documentation](https://v6.vite.dev/guide/) |
| `typescript` | `5.9.3` | Within React Router's declared `^5.1.0` peer range. TypeScript 7 is deliberately excluded. [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) |
| `@react-three/fiber` | `9.8.1` | R3F v9 is the React 19 compatibility line. Published peers accept React `>=19 <19.4` and Three `>=0.156`. [v9 migration](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide), [published manifest](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/package.json) |
| `@react-three/drei` | `10.7.9` | Peers require Fiber 9, React 19, Three `>=0.159`; all satisfied. [Versioned manifest](https://github.com/pmndrs/drei/blob/v10.7.9/package.json), [Drei documentation](https://drei.docs.pmnd.rs/) |
| `three` / `@types/three` | `0.186.1` / `0.186.0` | Runtime and types use the same r186 release family. [Three installation](https://threejs.org/manual/#en/installation) |
| `gsap` | `3.15.0` | Includes ScrollTrigger; no separate plugin dependency. [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) |
| `maplibre-gl` | `6.14.0` | Stable patched v6; loaded only in the browser with its Vite worker URL. Uses named exports and requires WebGL2; preserve the illustration fallback. No API credential is needed for an owned local style/source. [Versioned manifest](https://github.com/maplibre/maplibre-gl-js/blob/v6.14.0/package.json), [v6 migration](https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/) |
| `zustand` | `5.0.15` | React peer `>=18`, satisfied by React 19. [Zustand documentation](https://zustand.docs.pmnd.rs/getting-started/introduction) |
| `vitest` | `4.1.12` | Stable v4 patch; selected after the full dependency audit identified advisories affecting v3. Compatible with the supported Node 22 runtime and Vite 6. [v4 documentation](https://v4.vitest.dev/guide/), [versioned manifest](https://github.com/vitest-dev/vitest/blob/v4.1.12/packages/vitest/package.json) |
| `@playwright/test` | `1.64.0` | Published engine requires Node 20+. [Playwright installation](https://playwright.dev/docs/intro) |
| `@types/react`, `@types/react-dom`, `@types/node` | `19.3.0`, `19.3.0`, `22.20.4` | Match the React and supported Node majors. |
| `isbot` | `5.2.2` | Explicit framework build dependency; prevents React Router from starting an implicit install. [Package](https://www.npmjs.com/package/isbot) |

No dependency compatibility overrides or legacy peer-dependency flags are used. The supported development/build runtime is Node 22.12+ with npm 11.21.1+; `camera-controls` and the MapLibre style-spec's JSON linter require Node 22, despite some parent packages advertising broader engine ranges. npm 11 resolves the optional test-tool peer graph that triggered an internal npm 10 resolver error.

The framework's Babel compiler transitively requires `gensync@1.0.0-beta.2`, its established published dependency. This is the only pre-release package in the lockfile; replacing it would require overriding Babel's supported compiler dependency.

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

- The host's initial Node `20.19.2` is older than the supported complete dependency graph. Validation uses isolated stable Node `22.23.3` and npm `11.21.1`, without changing the system toolchain. `.nvmrc` and `.node-version` select Node 22; `packageManager` records npm 11.21.1. See the implementation report for the executed build and test results.
- Keep one shared R3F scene host and render only the active experience; do not create a Canvas in each editorial section. MapLibre owns a separate renderer only while its atlas instrument is active.
- Treat conceptual terrain as illustration. Do not label a procedural mesh or decorative raster as measured elevation data.
- The initial HTML, navigation, text, native form controls, and original artwork must work without WebGL. WebGL checks and failures should preserve those fallbacks.
- GSAP effects should use scoped cleanup and respect `prefers-reduced-motion`. Use ordinary document scrolling.

Package manifest compatibility does not replace runtime verification. Tests and the production pre-render build validate the selected versions together.

## Dependency audit

The final installed lockfile passed `npm audit` on 15 October 2026 with **0 known vulnerabilities**, including development dependencies (98 production and 173 development dependency entries; 270 total entries including categories that overlap). The audit prompted the patched React Router, MapLibre, and Vitest selections above. This is a point-in-time advisory check, not a guarantee against future vulnerabilities.

npm 11 explicitly approves the known `esbuild@0.25.12` build installation script in package metadata. No blanket installation-script permission is used.
