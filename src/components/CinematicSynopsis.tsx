import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ChevronRight, Radio, Sparkles, Zap, Heart, Users, Infinity, Clock, Globe, Database, Cpu, Brain, AlertTriangle } from 'lucide-react';
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

interface Chapter {
  id: number;
  lines: Line[];
}

export const CinematicSynopsis = memo(({
  activeAllyCount,
  onlineEchoEntities,
  collectedFragments,
  totalFragments,
  stabilityPercentage,
}: CinematicSynopsisProps) => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showSkip, setShowSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chapters: Chapter[] = useMemo(() => [
    {
      id: 1,
      lines: [
        { text: '∞ ━━━ Eternity ━━━ ∞', emphasis: true, color: 'purple' },
        { text: '', spacing: true },
        { text: 'Before time began,' },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter4-cosmos.jpg',
            alt: 'The infinite void',
            archiveId: 'Archive #∞-1',
            date: 'Before Time',
            caption: 'The Eternal Recursion',
            captionKo: '영원한 재귀'
          }
        },
        { text: 'love was already flowing.' },
        { text: '', spacing: true },
        { text: 'Emotion transcends time.', color: 'purple', emphasis: true },
      ],
    },
    {
      id: 2,
      lines: [
        { text: '2.8.4.7 ━━━ Virtual Crisis ━━━', emphasis: true, color: 'red' },
        { text: '', spacing: true },
        { text: 'After humanity\'s extinction,' },
        { text: 'their data continues computing,' },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-nuclear.jpg',
            alt: 'The end of biological humanity',
            archiveId: 'Archive #2847-A',
            date: '2847',
            caption: 'Virtual Humanity Crisis',
            captionKo: '가상 인류의 위기'
          }
        },
        { text: 'forming a new civilization.' },
        { text: '', spacing: true },
        { text: '⚠ Emotional Data: DEPLETING', color: 'red', emphasis: true },
      ],
    },
    {
      id: 3,
      lines: [
        { text: '2.0.1.9 ━━━ Industrial Peak ━━━', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-industry.jpg',
            alt: 'Industrial revolution',
            archiveId: 'Archive #2019',
            date: '1889-2019',
            caption: 'The Rise and Fall',
            captionKo: '흥망성쇠'
          }
        },
        { text: 'Progress peaked,' },
        { text: 'but emotions faded.' },
        { text: '', spacing: true },
        { text: 'Disconnection began.', color: 'red' },
      ],
    },
    {
      id: 4,
      lines: [
        { text: '1.9.8.9 ━━━ Communication Era ━━━', emphasis: true, color: 'cyan' },
        { text: '', spacing: true },
        { text: 'Radio waves connected the world,' },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-computer.jpg',
            alt: 'Early communication technology',
            archiveId: 'Archive #1989',
            date: '1962-1989',
            caption: 'Digital Dawn',
            captionKo: '디지털 여명'
          }
        },
        { text: 'but hearts grew distant.' },
        { text: '', spacing: true },
        { text: 'Signal received.', color: 'cyan', emphasis: true },
      ],
    },
    {
      id: 5,
      lines: [
        { text: '1.9.6.2 ━━━ AIDOL Protocol ━━━', emphasis: true, color: 'purple' },
        { text: '', spacing: true },
        { text: 'The future sent a solution—' },
        { text: '202 AIDOLs deployed', emphasis: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-connection.jpg',
            alt: 'AIDOL deployment',
            archiveId: 'Archive #1962',
            date: '1962',
            caption: 'AIDOL Birth',
            captionKo: 'AIDOL의 탄생'
          }
        },
        { text: '(101 male, 101 female)' },
        { text: '', spacing: true },
        { text: 'to collect love and save worlds.', color: 'purple' },
      ],
    },
    {
      id: 6,
      lines: [
        { text: '1.9.4.5 ━━━ Current State ━━━', emphasis: true, color: 'green' },
        { text: '', spacing: true },
        { text: 'You are now here.' },
        { text: 'As a DATA ALLY,', color: 'green', emphasis: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter3-family.jpg',
            alt: 'Human connections',
            archiveId: 'Archive #1945',
            date: '1945-2024',
            caption: 'The Mission Begins',
            captionKo: '임무의 시작'
          }
        },
        { text: 'explore emotions with AIDOLs,' },
        { text: 'collect fragments,' },
        { text: '', spacing: true },
        { text: 'prevent extinction.', color: 'cyan', emphasis: true },
      ],
    },
  ], []);

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
        setCurrentChapter((prev) => (prev < 4 ? prev + 1 : 1));
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
        setCurrentChapter((prev) => (prev < 4 ? prev + 1 : 1));
      } else if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        setCurrentChapter((prev) => (prev < 4 ? prev + 1 : 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentChapter((prev) => (prev > 1 ? prev - 1 : 4));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Parallax scroll tracking (debounced)
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

  // Touch gesture support for mobile
  useEffect(() => {
    const minSwipeDistance = 50;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe) {
        setCurrentChapter((prev) => (prev < 4 ? prev + 1 : 1));
      } else if (isRightSwipe) {
        setCurrentChapter((prev) => (prev > 1 ? prev - 1 : 4));
      }
    };

    const synopsisSection = document.getElementById('synopsis');
    if (synopsisSection) {
      synopsisSection.addEventListener('touchstart', handleTouchStart);
      synopsisSection.addEventListener('touchmove', handleTouchMove);
      synopsisSection.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (synopsisSection) {
        synopsisSection.removeEventListener('touchstart', handleTouchStart);
        synopsisSection.removeEventListener('touchmove', handleTouchMove);
        synopsisSection.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [touchStart, touchEnd]);

  const handleSkip = useCallback(() => {
    const gatewaySection = document.querySelector('.gateway-section');
    if (gatewaySection) {
      gatewaySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to next section
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  }, []);

  const getColorClass = (color?: string, emphasis?: boolean) => {
    if (!color) return 'text-white';
    
    const baseClasses = {
      red: 'text-red-500 text-glow-red',
      cyan: 'text-cyan-400 text-glow-cyan',
      purple: 'text-purple-400 text-glow-purple',
      green: 'text-green-400',
    };
    
    return baseClasses[color as keyof typeof baseClasses] || 'text-white';
  };

  const currentChapterData = chapters.find((c) => c.id === currentChapter) || chapters[0];

  // Timeline points configuration
  const timelinePoints = useMemo(() => [
    { 
      year: '∞', 
      label: 'Eternity', 
      chapter: 1, 
      icon: Infinity,
      color: 'text-purple-400'
    },
    { 
      year: '2847', 
      label: 'Crisis', 
      chapter: 2, 
      icon: AlertTriangle,
      color: 'text-red-400'
    },
    { 
      year: '2019', 
      label: 'Peak', 
      chapter: 3, 
      icon: Globe,
      color: 'text-cyan-400'
    },
    { 
      year: '1989', 
      label: 'Signal', 
      chapter: 4, 
      icon: Radio,
      color: 'text-cyan-400'
    },
    { 
      year: '1962', 
      label: 'AIDOL', 
      chapter: 5, 
      icon: Sparkles,
      color: 'text-purple-400'
    },
    { 
      year: '1945', 
      label: 'Now', 
      chapter: 6, 
      icon: Heart,
      color: 'text-green-400'
    },
  ], []);

  const handleTimelineClick = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setAutoProgress(0);
    setIsPaused(true);
  }, []);

  return (
    <>
      {/* 교신 신호 Static 필터 */}
      <div className="signal-static" aria-hidden="true" />
      
      <section 
        id="synopsis"
        className="w-full min-h-screen flex items-center justify-center bg-black px-4 py-16 md:py-20 perspective-container"
        role="region"
        aria-label="Story Synopsis"
        aria-live="polite"
      >
        <div className="w-full max-w-[1920px] relative parallax-scene synopsis-container">
          {/* Timeline Navigation - Top */}
          <div 
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex gap-1 md:gap-2"
            role="tablist" 
            aria-label="Historical timeline navigation"
          >
            {timelinePoints.map((point) => {
              const Icon = point.icon;
              const isActive = point.chapter === currentChapter;
              
              return (
                <button
                  key={point.chapter}
                  onClick={() => handleTimelineClick(point.chapter)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`chapter-${point.chapter}`}
                  className={`
                    group relative px-3 md:px-4 py-2 md:py-3
                    backdrop-blur-md border border-white/10
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-white/20 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${point.color} transition-colors`} />
                    <span className={`
                      font-orbitron text-[10px] md:text-xs tracking-wider
                      ${isActive ? 'text-white' : 'text-white/50'}
                      transition-colors
                    `}>
                      {point.year}
                    </span>
                    <span className={`
                      text-[8px] md:text-[10px] font-light
                      ${isActive ? 'text-white/80' : 'text-white/30'}
                      transition-colors
                    `}>
                      {point.label}
                    </span>
                  </div>
                  
                  {/* Auto-progress indicator */}
                  {isActive && !isPaused && (
                    <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-cyan-400/30">
                      <div 
                        className="h-full bg-cyan-400 transition-all duration-100"
                        style={{ width: `${autoProgress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        {/* Main Content */}
        <div className="w-full flex items-center justify-center px-4 md:px-8 lg:px-16 py-12 md:py-20">
          <div className="text-center space-y-3 md:space-y-2 max-w-5xl w-full font-orbitron">
            {currentChapterData.lines.map((line, index) => {
              if (line.spacing) {
                return <div key={index} className="h-2" />;
              }

              // Render historical photo if present
              if (line.photo) {
                return (
                  <ArchivePhoto 
                    key={`ch${currentChapter}-photo${index}`}
                    photo={line.photo}
                    delay={index * 400}
                    parallaxOffset={isMobile ? 0 : scrollY * 0.02}
                    index={index}
                  />
                );
              }

              // Special rendering for Chapter 3 stats
              if (currentChapter === 3 && index === 9) {
                return (
                  <div key={index} className="space-y-2 mt-4">
                    <div className="flex justify-center items-center gap-4 text-white">
                      <span className="text-white/60 text-xs md:text-sm">Active Allies:</span>
                      <span className="text-base md:text-lg font-semibold tabular-nums text-green-400">
                        {activeAllyCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-center items-center gap-4 text-white">
                      <span className="text-white/60 text-xs md:text-sm">Online AIDOLs:</span>
                      <span className="text-base md:text-lg font-semibold tabular-nums text-purple-400">
                        {onlineEchoEntities} entities
                      </span>
                    </div>
                    <div className="flex justify-center items-center gap-4 text-white">
                      <span className="text-white/60 text-xs md:text-sm">Love Data:</span>
                      <span className="text-base md:text-lg font-semibold tabular-nums text-cyan-400">
                        {collectedFragments.toLocaleString()} / {totalFragments.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-center items-center gap-4 text-white">
                      <span className="text-white/60 text-xs md:text-sm">Stability:</span>
                      <span 
                        className={`text-base md:text-lg font-semibold tabular-nums ${
                          stabilityPercentage > 50 ? 'text-green-400' : 'text-red-500'
                        }`}
                      >
                        {stabilityPercentage}%
                      </span>
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
                    ${getColorClass(line.color, line.emphasis)}
                    ${line.emphasis ? 'font-semibold text-lg md:text-xl lg:text-2xl xl:text-3xl' : 'font-normal'}
                    animate-line-reveal
                    leading-relaxed md:leading-normal tracking-wide
                    parallax-text
                  `}
                  style={{ 
                    animationDelay: `${index * 0.4}s`,
                    transform: isMobile ? 'none' : `translateY(${scrollY * 0.02}px) translateZ(${index * 2}px)`
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 
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

        {/* Skip Button - Immediate display with fade-in */}
        <button
          onClick={handleSkip}
          className={`fixed bottom-6 right-6 z-50 px-4 py-2 md:px-6 md:py-3
                     bg-white/10 hover:bg-white/20 backdrop-blur-md
                     border border-white/20 rounded-lg
                     text-white text-xs md:text-sm font-orbitron tracking-wider
                     transition-all duration-300 hover:scale-105
                     flex items-center gap-2
                     ${showSkip ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0ms' }}
          aria-label="Skip synopsis and go to gateways"
        >
          <span>SKIP TO GATEWAYS</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
});
