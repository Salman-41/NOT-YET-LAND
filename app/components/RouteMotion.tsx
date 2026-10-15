import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { c } from './ui';

export function RouteMotion() {
  const progress = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const context = gsap.context(() => {
      if (!reduce.matches) gsap.fromTo('#main', { opacity: 0.45, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'all' });
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`; } });
    });
    return () => context.revert();
  }, [pathname]);
  return <div ref={progress} className={c('progress', 'scroll-progress')} aria-hidden="true" />;
}
