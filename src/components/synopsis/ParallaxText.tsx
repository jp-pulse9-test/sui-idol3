import { useEffect, useRef, useState } from 'react';

interface ParallaxTextProps {
  text: string;
  className: string;
  style?: React.CSSProperties;
}

export const ParallaxText = ({ text, className, style }: ParallaxTextProps) => {
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const element = textRef.current;
    let rafId: number;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (rafId) cancelAnimationFrame(rafId);
          
          rafId = requestAnimationFrame(() => {
            const ratio = entry.intersectionRatio;
            
            if (ratio > 0.4) {
              setScrollOpacity(1);
            } else if (ratio > 0.1) {
              const fadeProgress = (ratio - 0.1) / 0.3;
              setScrollOpacity(fadeProgress);
            } else {
              setScrollOpacity(0);
            }
          });
        });
      },
      {
        threshold: [0, 0.1, 0.4, 0.7, 1.0],
        rootMargin: '-15% 0px -15% 0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <p
      ref={textRef}
      className={className}
      style={{
        ...style,
        opacity: scrollOpacity,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {text}
    </p>
  );
};
