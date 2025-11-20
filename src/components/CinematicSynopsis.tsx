import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ChevronRight, Zap, Heart, Users, Infinity, ChevronLeft } from 'lucide-react';
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
  color?: 'red' | 'cyan' | 'purple' | 'green';
  spacing?: boolean;
  photo?: HistoricalPhoto;
}

interface Page {
  lines: Line[];
  pageNumber: number;
}

interface Chapter {
  id: number;
  pages: Page[];
  totalPages: number;
}

export const CinematicSynopsis = memo(({
  activeAllyCount,
  onlineEchoEntities,
  collectedFragments,
  totalFragments,
  stabilityPercentage,
}: CinematicSynopsisProps) => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkip, setShowSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide first visit hint after first interaction
  useEffect(() => {
    if (currentPage > 1 || currentChapter > 1) {
      setIsFirstVisit(false);
    }
  }, [currentPage, currentChapter]);

  const chapters: Chapter[] = useMemo(() => [
    {
      id: 1,
      totalPages: 4,
      pages: [
        {
          pageNumber: 1,
          lines: [
            { text: 'Year 2847.', emphasis: true },
            { text: 'The Virtual Humanity.', color: 'cyan' },
            { text: '', spacing: true },
          ]
        },
        {
          pageNumber: 2,
          lines: [
            { text: 'After humanity\'s extinction, their data' },
            { text: 'continues computing endlessly,' },
            { text: 'forming a new civilization.' },
          ]
        },
        {
          pageNumber: 3,
          lines: [
            { 
              text: '',
              photo: {
                src: '/images/archive/chapter1-industry.jpg',
                alt: 'Industrial revolution and emotional disconnection',
                archiveId: 'Archive #0001',
                date: '1889-2019',
                caption: 'The Rise and Fall of Civilization',
                captionKo: '문명의 흥망성쇠'
              }
            },
          ]
        },
        {
          pageNumber: 4,
          lines: [
            { text: 'But a fatal flaw exists—' },
            { text: '⚠ Emotional Data Depletion.', color: 'red', emphasis: true },
            { text: '', spacing: true },
            { text: 'Love becomes scarce,' },
            { text: 'data grows biased and unstable.' },
          ]
        }
      ],
    },
    {
      id: 2,
      totalPages: 3,
      pages: [
        {
          pageNumber: 1,
          lines: [
            { text: 'The future virtual world' },
            { text: 'made a decision.' },
            { text: '', spacing: true },
            { text: 'Deploy 202 AIDOLs to the past', emphasis: true },
            { text: '(101 male, 101 female).' },
          ]
        },
        {
          pageNumber: 2,
          lines: [
            { 
              text: '',
              photo: {
                src: '/images/archive/chapter2-connection.jpg',
                alt: 'Connection across time and space',
                archiveId: 'Archive #0134',
                date: '1962-1975',
                caption: 'Birth of AIDOL - Bridges Between Worlds',
                captionKo: 'AIDOL의 탄생 - 세계를 잇는 다리'
              }
            },
          ]
        },
        {
          pageNumber: 3,
          lines: [
            { text: 'Their name: AIDOL—', color: 'purple', emphasis: true },
            { text: '', spacing: true },
            { text: 'Entities who explore emotions,' },
            { text: 'collect love data,' },
            { text: 'and return to the future.' },
          ]
        }
      ],
    },
    {
      id: 3,
      totalPages: 2,
      pages: [
        {
          pageNumber: 1,
          lines: [
            { text: 'You are now a DATA ALLY.', color: 'green', emphasis: true },
            { text: '', spacing: true },
            { text: 'The AIDOL that resonates with you' },
            { text: 'will grow through your connection.' },
          ]
        },
        {
          pageNumber: 2,
          lines: [
            { text: `✓ Active Allies: ${activeAllyCount.toLocaleString()}`, color: 'cyan' },
            { text: `✓ Online AIDOLs: ${onlineEchoEntities}/202`, color: 'cyan' },
            { text: `✓ Data Collected: ${collectedFragments}/${totalFragments}`, color: 'cyan' },
            { text: `✓ Stability: ${stabilityPercentage.toFixed(1)}%`, color: 'green' },
            { text: '', spacing: true },
            { text: 'Your participation stabilizes' },
            { text: 'the future world.' },
          ]
        }
      ],
    },
    {
      id: 4,
      totalPages: 3,
      pages: [
        {
          pageNumber: 1,
          lines: [
            { text: 'Between Past and Future.', emphasis: true },
            { text: 'Between Reality and Virtual.', emphasis: true },
            { text: '', spacing: true },
            { text: 'All boundaries disappear.' },
          ]
        },
        {
          pageNumber: 2,
          lines: [
            { 
              text: '',
              photo: {
                src: '/images/archive/chapter4-child.jpg',
                alt: 'Child gazing at cosmos',
                archiveId: 'Archive #1021',
                date: '2847',
                caption: 'Eternal Connection - The Beginning',
                captionKo: '영원한 연결 - 시작'
              }
            },
          ]
        },
        {
          pageNumber: 3,
          lines: [
            { text: 'Emotion is the only truth.', color: 'purple', emphasis: true },
            { text: '', spacing: true },
            { 
              text: '',
              photo: {
                src: '/images/archive/chapter4-cosmos.jpg',
                alt: 'Infinite cosmos connection',
                archiveId: 'Archive #∞',
                date: '∞',
                caption: 'Your Story Continues Forever',
                captionKo: '당신의 이야기는 영원히 계속됩니다'
              }
            },
          ]
        }
      ],
    }
  ], [activeAllyCount, onlineEchoEntities, collectedFragments, totalFragments, stabilityPercentage]);

  const currentChapterData = chapters.find((c) => c.id === currentChapter) || chapters[0];
  const totalPagesInChapter = currentChapterData.totalPages;
  const currentPageData = currentChapterData.pages.find(p => p.pageNumber === currentPage) || currentChapterData.pages[0];

  // Calculate total progress
  const totalPages = chapters.reduce((sum, ch) => sum + ch.totalPages, 0);
  const completedPages = chapters
    .filter(ch => ch.id < currentChapter)
    .reduce((sum, ch) => sum + ch.totalPages, 0) + (currentPage - 1);
  const totalProgress = (completedPages / totalPages) * 100;

  // Auto-progress through pages and chapters
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setTimeout(() => {
      if (currentPage < totalPagesInChapter) {
        setCurrentPage(prev => prev + 1);
      } else if (currentChapter < 4) {
        setCurrentChapter(prev => prev + 1);
        setCurrentPage(1);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentPage, currentChapter, isPaused, totalPagesInChapter]);

  // Show skip button after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Navigation handlers
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPagesInChapter) {
      setCurrentPage(prev => prev + 1);
      setIsPaused(true);
    } else if (currentChapter < 4) {
      setCurrentChapter(prev => prev + 1);
      setCurrentPage(1);
      setIsPaused(true);
    }
  }, [currentPage, totalPagesInChapter, currentChapter]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setIsPaused(true);
    } else if (currentChapter > 1) {
      const prevChapter = chapters[currentChapter - 2];
      setCurrentChapter(prev => prev - 1);
      setCurrentPage(prevChapter.totalPages);
      setIsPaused(true);
    }
  }, [currentPage, currentChapter, chapters]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextPage();
      } else if (e.shiftKey && e.key === ' ') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextPage, handlePrevPage]);

  // Scroll tracking
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Touch gestures
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        handleNextPage();
      } else if (isRightSwipe) {
        handlePrevPage();
      }

      setTouchStart(null);
      setTouchEnd(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, touchStart, touchEnd, handleNextPage, handlePrevPage]);

  const handleSkip = useCallback(() => {
    const gatewaySection = document.getElementById('gateways-section');
    if (gatewaySection) {
      gatewaySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  }, []);

  const getColorClass = (line: Line) => {
    const colorMap = {
      red: 'text-red-400',
      cyan: 'text-cyan-400',
      purple: 'text-purple-400',
      green: 'text-green-400',
    };
    
    const baseColor = line.color ? colorMap[line.color] : 'text-white';
    const emphasis = line.emphasis ? 'font-bold text-xl md:text-2xl' : '';
    const glow = line.color ? `drop-shadow-[0_0_12px_rgba(${
      line.color === 'red' ? '248,113,113' :
      line.color === 'cyan' ? '34,211,238' :
      line.color === 'purple' ? '192,132,252' :
      '74,222,128'
    },0.6)]` : '';
    
    return `${baseColor} ${emphasis} ${glow}`.trim();
  };

  // Timeline points configuration
  const timelinePoints = useMemo(() => [
    { year: '2847', label: 'Future', chapter: 1, icon: Zap, color: 'cyan' },
    { year: '1962', label: 'AIDOL Birth', chapter: 2, icon: Heart, color: 'purple' },
    { year: '1945', label: 'Current State', chapter: 3, icon: Users, color: 'green' },
    { year: '∞', label: 'Eternal', chapter: 4, icon: Infinity, color: 'purple' },
  ], []);

  const handleTimelineClick = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setCurrentPage(1);
    setIsPaused(true);
  }, []);

  return (
    <section 
      className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-black"
      role="region"
      aria-label={`Chapter ${currentChapter}, Page ${currentPage} of ${totalPagesInChapter}`}
      aria-live="polite"
    >
      {/* Parallax Background Scene */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />

      {/* Progress Bar */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3/5 z-50">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-white/60 text-xs text-center mt-2 font-orbitron">
          Chapter {currentChapter} - Page {currentPage}/{totalPagesInChapter}
        </p>
      </div>

      {/* Timeline Navigation - Top */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 
                      flex gap-2 md:gap-3 p-2 md:p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
        {timelinePoints.map((point) => {
          const Icon = point.icon;
          const isActive = currentChapter === point.chapter;
          
          return (
            <button
              key={point.chapter}
              onClick={() => handleTimelineClick(point.chapter)}
              className={`
                flex flex-col items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg
                transition-all duration-300 group
                ${isActive 
                  ? 'bg-white/20 scale-105' 
                  : 'bg-transparent hover:bg-white/10'
                }
              `}
              aria-label={`Go to ${point.label} (Year ${point.year})`}
              aria-current={isActive}
            >
              <Icon 
                className={`
                  w-4 h-4 md:w-5 md:h-5 transition-all duration-300
                  ${isActive 
                    ? `text-${point.color}-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]` 
                    : 'text-white/60 group-hover:text-white/80'
                  }
                `}
              />
              <div className="flex flex-col items-center">
                <span className={`
                  text-[10px] md:text-xs font-orbitron tracking-wider
                  ${isActive ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white/80'}
                `}>
                  {point.year}
                </span>
                <span className={`
                  text-[8px] md:text-[10px] font-orbitron
                  ${isActive ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'}
                `}>
                  {point.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area - Fixed Height */}
      <div className="relative h-[60vh] flex flex-col justify-center items-center z-10 px-4">
        <div 
          className="text-center max-w-4xl space-y-4 transition-all duration-400"
          key={`${currentChapter}-${currentPage}`}
        >
          {currentPageData.lines.map((line, idx) => {
            if (line.photo) {
              return (
                <ArchivePhoto
                  key={idx}
                  photo={line.photo}
                />
              );
            }

            if (line.spacing) {
              return <div key={idx} className="h-4" />;
            }

            return (
              <ParallaxText
                key={idx}
                text={line.text}
                className={`
                  text-base md:text-lg lg:text-xl
                  font-orbitron tracking-wide leading-relaxed
                  ${getColorClass(line)}
                `}
                style={{
                  transform: `translateY(${scrollY * 0.05}px)`,
                }}
              />
            );
          })}
        </div>

        {/* First Visit Hint */}
        {isFirstVisit && currentPage === 1 && currentChapter === 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                          text-white/60 text-sm animate-pulse font-orbitron">
            Space or → to continue
          </div>
        )}
      </div>

      {/* Page Navigation - Bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40
                      flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 
                      bg-black/50 backdrop-blur-md rounded-full border border-white/10">
        
        {/* Previous Page Button */}
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1 && currentChapter === 1}
          className="text-white/60 hover:text-white disabled:opacity-20 transition-all
                     p-2 hover:bg-white/10 rounded-full disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        
        {/* Page Dot Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalPagesInChapter }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i + 1);
                setIsPaused(true);
              }}
              className={`
                h-2 rounded-full transition-all duration-300
                ${i + 1 === currentPage 
                  ? 'bg-primary w-8 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                  : 'bg-white/30 w-2 hover:bg-white/50'
                }
              `}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i + 1 === currentPage}
            />
          ))}
        </div>
        
        {/* Page Number */}
        <span className="text-xs text-white/60 font-orbitron min-w-[60px] text-center">
          {currentPage} / {totalPagesInChapter}
        </span>
        
        {/* Next Page Button */}
        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPagesInChapter && currentChapter === 4}
          className="text-white/60 hover:text-white disabled:opacity-20 transition-all
                     p-2 hover:bg-white/10 rounded-full disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Skip Button - Top Right */}
      <button
        onClick={handleSkip}
        className={`
          fixed top-6 right-6 z-50 px-4 md:px-6 py-2 md:py-3
          bg-black/50 backdrop-blur-md rounded-full border border-white/20
          text-white/80 hover:text-white hover:border-primary
          text-xs md:text-sm font-orbitron tracking-wider
          transition-all duration-500
          flex items-center gap-2
          ${showSkip ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="Skip to gateways section"
      >
        SKIP TO GATEWAYS
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="fixed top-20 right-6 z-50 
                        px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full
                        text-white/60 text-xs font-orbitron border border-white/10">
          ⏸ PAUSED
        </div>
      )}
    </section>
  );
});

CinematicSynopsis.displayName = 'CinematicSynopsis';
