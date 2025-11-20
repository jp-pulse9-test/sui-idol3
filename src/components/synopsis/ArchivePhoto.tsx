import { useEffect, useState, useRef, memo } from 'react';
import { ArchivePhotoOverlay } from './ArchivePhotoOverlay';

interface HistoricalPhoto {
  src: string;
  alt: string;
  archiveId: string;
  date?: string;
  caption?: string;
  captionKo?: string;
}

interface ArchivePhotoProps {
  photo: HistoricalPhoto;
  delay?: number;
  parallaxOffset?: number;
  index?: number;
}

export const ArchivePhoto = memo(({ photo, delay = 0, parallaxOffset = 0, index = 0 }: ArchivePhotoProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const photoRef = useRef<HTMLDivElement>(null);

  // Initial delay animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Scroll-based fade effect using Intersection Observer (debounced)
  useEffect(() => {
    if (!photoRef.current) return;

    const element = photoRef.current;
    let rafId: number;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (rafId) cancelAnimationFrame(rafId);
          
          rafId = requestAnimationFrame(() => {
            // Calculate opacity based on intersection ratio
            // Fade starts when 20% visible, fully visible at 50%
            const ratio = entry.intersectionRatio;
            
            if (ratio > 0.5) {
              setScrollOpacity(1);
            } else if (ratio > 0.2) {
              // Smooth fade-in from 20% to 50% visibility
              const fadeProgress = (ratio - 0.2) / 0.3;
              setScrollOpacity(fadeProgress);
            } else {
              setScrollOpacity(0);
            }
          });
        });
      },
      {
        threshold: [0, 0.2, 0.5, 0.8, 1.0],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Photos move slower than text for depth effect (reduced intensity)
  const photoParallax = parallaxOffset * 0.3;
  const depthOffset = index * 3;

  return (
    <div 
      ref={photoRef}
      className="archive-photo-container"
      style={{
        transform: `translateY(${photoParallax}px) translateZ(${-depthOffset}px) scale(${1 - depthOffset * 0.002})`,
        opacity: scrollOpacity,
        transition: 'transform 0.1s ease-out, opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        maxHeight: '35vh'
      }}
    >
      <div className="relative max-h-[35vh] md:max-h-[35vh]">
        <img
          src={photo.src}
          alt={photo.alt}
          className="archive-photo signal-receive object-contain max-h-[30vh] md:max-h-[35vh]"
          style={{
            filter: 'grayscale(1) contrast(1.1)'
          }}
          loading="lazy"
        />
        <ArchivePhotoOverlay />
      </div>
      
      {/* Metadata: shown on hover */}
      <div className="archive-metadata">
        <span>{photo.date || 'Unknown Date'}</span>
        <span>{photo.archiveId}</span>
      </div>
      
      {/* Captions: always visible */}
      {(photo.captionKo || photo.caption) && (
        <div className="archive-caption-bilingual">
          {photo.captionKo && (
            <div className="caption-ko">{photo.captionKo}</div>
          )}
          {photo.caption && (
            <div className="caption-en text-xs opacity-60">{photo.caption}</div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.photo.src === nextProps.photo.src &&
         prevProps.parallaxOffset === nextProps.parallaxOffset;
});
