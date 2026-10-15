import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChapterTransition, Kicker, c } from '../components/ui';
import { VOLCANOES, asset, terrain, type Volcano } from '../data/volcanoes';

function ExpeditionRecord({ volcano: s, index }: { volcano: Volcano; index: number }) {
  const [phase, setPhase] = useState(1);
  const record = String(index + 1).padStart(2, '0');
  const step = String(phase + 1).padStart(2, '0');
  const next = VOLCANOES[(index + 1) % VOLCANOES.length];

  return (
    <div className={c('view')}>
      <section className={c('chapter-hero')} aria-labelledby="expedition-title">
        <div className={c('chapter-image')} style={{ backgroundImage: `url('${asset(s.art)}')` }} aria-hidden="true" />
        <div className={c('chapter-contour')} style={{ backgroundImage: `url('${terrain(s.art)}')` }} aria-hidden="true" />
        <div className={c('chapter-content')}>
          <div className={c('pretitle')}>
            <div className={c('chapter-number')}>{record}</div>
            <div className={c('mono')}>
              FIELD EXPEDITION / {s.region}<br />
              SELECTED RECORD / {s.year}
            </div>
          </div>
          <h1 id="expedition-title" className={c('chapter-title')}>
            <span>{s.display[0]}</span>
            <span className={c('chapter-secondary')}>{s.display[1]}<span className={c('rust')}>.</span></span>
          </h1>
          <div className={c('chapter-subtitle')}>
            <p className={c('support')}>{s.lead}</p>
            <p className={c('bodycopy')}>{s.subtitle}. Follow the evidence beneath the spectacle.</p>
          </div>
        </div>
        <div className={c('chapter-stamp', 'mono')}>
          {s.type.toUpperCase()}<br />
          {s.lat.toFixed(2)}° N / {Math.abs(s.long).toFixed(2)}° {s.long < 0 ? 'W' : 'E'}
        </div>
        <div className={c('chapter-bottom')}>
          <span className={c('mono')}>{record} OF 06 / {s.subtitle}</span>
          <span className={c('mono')}>↓ SCROLL TO INVESTIGATE</span>
          <Link className={c('mono')} to="/atlas">BACK TO ATLAS ↗</Link>
        </div>
      </section>

      <section className={c('chapter-intro')} aria-labelledby="field-question">
        <div>
          <Kicker>FIELD QUESTION / {record}</Kicker>
          <h2 id="field-question">{s.headline}</h2>
          <p className={c('bodycopy')}>{s.description}</p>
        </div>
        <div>
          <p className={c('support')} style={{ fontSize: 33, lineHeight: 1.28 }}>{s.question}</p>
          <div className={c('chapter-metadata')}>
            <div className={c('mono')}>SYSTEM<br /><strong style={{ font: '18px var(--sans)', letterSpacing: 0 }}>{s.type}</strong></div>
            <div className={c('mono')}>CASE STUDY<br /><strong style={{ font: '18px var(--sans)', letterSpacing: 0 }}>{s.year}</strong></div>
            <div className={c('mono')} style={{ gridColumn: '1 / 3' }}>REGION<br /><strong style={{ font: '18px var(--sans)', letterSpacing: 0 }}>{s.region}</strong></div>
          </div>
        </div>
      </section>

      <section className={c('chapter-interaction')} aria-labelledby="interactive-study">
        <div className={c('interaction-head')}>
          <div>
            <Kicker>INTERACTIVE STUDY / {record}</Kicker>
            <h2 id="interactive-study">{s.interaction}<span className={c('rust')}>.</span></h2>
          </div>
          <p>{s.moduleText}</p>
        </div>
        <div className={c('interaction-stage')}>
          <div id="stageArt" className={c('stage-art', `module-${s.module}`, `phase-${phase}`)} data-phase={phase}>
            <img src={asset(s.art)} alt={`Illustrative geological terrain for ${s.name}; artistic concept, not measured terrain`} loading="lazy" />
            <div id="stageOverlay" className={c('lava-overlay')} style={{ opacity: 0.16 + phase * 0.27 }} aria-hidden="true" />
            <div id="stageLines" className={c('thin-lines')} style={{ opacity: 0.12 + phase * 0.23, transform: `rotate(${phase * 14 - 30}deg)` }} aria-hidden="true" />
            <div id="moduleTarget" className={c('module-target', 'pulse')} style={{ width: 95 + phase * 45, height: 95 + phase * 45 }} aria-hidden="true" />
            <div className={c('stage-top', 'mono')}><span>FIELD STUDY / {s.name.toUpperCase()}</span><span>FIG. {record}—A</span></div>
            <div className={c('stage-bottom')}>
              <div className={c('label')}>{s.question.toUpperCase()}</div>
              <div className={c('stage-illustration-note')}>ARTISTIC CONCEPT / NOT A MEASUREMENT</div>
            </div>
          </div>
          <div className={c('module-panel')}>
            <div className={c('module-index')}>FIELD INSTRUMENT / {s.module.toUpperCase()}</div>
            <h3>{s.interaction}</h3>
            <p id="module-description">{s.moduleText}</p>
            <div className={c('module-option')}>
              <label htmlFor="moduleRange" id="moduleLabel">{s.interaction} / <span id="moduleNumber">{step}</span> OF 04</label>
              <input
                id="moduleRange"
                type="range"
                min="0"
                max="3"
                step="1"
                value={phase}
                aria-label={`${s.interaction} progression`}
                aria-describedby="module-description"
                aria-valuetext={`Step ${phase + 1} of 4: ${s.moduleSteps[phase]}`}
                onChange={(event) => setPhase(Math.max(0, Math.min(3, Number(event.currentTarget.value))))}
              />
              <div className={c('mono', 'muted')} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9 }} aria-hidden="true"><span>01</span><span>04</span></div>
            </div>
            <div className={c('module-readout')} aria-live="polite" aria-atomic="true">
              <strong id="moduleStepName">{s.moduleSteps[phase]}</strong>
              <p id="moduleStepCaption">STEP {step} / CONCEPT MODEL</p>
            </div>
          </div>
        </div>
      </section>

      <section className={c('history-top')} aria-labelledby="landscape-keeps">
        <Kicker>READ THE TRACE / {s.year}</Kicker>
        <h2 id="landscape-keeps">What the landscape<br /><em>keeps.</em></h2>
      </section>
      <div className={c('history-grid')}>
        <div className={c('history-card')}>
          <div className={c('number')}>01 / OBSERVATION</div>
          <h3>{s.note1}</h3>
          <p>{s.note1desc}</p>
        </div>
        <div className={c('history-card')}>
          <div className={c('number')}>02 / EVIDENCE</div>
          <h3>{s.fact}</h3>
          <p><b>{s.factLabel}.</b> Explore the original scientific reference for the context and uncertainties behind this figure.</p>
          <a className={c('arrow-link')} target="_blank" rel="noopener noreferrer" href={s.sourceUrl} aria-label={`Open original source: ${s.source} (opens in a new tab)`}>OPEN ORIGINAL SOURCE <span className={c('arr')} aria-hidden="true">↗</span></a>
        </div>
      </div>
      <ChapterTransition next={next} />
    </div>
  );
}

export default function Expedition() {
  const { slug } = useParams();
  const index = VOLCANOES.findIndex((volcano) => volcano.slug === slug);
  const volcano = VOLCANOES[index];
  if (!volcano) throw new Response('Expedition not found', { status: 404 });

  return <ExpeditionRecord key={volcano.slug} volcano={volcano} index={index} />;
}
