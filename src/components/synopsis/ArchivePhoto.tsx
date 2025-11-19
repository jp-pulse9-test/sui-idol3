import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  // Photos move slower than text for depth effect
  const photoParallax = parallaxOffset * 0.5;
  const depthOffset = index * 5;

  return (
    <div 
      className="archive-photo-container"
      style={{
        transform: `translateY(${photoParallax}px) translateZ(${-depthOffset}px) scale(${1 - depthOffset * 0.002})`,
        transition: 'transform 0.1s ease-out'
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
