import React, { useEffect, useMemo, useRef, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

export const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 0.8,
  ease = 'power3.out',
  scrollStart = 'top 90%',
  scrollEnd = 'bottom 60%',
  stagger = 0.02
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');
    return words.map((word, wIdx) => (
      <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
        {word.split('').map((char, cIdx) => (
          <span className="inline-block word" key={cIdx}>
            {char}
          </span>
        ))}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const charElements = el.querySelectorAll('.word');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        charElements,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          y: 35,
          scaleY: 1.15,
          transformOrigin: '50% 100%'
        },
        {
          duration: animationDuration,
          ease: ease,
          opacity: 1,
          y: 0,
          scaleY: 1,
          stagger: stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.6
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2
      ref={containerRef}
      className={`block leading-[1.2] pb-1 overflow-visible ${containerClassName}`}
    >
      <span className={`inline-flex flex-wrap items-baseline leading-[1.2] ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
};

export default ScrollFloat;
