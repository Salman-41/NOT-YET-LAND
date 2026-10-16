import { useId } from 'react';
import { c } from './ui';
export function SectionDiagram({ reveal }: { reveal: number }) {
  const id = useId().replace(/:/g, '');
  const sky = `${id}-sky`;
  const rock = `${id}-rock`;
  const melt = `${id}-melt`;
  const glow = `${id}-glow`;
  const clip = `${id}-clip`;
  const boundary = (1100 * reveal) / 100;

  return (
          <svg className={c('geosection-svg')} viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={`${id}-title ${id}-description`}>
            <title id={`${id}-title`}>Illustrative volcanic cross-section</title>
            <desc id={`${id}-description`}>Layered rock, a shallow conduit, and a conceptual melt reservoir. The interior is {reveal} percent revealed. This generalized diagram is not a measured section of any featured volcano.</desc>
            <defs>
              <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12201b" /><stop offset="1" stopColor="#273c30" /></linearGradient>
              <linearGradient id={rock} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b7467" /><stop offset="1" stopColor="#27372e" /></linearGradient>
              <linearGradient id={melt} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb968" /><stop offset="1" stopColor="#a9442b" /></linearGradient>
              <filter id={glow}><feGaussianBlur stdDeviation="12" /></filter>
              <clipPath id={clip}><rect id="clipInterior" x="0" y="0" width={boundary} height="620" /></clipPath>
            </defs>
            <rect width="1100" height="620" fill={`url(#${sky})`} />
            <g opacity=".09" stroke="#d1dfce"><path d="M0 100H1100M0 200H1100M0 300H1100M0 400H1100M0 500H1100M200 0V620M400 0V620M600 0V620M800 0V620M1000 0V620" /></g>
            <g id="surfaceLayer">
              <path d="M0 345L140 330L260 285L370 233L444 166L485 190L520 168L566 244L660 295L800 318L950 329L1100 345V620H0Z" fill={`url(#${rock})`} />
              <path d="M0 345L140 330L260 285L370 233L444 166L485 190L520 168L566 244L660 295L800 318L950 329L1100 345" fill="none" stroke="#e5e5ce" strokeWidth="2" />
              <g opacity=".24" stroke="#d4e0cb" fill="none">
                <path d="M110 345Q240 325 420 240M180 365Q310 347 451 266M230 387Q364 353 481 290M490 240Q634 299 880 335" />
                <path d="M270 414Q410 390 565 390T980 425M210 463Q410 442 600 455T1020 478M80 512Q400 477 700 500T1060 527" />
              </g>
            </g>
            <g clipPath={`url(#${clip})`} id="cutContent">
              <path d="M0 345L140 330L260 285L370 233L444 166L485 190L520 168L566 244L660 295L800 318L950 329L1100 345V620H0Z" fill="#404c3c" />
              <path d="M0 381Q250 347 430 352T1100 378V620H0Z" fill="#465849" />
              <path d="M0 434Q300 405 540 443T1100 423V620H0Z" fill="#374839" />
              <path d="M0 512Q290 478 570 513T1100 494V620H0Z" fill="#2a3a30" />
              <path d="M0 552Q190 512 430 550T1100 533V620H0Z" fill="#192d26" />
              <path id="meltGlow" d="M335 620Q353 536 441 485Q480 461 475 396L482 206L496 201L512 397Q506 463 561 484Q655 525 672 620Z" fill="#f16c34" opacity=".48" filter={`url(#${glow})`} />
              <path id="magmaPath" d="M374 620Q410 537 453 510Q486 488 485 398L480 210L493 205L503 395Q498 482 547 510Q593 538 629 620Z" fill={`url(#${melt})`} />
              <path d="M404 620Q458 583 490 577Q531 582 585 620" fill="#fbb066" opacity=".85" />
              <g stroke="#f6b16c" strokeDasharray="7 9" fill="none" opacity=".95"><path d="M530 390L735 345H945" /><path d="M520 544L762 545H966" /></g>
              <g fontFamily="monospace" fontSize="13" fill="#e5dbbe" letterSpacing="2">
                <text x="949" y="340">SHALLOW CONDUIT</text>
                <text x="971" y="538">MELT RESERVOIR*</text>
                <text x="40" y="406">STRATUM 01</text>
                <text x="40" y="478">STRATUM 02</text>
                <text x="40" y="553">STRATUM 03</text>
              </g>
            </g>
            <g stroke="#f7d39e" strokeWidth="1" opacity=".7">
              <path id="cutSeam" d={`M${boundary} 0V620`} strokeDasharray="5 8" />
              <circle id="cutMarker" cx={boundary} cy="190" r="8" fill="#ef7b49" />
            </g>
            <g fontFamily="monospace" fontSize="12" letterSpacing="2" fill="#f2e8d5">
              <text x="35" y="60">SURFACE / VISIBLE</text>
              <text x="800" y="60">INTERIOR / INFERRED</text>
              <text x="40" y="595" opacity=".6">*DIAGRAM IS GENERALIZED. MAGMA STORAGE GEOMETRY VARIES BETWEEN VOLCANOES.</text>
            </g>
          </svg>
  );
}
