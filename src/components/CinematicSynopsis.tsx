import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { ArchivePhoto } from './synopsis/ArchivePhoto';

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
            caption: 'The Dawn of Modern Civilization'
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
            caption: 'Signs of Decline'
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
            caption: 'Emotional Disconnection'
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
            caption: 'Challenge to the Future'
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
            caption: 'Origin of AI'
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
            caption: 'Connection and Coexistence'
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
            caption: 'Moments of Love'
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
            caption: 'Where Boundaries Blur'
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
            caption: 'The Truth of Emotion'
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
            caption: 'Infinite Possibilities'
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

  const handleSkip = () => {
    const featuredSection = document.getElementById('featured-allies');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
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
      className="w-full min-h-screen flex items-center justify-center bg-black px-4 py-16"
      role="region"
      aria-label="Story Synopsis"
      aria-live="polite"
    >
      <div className="w-full max-w-[1920px] aspect-video relative">
        {/* Progress Bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2/5 z-10">
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
        <div className="absolute inset-0 flex items-center justify-center px-8 md:px-16">
          <div className="text-center space-y-2 max-w-5xl w-full font-orbitron">
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
                <p
                  key={index}
                  className={`
                    text-sm md:text-base lg:text-lg
                    ${getColorClass(line.color, line.emphasis)}
                    ${line.emphasis ? 'font-semibold text-xl md:text-2xl lg:text-3xl' : 'font-normal'}
                    animate-line-reveal
                    leading-normal tracking-wide
                  `}
                  style={{ animationDelay: `${index * 0.6}s` }}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Phase Indicator Dots */}
        <div className="absolute bottom-6 left-6 flex gap-2 z-10">
          {[1, 2, 3, 4].map((dot) => (
            <button
              key={dot}
              onClick={() => setCurrentChapter(dot)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${currentChapter === dot ? 'bg-white w-8' : 'bg-white/30'}
              `}
              aria-label={`Go to chapter ${dot}`}
            />
          ))}
        </div>

        {/* Skip Button */}
        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute bottom-6 right-6 text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 group z-10"
          >
            <span className="text-sm tracking-wide font-light group-hover:underline">
              Skip Intro
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
};
