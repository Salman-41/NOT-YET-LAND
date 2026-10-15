# NOT YET LAND V02 — QA / Awwwards-readiness audit

**Design objective:** target 8+ on the published Awwwards weighting (40% Design / 30% Usability / 20% Creativity / 10% Content). **No actual jury evaluation has occurred**. This is a prototype quality review, not a claim that it will score 8 or above.

## Functional QA performed

- Chromium headless inspections: 48 route × viewport combinations (12 routes at desktop 1440×900, tablet 768×1024, mobile 390×844, and small mobile 320×740).
- Zero JavaScript `pageerror` events in the run; zero horizontal document overflow across tested combinations.
- Atlas volcano selection changed the detail panel; search filtered to Etna.
- St. Helens investigation slider updated to its fourth-stage label.
- Subsurface cutaway slider updated the interior SVG clipping boundary, and Surface reset worked.
- Evidence comparison divider followed slider input.
- Menu toggled, ARIA expanded state updated, and Escape closed the menu.
- Desktop and mobile visual screenshots manually inspected. Previously found duplicate map markers, mobile map overflow, mobile evidence-label collision and cream-background navigation contrast were addressed.

**Not tested:** hosted Lighthouse or CrUX metrics, actual Core Web Vitals, physical-device GPU behavior, real-world network loads, screen readers, wide browser/device matrix, 3D scene FPS (there is no full production 3D scene yet), content reviewed by volcanologists, authenticated license inventory.

## Benchmarks considered

- Awwwards PLAYlab (published 7.66), Finely Crafted (7.88), Oat the Goat (7.88): these experiences mix unique visual execution and purposeful engagement; they provide benchmarks of award-level craft, **not direct proofs** that our design will receive any given score.
- Evaluation emphasised structured scientific content, precise editorial identity, contrasting routes, true interaction, mobile usability and originality, while avoiding the false equivalence of a static visual mock-up with a production immersive website.

## Current internal readiness, not a score forecast

| Category | Weight | V02 design readiness judgment | Work for 8+ ambition |
|---|---:|---|---|
| Design | 40% | Stronger editorial style, unique relief artwork, responsive layouts | Photographic credibility, detailed motion direction, expert art-direction QA |
| Usability | 30% | Navigation and sliders work; 320px–1440px basic layouts passed | Touch ergonomics, WCAG audit, actual real-device testing, measurable performance |
| Creativity | 20% | Six distinct scientific questions; one cutaway as focal interaction | Real-time geospatial 3D and continuous terrain-to-cross-section motion; varied spatial transitions |
| Content | 10% | Fact-based chapter concepts and bibliography | Integrated, legally reusable scientific datasets, verified citations per interactive state |

**Decision:** Continue with this art direction. Do not submit the V02 prototype expecting an 8+ jury score. The major remaining delta is genuine data-driven depth rather than another cosmetic redesign.
