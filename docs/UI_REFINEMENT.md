# Editorial UI refinement

The interface retains the archive's charcoal, paper, and volcanic-orange identity, with a more deliberate specimen-plate cover, improved reading rhythm, and artwork previews in the expedition index.

## Readability repairs

- Evidence records now use dark ink on paper, with a separate high-contrast selected state. Metadata, caveats, filters, and empty states follow the same theme.
- Record buttons cannot shrink below their contents. The bounded record list scrolls independently, including on mobile, so every record remains reachable.
- Navigation, instrument controls, geographic annotations, provenance, and research labels use larger type. Display headings have looser tracking and more line spacing.
- Expedition artwork receives a stronger text scrim; cards retain legible labels over artwork. Interactive controls retain keyboard focus indicators and reduced-motion support.

## Composition

The cover pairs an offset serif headline with a framed geological study and a concise plate caption. A field-index link gives visitors a direct path to all six landscapes. Expedition rows now include a terrain preview and a compact place/date line. Evidence controls and selected records share a consistent grid.

## Scope

This is a static, locally sourced research archive. Existing atlas search, six expedition instruments, evidence filters, dated comparisons, source downloads, and subsurface controls remain the core functionality. No external service or deployment configuration is required to use the generated site.

`tests/readability.spec.ts` guards label contrast, text containment, and access to the final evidence record at desktop and mobile widths. Existing browser tests cover all public routes and research interactions.
