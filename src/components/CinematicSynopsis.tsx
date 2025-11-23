import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ArchivePhoto } from './synopsis/ArchivePhoto';
import { ParallaxText } from './synopsis/ParallaxText';
import { useLanguage } from '@/contexts/LanguageContext';
import { getChapters } from '@/data/synopsisChaptersSplit';
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
  text?: string;
  textKo?: string;
  emphasis?: boolean;
  color?: 'red' | 'cyan' | 'purple' | 'green';
  spacing?: boolean;
  photo?: HistoricalPhoto;
}
interface Chapter {
  id: number;
  lines: Line[];
}

interface Scene {
  lines: Line[];
  isPhotoScene: boolean;
}
export const CinematicSynopsis = memo(({
  activeAllyCount,
  onlineEchoEntities,
  collectedFragments,
  totalFragments,
  stabilityPercentage
}: CinematicSynopsisProps) => {
  const {
    language,
    t
  } = useLanguage();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentScene, setCurrentScene] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
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
  const chapters = useMemo(() => getChapters(), []);

  // Split chapter lines into scenes (text scenes vs photo scenes)
  const splitIntoScenes = useCallback((lines: Line[]): Scene[] => {
    const scenes: Scene[] = [];
    let currentSceneLines: Line[] = [];
    let lastWasPhoto = false;

    lines.forEach(line => {
      if (line.spacing) return; // Skip spacing lines
      
      const isPhoto = !!line.photo;
      
      // Start new scene when content type changes
      if (currentSceneLines.length > 0 && isPhoto !== lastWasPhoto) {
        scenes.push({
          lines: [...currentSceneLines],
          isPhotoScene: lastWasPhoto
        });
        currentSceneLines = [];
      }
      
      currentSceneLines.push(line);
      lastWasPhoto = isPhoto;
    });
    
    // Push remaining lines
    if (currentSceneLines.length > 0) {
      scenes.push({
        lines: currentSceneLines,
        isPhotoScene: lastWasPhoto
      });
    }
    
    return scenes;
  }, []);

  const currentChapterData = chapters.find(c => c.id === currentChapter) || chapters[0];
  const scenes = useMemo(() => splitIntoScenes(currentChapterData.lines), [currentChapterData, splitIntoScenes]);
  const activeScene = scenes[currentScene] || scenes[0];
  const isPhotoScene = activeScene?.isPhotoScene || false;

  // Auto-advance scenes with progress tracking
  useEffect(() => {
    if (isPaused) return;
    const duration = 8000; // 8초 per scene
    const interval = 50;
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      elapsed += interval;
      setAutoProgress(elapsed / duration * 100);
      if (elapsed >= duration) {
        setIsTransitioning(true);
        setTimeout(() => {
          if (currentScene < scenes.length - 1) {
            // Move to next scene
            setCurrentScene(prev => prev + 1);
          } else {
            // Move to next chapter and reset scene
            setCurrentChapter(prev => prev < 20 ? prev + 1 : 1);
            setCurrentScene(0);
          }
          elapsed = 0;
          setAutoProgress(0);
          setTimeout(() => setIsTransitioning(false), 400);
        }, 200);
      }
    }, interval);
    return () => clearInterval(progressTimer);
  }, [isPaused, currentScene, scenes.length]);

  // Reset scene when chapter changes
  useEffect(() => {
    setCurrentScene(0);
  }, [currentChapter]);

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
        if (currentScene < scenes.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          setCurrentChapter(prev => prev < 20 ? prev + 1 : 1);
          setCurrentScene(0);
        }
      } else if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        if (currentScene < scenes.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          setCurrentChapter(prev => prev < 20 ? prev + 1 : 1);
          setCurrentScene(0);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentScene > 0) {
          setCurrentScene(prev => prev - 1);
        } else {
          setCurrentChapter(prev => prev > 1 ? prev - 1 : 20);
          setCurrentScene(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentScene, scenes.length]);

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
        if (currentScene < scenes.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          setCurrentChapter(prev => prev < 20 ? prev + 1 : 1);
          setCurrentScene(0);
        }
      } else if (isRightSwipe) {
        if (currentScene > 0) {
          setCurrentScene(prev => prev - 1);
        } else {
          setCurrentChapter(prev => prev > 1 ? prev - 1 : 20);
          setCurrentScene(0);
        }
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
  }, [touchStart, touchEnd, currentScene, scenes.length]);
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
    if (!color) return 'text-gray-300';
    const baseClasses = {
      red: 'text-gray-200',
      cyan: 'text-gray-300',
      purple: 'text-gray-300',
      green: 'text-gray-400'
    };
    return baseClasses[color as keyof typeof baseClasses] || 'text-gray-300';
  };

  // Timeline points configuration - 20 chronological markers (simplified)
  const timelinePoints = useMemo(() => [{
    year: '2847',
    chapter: 1,
    position: 2
  }, {
    year: '3024',
    chapter: 4,
    position: 12
  }, {
    year: '1889',
    chapter: 7,
    position: 22
  }, {
    year: '1945',
    chapter: 8,
    position: 32
  }, {
    year: '1962',
    chapter: 9,
    position: 42
  }, {
    year: '1967',
    chapter: 10,
    position: 52
  }, {
    year: '2021',
    chapter: 11,
    position: 62
  }, {
    year: '2025',
    chapter: 14,
    position: 72
  }, {
    year: '2500',
    chapter: 15,
    position: 82
  }, {
    year: '∞',
    chapter: 20,
    position: 98
  }], []);
  const handleTimelineClick = useCallback((chapter: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentChapter(chapter);
      setCurrentScene(0);
      setAutoProgress(0);
      setIsPaused(true);
      setTimeout(() => setIsTransitioning(false), 400);
    }, 200);
  }, []);
  return <section id="synopsis" className="w-full min-h-screen flex items-center justify-center bg-black perspective-container relative" role="region" aria-label="Story Synopsis" aria-live="polite" style={{
    transform: `translateY(${scrollY * 0.15}px)`
  }}>
      {/* Noise filter overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat'
    }} />
      
      {/* Transition noise overlay */}
      <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-200 ${isTransitioning ? 'opacity-20' : 'opacity-0'}`} style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      mixBlendMode: 'overlay'
    }} />
      
      <div className="w-full max-w-[1920px] relative parallax-scene synopsis-container z-10">
        {/* Unified Timeline Container - Fixed Position */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-3/5 z-50 border border-gray-700/50 bg-gray-900/80 backdrop-blur-md rounded-sm px-4 md:px-6 py-2 md:py-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <span className="text-gray-400 text-[8px] md:text-[10px] tracking-[0.15em] font-mono uppercase">
              Chapter {currentChapter} of 20
            </span>
            <span className="text-gray-500 text-[8px] md:text-[10px] tracking-[0.15em] font-mono uppercase">
              SIMULATOR STATUS: ONLINE
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-[2px] bg-gray-700/40 mb-1">
            <div className="absolute top-0 left-0 h-full bg-gray-400/70 transition-all duration-200 ease-linear" style={{
            width: `${((currentChapter - 1) / 20 * 100) + ((currentScene + autoProgress / 100) / scenes.length / 20 * 100)}%`
          }} />
            
            {/* Timeline Points */}
            {timelinePoints.map((point, idx) => {
            const isActive = point.chapter === currentChapter;
            return <button key={idx} onClick={() => handleTimelineClick(point.chapter)} className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 group transition-all duration-300 ${isActive ? 'z-10' : 'z-0'}`} style={{
              left: `${point.position}%`
            }} aria-label={`Timeline ${point.year}`}>
                  <div className="flex flex-col items-center gap-2">
                    {/* Point marker */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-gray-300 scale-110 shadow-[0_0_6px_rgba(209,213,219,0.4)]' : 'bg-gray-600/50 hover:bg-gray-500/70 scale-100'}`} />
                    
                    {/* Year label */}
                    <span className={`text-[8px] md:text-[10px] font-mono tracking-[0.15em] transition-all duration-300 whitespace-nowrap uppercase ${isActive ? 'text-gray-300 font-medium opacity-100' : 'text-gray-600 group-hover:text-gray-500 opacity-60'}`}>
                      {point.year}
                    </span>
                  </div>
                </button>;
          })}
          </div>
        </div>

        {/* Main Content - Scene-based rendering */}
        <div className="w-full min-h-screen flex items-center justify-center">
          {/* Text Scene */}
          {!isPhotoScene && (
            <div className={`min-h-screen flex items-center justify-center pt-28 pb-12 px-6 md:px-12 lg:px-16 py-16 transition-opacity duration-400 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-center space-y-6 max-w-3xl w-full font-orbitron">
                {activeScene.lines.map((line, index) => {
                  // Special rendering for Chapter 14 stats
                  if (currentChapter === 14 && line.text?.includes('Active')) {
                    return <div key={index} className="space-y-2 mt-4">
                      <div className="flex justify-center items-center gap-4 text-gray-300">
                        <span className="text-gray-500 text-xs md:text-sm font-mono">{t('synopsis.stats.activeAllies')}:</span>
                        <span className="text-base md:text-lg font-semibold tabular-nums text-gray-400 font-mono">
                          {activeAllyCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-4 text-gray-300">
                        <span className="text-gray-500 text-xs md:text-sm font-mono">{t('synopsis.stats.onlineIdols')}:</span>
                        <span className="text-base md:text-lg font-semibold tabular-nums text-gray-400 font-mono">
                          {onlineEchoEntities} entities
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-4 text-gray-300">
                        <span className="text-gray-500 text-xs md:text-sm font-mono">{t('synopsis.stats.collectedFragments')}:</span>
                        <span className="text-base md:text-lg font-semibold tabular-nums text-gray-300 font-mono">
                          {collectedFragments.toLocaleString()} / {totalFragments.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-4 text-gray-300">
                        <span className="text-gray-500 text-xs md:text-sm font-mono">{t('synopsis.stats.systemStability')}:</span>
                        <span className={`text-base md:text-lg font-semibold tabular-nums font-mono ${stabilityPercentage > 50 ? 'text-gray-400' : 'text-gray-200'}`}>
                          {stabilityPercentage}%
                        </span>
                      </div>
                    </div>;
                  }

                  const displayText = language === 'ko' && line.textKo ? line.textKo : line.text || '';
                  return <ParallaxText 
                    key={`scene${currentScene}-line${index}`} 
                    text={displayText} 
                    className={`
                      text-base md:text-lg lg:text-xl
                      ${getColorClass(line.color, line.emphasis)}
                      ${line.emphasis ? 'font-semibold text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 'font-normal'}
                      animate-fade-in
                      leading-relaxed md:leading-normal tracking-wide
                    `}
                    style={{
                      animationDelay: `${index * 0.4}s`
                    }} 
                  />;
                })}
              </div>
            </div>
          )}

          {/* Photo Scene */}
          {isPhotoScene && (
            <div className={`min-h-screen flex items-center justify-center pt-28 pb-12 px-6 md:px-12 lg:px-16 py-16 transition-opacity duration-400 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="max-w-4xl w-full">
                {activeScene.lines.map((line, index) => (
                  line.photo && (
                    <ArchivePhoto
                      key={`scene${currentScene}-photo${index}`}
                      photo={line.photo}
                      delay={index * 0.4}
                      parallaxOffset={0}
                      index={index}
                    />
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Navigation */}
        

        {/* Skip Button - Immediate display with fade-in */}
        
      </div>
    </section>;
});