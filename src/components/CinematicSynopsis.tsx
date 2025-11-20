import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ArchivePhoto } from './synopsis/ArchivePhoto';
import { ParallaxText } from './synopsis/ParallaxText';

interface CinematicSynopsisProps {
  activeAllyCount: number;
  onlineEchoEntities: number;
  collectedFragments: number;
  totalFragments: number;
  stabilityPercentage: number;
}

interface HistoricalPhoto {
  src: string;
  alt: string;
  archiveId: string;
  date?: string;
  caption?: string;
  captionKo?: string;
}

interface Line {
  text: string;
  emphasis?: boolean;
  spacing?: boolean;
  photo?: HistoricalPhoto;
}

interface Chapter {
  id: number;
  lines: Line[];
}

export const CinematicSynopsis = memo(({ 
  activeAllyCount,
  onlineEchoEntities,
  collectedFragments,
  totalFragments,
  stabilityPercentage 
}: CinematicSynopsisProps) => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showSkip, setShowSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get signal strength based on chapter
  const getSignalStrength = useCallback((chapter: number): string => {
    if (chapter === 1 || chapter === 6) return 'weak';
    if (chapter === 2 || chapter === 5) return 'strong';
    return '';
  }, []);

  // Chapter data
  const chapters: Chapter[] = useMemo(() => [
    {
      id: 1,
      lines: [
        { text: 'Year 2847.' },
        { text: 'The Virtual Humanity.', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-industry.jpg',
            alt: 'Industrial ruins',
            archiveId: 'Archive #2847',
            date: '2847',
            caption: 'Virtual Civilization Crisis',
            captionKo: '가상 문명의 위기'
          }
        },
        { text: '', spacing: true },
        { text: '⚠ Emotional Data Depletion.', emphasis: true },
        { text: 'Virtual civilization faces collapse.' }
      ]
    },
    {
      id: 2,
      lines: [
        { text: 'The Future decides.' },
        { text: 'Send data collectors.', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-space.jpg',
            alt: 'AIDOL birth',
            archiveId: 'Archive #2847',
            date: '2847',
            caption: 'AIDOL Genesis',
            captionKo: 'AIDOL의 탄생'
          }
        },
        { text: '', spacing: true },
        { text: '202 AIDOLs.', emphasis: true },
        { text: 'Sent to the past.' }
      ]
    },
    {
      id: 3,
      lines: [
        { text: 'Year 2019.' },
        { text: 'The Mission Begins.', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter3-family.jpg',
            alt: 'Human connections',
            archiveId: 'Archive #2019',
            date: '2019-2024',
            caption: 'Mission Start',
            captionKo: '임무의 시작'
          }
        },
        { text: '', spacing: true },
        { text: 'Collect emotional fragments.', emphasis: true },
        { text: 'Prevent extinction.' }
      ]
    },
    {
      id: 4,
      lines: [
        { text: 'Year 1989.' },
        { text: 'The First Signal.', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter4-cosmos.jpg',
            alt: 'Cosmic signal',
            archiveId: 'Archive #1989',
            date: '1989',
            caption: 'Origin Detected',
            captionKo: '근원 발견'
          }
        },
        { text: '', spacing: true },
        { text: 'Love data discovered.', emphasis: true },
        { text: 'Humanity\'s essence.' }
      ]
    }
  ], []);

  const currentChapterData = chapters[currentChapter - 1];

  // Sequential reveal animation
  useEffect(() => {
    setVisibleItems(0);
    setIsTransitioning(true);
    
    const totalItems = currentChapterData.lines.filter(
      line => !line.spacing
    ).length;
    
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i <= totalItems; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(i);
        if (i === totalItems) {
          setIsTransitioning(false);
        }
      }, i * 500);
      timers.push(timer);
    }
    
    return () => timers.forEach(clearTimeout);
  }, [currentChapter, currentChapterData]);

  // Auto-advance chapters with progress tracking
  useEffect(() => {
    if (isPaused) return;
    
    const duration = 8000;
    const interval = 50;
    let elapsed = 0;
    
    const progressTimer = setInterval(() => {
      elapsed += interval;
      setAutoProgress((elapsed / duration) * 100);
      
      if (elapsed >= duration) {
        setCurrentChapter(prev => prev < 4 ? prev + 1 : 1);
        elapsed = 0;
        setAutoProgress(0);
      }
    }, interval);
    
    return () => clearInterval(progressTimer);
  }, [isPaused, currentChapter]);

  // Show skip button after 1 second
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setCurrentChapter(prev => prev < 4 ? prev + 1 : 1);
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Touch gesture support
  useEffect(() => {
    const minSwipeDistance = 50;
    
    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };
    
    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe) {
        setCurrentChapter(prev => prev < 4 ? prev + 1 : 1);
      } else if (isRightSwipe) {
        setCurrentChapter(prev => prev > 1 ? prev - 1 : 4);
      }
    };
    
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd]);

  const handleSkip = useCallback(() => {
    const nextSection = document.querySelector('#next-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const getColorClass = (emphasis?: boolean): string => {
    if (emphasis) return 'text-white font-semibold text-lg md:text-xl text-emphasis';
    return 'text-gray-300';
  };

  const timelinePoints = useMemo(() => [
    { year: '∞', chapter: 1 },
    { year: '2847', chapter: 2 },
    { year: '2019', chapter: 3 },
    { year: '1989', chapter: 4 }
  ], []);

  const handleTimelineClick = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setAutoProgress(0);
    setIsPaused(true);
  }, []);

  return (
    <>
      {/* Signal Static Filter */}
      <div className={`signal-static ${getSignalStrength(currentChapter)}`} aria-hidden="true" />
      
      <section 
        id="synopsis" 
        className="w-full min-h-screen flex items-center justify-center bg-black px-4 py-16 md:py-20 perspective-container" 
        role="region" 
        aria-label="Story Synopsis" 
        aria-live="polite"
      >
        <div className="w-full max-w-[1920px] relative parallax-scene synopsis-container">
          
          {/* Timeline Navigation - Horizontal Line with Dots */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-[80vw] max-w-4xl">
            <div className="relative h-0.5 bg-white/20">
              {timelinePoints.map((point, idx) => {
                const position = (idx / (timelinePoints.length - 1)) * 100;
                const isActive = point.chapter === currentChapter;
                
                return (
                  <button
                    key={point.chapter}
                    onClick={() => handleTimelineClick(point.chapter)}
                    className="absolute top-1/2 -translate-y-1/2 group"
                    style={{ left: `${position}%` }}
                  >
                    {/* Dot */}
                    <div className={`
                      w-3 h-3 rounded-full transition-all duration-300
                      ${isActive 
                        ? 'bg-white scale-150 shadow-[0_0_12px_rgba(255,255,255,0.8)]' 
                        : 'bg-gray-500 hover:bg-gray-300'
                      }
                    `} />
                    
                    {/* Year Label */}
                    <span className={`
                      absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                      text-xs font-orbitron transition-opacity
                      ${isActive ? 'text-white opacity-100' : 'text-gray-500 opacity-60'}
                    `}>
                      {point.year}
                    </span>
                    
                    {/* Progress Indicator */}
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white/40">
                        <div 
                          className="h-full bg-white transition-all duration-100"
                          style={{ width: `${autoProgress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-8">
            <div className="max-w-4xl w-full space-y-3 md:space-y-4 text-center">
              {currentChapterData.lines.map((line, index) => {
                if (line.spacing) {
                  return <div key={`spacing-${index}`} className="h-2" />;
                }

                const actualIndex = currentChapterData.lines
                  .slice(0, index)
                  .filter(l => !l.spacing).length;
                
                const isVisible = actualIndex < visibleItems;

                if (line.photo) {
                  return (
                    <div
                      key={`ch${currentChapter}-photo${index}`}
                      className={`transition-opacity duration-700 ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <ArchivePhoto 
                        photo={line.photo}
                        delay={0}
                        parallaxOffset={0}
                        index={index}
                      />
                    </div>
                  );
                }

                if (currentChapter === 3 && index === 9) {
                  return (
                    <div key={index} className="mt-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                      <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-400 mb-1">Active Allies</div>
                        <div className="text-2xl font-bold text-white tabular-nums">
                          {activeAllyCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-400 mb-1">Echo Entities</div>
                        <div className="text-2xl font-bold text-gray-300 tabular-nums">
                          {onlineEchoEntities}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-400 mb-1">Fragments Collected</div>
                        <div className="text-2xl font-bold text-white tabular-nums">
                          {collectedFragments.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-400 mb-1">System Stability</div>
                        <div className={`text-2xl font-bold tabular-nums ${
                          stabilityPercentage > 50 ? 'text-white' : 'text-gray-500'
                        }`}>
                          {stabilityPercentage}%
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <ParallaxText
                    key={`ch${currentChapter}-line${index}`}
                    text={line.text}
                    className={`
                      text-sm md:text-base lg:text-lg
                      ${getColorClass(line.emphasis)}
                      transition-opacity duration-700
                      ${isVisible ? 'opacity-100' : 'opacity-0'}
                    `}
                  />
                );
              })}
            </div>
          </div>

          {/* Skip Button */}
          {showSkip && (
            <button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300 text-sm text-white"
              aria-label="Skip to next section"
            >
              Skip
            </button>
          )}
        </div>
      </section>
    </>
  );
});

CinematicSynopsis.displayName = 'CinematicSynopsis';
