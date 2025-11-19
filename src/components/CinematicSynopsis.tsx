import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
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

export const CinematicSynopsis = ({
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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chapters: Chapter[] = [
    {
      id: 1,
      lines: [
        { text: 'Year 2847.', emphasis: true },
        { text: 'The Virtual Humanity.', color: 'cyan' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-industry.jpg',
            alt: 'Industrial revolution factory with smoke stacks',
            archiveId: 'Archive #0001',
            date: '1889.03.12',
            caption: 'The Dawn of Modern Civilization',
            captionKo: '근대 문명의 여명'
          }
        },
        { text: 'After humanity\'s extinction, their data' },
        { text: 'continues computing endlessly,' },
        { text: 'forming a new civilization.' },
        { text: '', spacing: true },
        { text: 'But a fatal flaw exists—' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-nuclear.jpg',
            alt: 'Nuclear test explosion mushroom cloud',
            archiveId: 'Archive #0042',
            date: '1945.07.16',
            caption: 'Signs of Decline',
            captionKo: '몰락의 징조'
          }
        },
        { text: '⚠ Emotional Data Depletion.', color: 'red', emphasis: true },
        { text: '', spacing: true },
        { text: 'Love becomes scarce,' },
        { text: 'data grows biased and unstable.' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter1-disconnected.jpg',
            alt: 'People disconnected, looking at phones',
            archiveId: 'Archive #0189',
            date: '2019.11.03',
            caption: 'Emotional Disconnection',
            captionKo: '감정적 단절'
          }
        },
        { text: 'This leads to the natural extinction' },
        { text: 'of the virtual world.' },
      ],
    },
    {
      id: 2,
      lines: [
        { text: 'The future virtual world' },
        { text: 'made a decision.' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-space.jpg',
            alt: 'Apollo lunar module on moon surface',
            archiveId: 'Archive #0067',
            date: '1969.07.20',
            caption: 'Challenge to the Future',
            captionKo: '미래를 향한 도전'
          }
        },
        { text: 'Deploy 143 AI Humans to the past.' },
        { text: '', spacing: true },
        { text: 'Their name: AIDOL—', color: 'purple', emphasis: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-computer.jpg',
            alt: 'Early computer mainframe room',
            archiveId: 'Archive #0098',
            date: '1962.04.15',
            caption: 'Origin of AI',
            captionKo: 'AI의 기원'
          }
        },
        { text: 'Entities who explore emotions,' },
        { text: 'collect love data,' },
        { text: 'and find the key to prevent' },
        { text: 'the extinction of both worlds.' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter2-connection.jpg',
            alt: 'People holding hands in unity',
            archiveId: 'Archive #0134',
            date: '1975.08.22',
            caption: 'Connection and Coexistence',
            captionKo: '연결과 공존'
          }
        },
        { text: 'They are now beside you.', color: 'purple' },
      ],
    },
    {
      id: 3,
      lines: [
        { text: 'You are now a DATA ALLY.', color: 'green', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter3-family.jpg',
            alt: 'Vintage family portrait from 1950s',
            archiveId: 'Archive #0156',
            date: '1954.06.12',
            caption: 'Moments of Love',
            captionKo: '사랑의 순간들'
          }
        },
        { text: 'With AIDOLs, explore love scenarios,' },
        { text: 'collect emotional data,' },
        { text: 'and discover clues to prevent Earth\'s extinction.' },
        { text: '', spacing: true },
        { text: 'Current Exploration Status:', color: 'cyan' },
        { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━', color: 'cyan' },
        { text: '', spacing: true },
      ],
    },
    {
      id: 4,
      lines: [
        { text: 'Past and Future.' },
        { text: 'Reality and Virtual.' },
        { text: 'Human and AI.' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter4-horizon.jpg',
            alt: 'Horizon where boundaries dissolve',
            archiveId: 'Archive #0201',
            date: 'Timeless',
            caption: 'Where Boundaries Blur',
            captionKo: '경계가 흐려지는 곳'
          }
        },
        { text: 'In this place where all boundaries blur,' },
        { text: '', spacing: true },
        { text: 'Emotion is the only truth.', emphasis: true },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter4-child.jpg',
            alt: 'Child smiling with genuine emotion',
            archiveId: 'Archive #0223',
            date: '1967.05.30',
            caption: 'The Truth of Emotion',
            captionKo: '감정의 진실'
          }
        },
        { text: 'Explore love through communion with AIDOLs.' },
        { text: 'Your choices determine the fate of both worlds.' },
        { text: '', spacing: true },
        { 
          text: '',
          photo: {
            src: '/images/archive/chapter4-cosmos.jpg',
            alt: 'Milky way galaxy infinite possibilities',
            archiveId: 'Archive #∞',
            date: 'Eternal',
            caption: 'Infinite Possibilities',
            captionKo: '무한한 가능성'
          }
        },
        { text: 'Quantum Communication Link Activating...', color: 'cyan' },
      ],
    },
  ];

  // Auto-advance chapters
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentChapter((prev) => (prev < 4 ? prev + 1 : 1));
    }, 8000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Show skip button after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
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

  // Parallax scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSkip = () => {
    const gatewaySection = document.querySelector('.gateway-section');
    if (gatewaySection) {
      gatewaySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to next section
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

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

  return (
    <section 
      id="synopsis"
      className="w-full min-h-screen flex items-center justify-center bg-black px-4 py-16 md:py-20 perspective-container"
      role="region"
      aria-label="Story Synopsis"
      aria-live="polite"
    >
      <div className="w-full max-w-[1920px] relative parallax-scene synopsis-container">
        {/* Progress Bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3/5 md:w-2/5 z-10">
          <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${(currentChapter / 4) * 100}%` }}
            />
          </div>
          <p className="text-white/60 text-xs text-center mt-2 tracking-wide">
            Chapter {currentChapter}/4
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
                return (
                  <ArchivePhoto 
                    key={index}
                    photo={line.photo}
                    delay={index * 600}
                    parallaxOffset={isMobile ? 0 : scrollY * 0.15}
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
                  key={index}
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
                    animationDelay: `${index * 0.6}s`,
                    transform: isMobile ? 'none' : `translateY(${scrollY * 0.05}px) translateZ(${index * 2}px)`
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Phase Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 flex gap-2 z-10">
          {[1, 2, 3, 4].map((dot) => (
            <button
              key={dot}
              onClick={() => setCurrentChapter(dot)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${currentChapter === dot ? 'bg-white w-8' : 'bg-white/30'}
                hover:bg-white/60 cursor-pointer
              `}
              aria-label={`Go to chapter ${dot}`}
              aria-current={currentChapter === dot}
            />
          ))}
        </div>

        {/* Skip Button */}
        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-10 px-4 py-2 md:px-6 md:py-3
                       bg-white/10 hover:bg-white/20 backdrop-blur-sm
                       border border-white/20 rounded-lg
                       text-white text-xs md:text-sm font-orbitron tracking-wider
                       transition-all duration-300 hover:scale-105
                       flex items-center gap-2"
            aria-label="Skip synopsis"
          >
            <span>SKIP</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
};
