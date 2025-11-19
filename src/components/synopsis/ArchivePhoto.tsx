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
}

export const ArchivePhoto = ({ photo, delay = 0 }: ArchivePhotoProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <div className="archive-photo-container">
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
