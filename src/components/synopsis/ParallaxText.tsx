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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-15% 0px -15% 0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
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
