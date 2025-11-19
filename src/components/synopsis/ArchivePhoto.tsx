import { useEffect, useState, useRef } from 'react';
import { ArchivePhotoOverlay } from './ArchivePhotoOverlay';

interface HistoricalPhoto {
  src: string;
  alt: string;
  archiveId: string;
  date?: string;
  caption?: string;
}

interface ArchivePhotoProps {
  photo: HistoricalPhoto;
  delay?: number;
  parallaxOffset?: number;
  index?: number;
}

export const ArchivePhoto = ({ photo, delay = 0, parallaxOffset = 0, index = 0 }: ArchivePhotoProps) => {
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

  // Scroll-based fade effect using Intersection Observer
  useEffect(() => {
    if (!photoRef.current) return;

    const element = photoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Photos move slower than text for depth effect
  const photoParallax = parallaxOffset * 0.5;
  const depthOffset = index * 5;

  return (
    <div 
      ref={photoRef}
      className="archive-photo-container"
      style={{
        transform: `translateY(${photoParallax}px) translateZ(${-depthOffset}px) scale(${1 - depthOffset * 0.002})`,
        opacity: scrollOpacity,
        transition: 'transform 0.1s ease-out, opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="relative">
        <img
          src={photo.src}
          alt={photo.alt}
          className="archive-photo"
          loading="lazy"
        />
        <ArchivePhotoOverlay />
      </div>
      
      <div className="archive-metadata">
        <span>{photo.date || 'Unknown Date'}</span>
        <span>{photo.archiveId}</span>
      </div>
      
      {photo.caption && (
        <div className="archive-caption">
          {photo.caption}
        </div>
      )}
    </div>
  );
};
