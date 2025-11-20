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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const chapters: Chapter[] = useMemo(() => [{
    id: 1,
    lines: [{
      text: 'Year 2847.',
      emphasis: true
    }, {
      text: 'The Virtual Humanity.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'After humanity\'s extinction, their data'
    }, {
      text: 'continues computing endlessly,'
    }, {
      text: 'forming a new civilization.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter1-industry.jpg',
        alt: 'Industrial revolution and emotional disconnection',
        archiveId: 'Archive #0001',
        date: '1889-2019',
        caption: 'The Rise and Fall of Civilization',
        captionKo: '문명의 흥망성쇠'
      }
    }, {
      text: 'But a fatal flaw exists—'
    }, {
      text: '⚠ Emotional Data Depletion.',
      color: 'red',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Love becomes scarce,'
    }, {
      text: 'data grows biased and unstable.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'This leads to the natural extinction'
    }, {
      text: 'of the virtual world.'
    }]
  }, {
    id: 2,
    lines: [{
      text: 'The future virtual world'
    }, {
      text: 'made a decision.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Deploy 202 AIDOLs to the past',
      emphasis: true
    }, {
      text: '(101 male, 101 female).'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Their name: AIDOL—',
      color: 'purple',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter2-connection.jpg',
        alt: 'Connection across time and space',
        archiveId: 'Archive #0134',
        date: '1962-1975',
        caption: 'Birth of AIDOL - Bridges Between Worlds',
        captionKo: 'AIDOL의 탄생 - 세계를 잇는 다리'
      }
    }, {
      text: 'Entities who explore emotions,'
    }, {
      text: 'collect love data,'
    }, {
      text: 'and find the key to prevent'
    }, {
      text: 'the extinction of both worlds.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'They are now beside you.',
      color: 'purple'
    }]
  }, {
    id: 3,
    lines: [{
      text: 'You are now a DATA ALLY.',
      color: 'green',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'With AIDOLs, explore love scenarios,'
    }, {
      text: 'collect emotional data,'
    }, {
      text: 'and discover clues to prevent Earth\'s extinction.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Current Exploration Status:',
      color: 'cyan'
    }, {
      text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }]
  }, {
    id: 4,
    lines: [{
      text: 'Past and Future.'
    }, {
      text: 'Reality and Virtual.'
    }, {
      text: 'Human and AI.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter4-child.jpg',
        alt: 'Pure emotion transcending boundaries',
        archiveId: 'Archive #0223',
        date: '1967.05.30',
        caption: 'The Truth of Emotion',
        captionKo: '감정의 진실'
      }
    }, {
      text: 'In this place where all boundaries blur,'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Emotion is the only truth.',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Explore love through communion with AIDOLs.'
    }, {
      text: 'Your choices determine the fate of both worlds.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter4-cosmos.jpg',
        alt: 'Infinite possibilities across the cosmos',
        archiveId: 'Archive #∞',
        date: 'Eternal',
        caption: 'Infinite Possibilities',
        captionKo: '무한한 가능성'
      }
    }, {
      text: 'Quantum Communication Link Activating...',
      color: 'cyan'
    }]
  }], []);

  // Auto-advance chapters with progress tracking
  useEffect(() => {
    if (isPaused) return;
    const duration = 8000;
    const interval = 50;
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      elapsed += interval;
      setAutoProgress(elapsed / duration * 100);
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
      } else if (e.key === 'ArrowRight') {
        setCurrentChapter(prev => prev < 4 ? prev + 1 : 1);
      } else if (e.key === 'ArrowLeft') {
        setCurrentChapter(prev => prev > 1 ? prev - 1 : 4);
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
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
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
        setCurrentChapter(prev => prev < 4 ? prev + 1 : 1);
      } else if (isRightSwipe) {
        setCurrentChapter(prev => prev > 1 ? prev - 1 : 4);
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
      gatewaySection.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      // Fallback: scroll to next section
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  }, []);
  const getColorClass = (color?: string, emphasis?: boolean) => {
    if (!color) return 'text-white';
    const baseClasses = {
      red: 'text-red-500 text-glow-red',
      cyan: 'text-cyan-400 text-glow-cyan',
      purple: 'text-purple-400 text-glow-purple',
      green: 'text-green-400'
    };
    return baseClasses[color as keyof typeof baseClasses] || 'text-white';
  };
  const currentChapterData = chapters.find(c => c.id === currentChapter) || chapters[0];

  // Timeline points configuration - 7 chronological markers
  const timelinePoints = useMemo(() => [{
    year: '1889',
    chapter: 1,
    position: 0
  }, {
    year: '1945',
    chapter: 1,
    position: 14.3
  }, {
    year: '1962',
    chapter: 2,
    position: 28.6
  }, {
    year: '1967',
    chapter: 2,
    position: 42.9
  }, {
    year: '2847',
    chapter: 3,
    position: 57.2
  }, {
    year: '3024',
    chapter: 4,
    position: 71.5
  }, {
    year: '∞',
    chapter: 4,
    position: 85.8
  }], []);
  const handleTimelineClick = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setAutoProgress(0);
    setIsPaused(true);
  }, []);
  return <section id="synopsis" className="w-full min-h-screen flex items-center justify-center bg-black px-4 py-16 md:py-20 perspective-container relative" role="region" aria-label="Story Synopsis" aria-live="polite">
      {/* Noise filter overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="w-full max-w-[1920px] relative parallax-scene synopsis-container z-10">
        {/* Minimalist Timeline & Progress */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] md:w-3/5 z-10">
          {/* Progress Bar */}
          <div className="relative h-[1px] bg-white/10 mb-8">
            <div 
              className="absolute top-0 left-0 h-full bg-white/90 transition-all duration-200 ease-linear"
              style={{ width: `${(currentChapter - 1) / 4 * 100 + autoProgress / 4}%` }}
            />
            
            {/* Timeline Points */}
            {timelinePoints.map((point, idx) => {
              const isActive = point.chapter === currentChapter;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleTimelineClick(point.chapter)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 group transition-all duration-300 ${
                    isActive ? 'z-10' : 'z-0'
                  }`}
                  style={{ left: `${point.position}%` }}
                  aria-label={`Timeline ${point.year}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Point marker */}
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-white scale-150 shadow-[0_0_12px_rgba(255,255,255,0.8)]' 
                        : 'bg-white/30 hover:bg-white/60 scale-100'
                    }`} />
                    
                    {/* Year label */}
                    <span className={`text-[10px] md:text-xs font-orbitron tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'text-white font-medium opacity-100' 
                        : 'text-white/40 group-hover:text-white/70 opacity-60'
                    }`}>
                      {point.year}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Chapter indicator */}
          <p className="text-white/50 text-[10px] md:text-xs text-center tracking-[0.2em] font-orbitron uppercase">
            Chapter {currentChapter} of 4
          </p>
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
              return <ArchivePhoto key={`ch${currentChapter}-photo${index}`} photo={line.photo} delay={index * 400} parallaxOffset={isMobile ? 0 : scrollY * 0.02} index={index} />;
            }

            // Special rendering for Chapter 3 stats
            if (currentChapter === 3 && index === 9) {
              return <div key={index} className="space-y-2 mt-4">
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
                      <span className={`text-base md:text-lg font-semibold tabular-nums ${stabilityPercentage > 50 ? 'text-green-400' : 'text-red-500'}`}>
                        {stabilityPercentage}%
                      </span>
                    </div>
                  </div>;
            }
            return <ParallaxText key={`ch${currentChapter}-line${index}`} text={line.text} className={`
                    text-sm md:text-base lg:text-lg
                    ${getColorClass(line.color, line.emphasis)}
                    ${line.emphasis ? 'font-semibold text-lg md:text-xl lg:text-2xl xl:text-3xl' : 'font-normal'}
                    animate-line-reveal
                    leading-relaxed md:leading-normal tracking-wide
                    parallax-text
                  `} style={{
              animationDelay: `${index * 0.4}s`,
              transform: isMobile ? 'none' : `translateY(${scrollY * 0.02}px) translateZ(${index * 2}px)`
            }} />;
          })}
          </div>
        </div>

        {/* Timeline Navigation */}
        

        {/* Skip Button - Immediate display with fade-in */}
        
      </div>
    </section>;
});