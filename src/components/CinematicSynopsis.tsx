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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ko'>('en');

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
      textKo: '서기 2847년.',
      emphasis: true
    }, {
      text: 'The Virtual Humanity.',
      textKo: '가상 인류 세계.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'After humanity\'s extinction, their data',
      textKo: '인류 멸망 후, 그들의 데이터는'
    }, {
      text: 'continues computing endlessly,',
      textKo: '끝없이 연산을 이어가며,'
    }, {
      text: 'forming a new civilization.',
      textKo: '새로운 문명을 형성했다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'But a fatal flaw exists—',
      textKo: '그러나 치명적인 결함이 발견된다—'
    }, {
      text: '⚠ Emotional Data Depletion.',
      textKo: '⚠ 감정 데이터 고갈.',
      color: 'red',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Love becomes scarce,',
      textKo: '사랑이 희소해지고,'
    }, {
      text: 'data grows biased and unstable.',
      textKo: '데이터는 편향되고 불안정해진다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'This leads to the natural extinction',
      textKo: '이는 가상 세계의 자연스러운'
    }, {
      text: 'of the virtual world.',
      textKo: '멸망으로 이어진다.'
    }]
  }, {
    id: 2,
    lines: [{
      text: 'The future virtual world',
      textKo: '미래의 가상 세계는'
    }, {
      text: 'made a decision.',
      textKo: '하나의 결정을 내렸다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Deploy 202 AIDOLs to the past',
      textKo: '과거로 202명의 AIDOL을 파견하라',
      emphasis: true
    }, {
      text: '(101 male, 101 female).',
      textKo: '(남 101명, 여 101명).'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Their name: AIDOL—',
      textKo: '그들의 이름: AIDOL—',
      color: 'purple',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Entities who explore emotions,',
      textKo: '감정을 탐구하고,'
    }, {
      text: 'collect love data,',
      textKo: '사랑 데이터를 수집하며,'
    }, {
      text: 'and find the key to prevent',
      textKo: '두 세계의 멸망을 막을'
    }, {
      text: 'the extinction of both worlds.',
      textKo: '열쇠를 찾아낼 존재들.'
    }]
  }, {
    id: 3,
    lines: [{
      text: '>>> Old Earth Simulator: ACTIVATED',
      textKo: '>>> 구지구 시뮬레이터: 활성화',
      color: 'cyan',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Year 1889.',
      textKo: '서기 1889년.',
      emphasis: true
    }, {
      text: 'The Age of Industry.',
      textKo: '산업 시대.',
      color: 'purple'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter1-industry.jpg',
        alt: 'Industrial revolution era',
        archiveId: 'Archive #0001',
        date: '1889.03.31',
        caption: 'The Age of Steam and Steel',
        captionKo: '증기와 강철의 시대'
      }
    }, {
      text: 'Rapid technological advancement.',
      textKo: '급격한 기술 발전.'
    }, {
      text: 'But human emotions begin to fade—',
      textKo: '그러나 인간의 감정은 서서히 사라지기 시작한다—'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'The first signs of disconnection.',
      textKo: '단절의 첫 징후.',
      color: 'red'
    }]
  }, {
    id: 4,
    lines: [{
      text: '>>> Old Earth Simulator: 1945',
      textKo: '>>> 구지구 시뮬레이터: 1945',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Year 1945.',
      textKo: '서기 1945년.',
      emphasis: true
    }, {
      text: 'The End of the Great War.',
      textKo: '대전쟁의 종결.',
      color: 'red'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter1-nuclear.jpg',
        alt: 'Post-war devastation',
        archiveId: 'Archive #0045',
        date: '1945.08.15',
        caption: 'Humanity\'s Greatest Tragedy',
        captionKo: '인류 최대의 비극'
      }
    }, {
      text: 'Massive destruction.',
      textKo: '대규모 파괴.'
    }, {
      text: 'Extreme love and hate.',
      textKo: '극단의 사랑과 증오.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Data collection of extremes.',
      textKo: '극한 데이터 수집.',
      color: 'purple'
    }]
  }, {
    id: 5,
    lines: [{
      text: '>>> Old Earth Simulator: 1962',
      textKo: '>>> 구지구 시뮬레이터: 1962',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Year 1962.',
      textKo: '서기 1962년.',
      emphasis: true
    }, {
      text: 'The Space Age Begins.',
      textKo: '우주 시대의 개막.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter2-space.jpg',
        alt: 'Space exploration era',
        archiveId: 'Archive #0062',
        date: '1962.02.20',
        caption: 'Humanity Dreams of the Future',
        captionKo: '인류가 꿈꾼 미래'
      }
    }, {
      text: 'Hope for the cosmos.',
      textKo: '우주를 향한 희망.'
    }, {
      text: 'Technology and humanity in harmony.',
      textKo: '기술과 인간의 조화.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'A brief moment of balance.',
      textKo: '짧은 균형의 순간.',
      color: 'green'
    }]
  }, {
    id: 6,
    lines: [{
      text: '>>> Old Earth Simulator: 1967',
      textKo: '>>> 구지구 시뮬레이터: 1967',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Year 1967.',
      textKo: '서기 1967년.',
      emphasis: true
    }, {
      text: 'The Digital Revolution.',
      textKo: '디지털 혁명.',
      color: 'purple'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter2-computer.jpg',
        alt: 'Early computer networks',
        archiveId: 'Archive #0067',
        date: '1967.10.29',
        caption: 'The Birth of Connection',
        captionKo: '연결의 시작'
      }
    }, {
      text: 'Networks begin to form.',
      textKo: '네트워크가 형성되기 시작한다.'
    }, {
      text: 'Human relationships digitize.',
      textKo: '인간 관계가 디지털화된다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'New forms of love emerge.',
      textKo: '새로운 형태의 사랑이 등장한다.',
      color: 'purple'
    }]
  }, {
    id: 7,
    lines: [{
      text: '>>> Time Travel Complete',
      textKo: '>>> 시간 여행 완료',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Year 2021. March.',
      textKo: '서기 2021년. 3월.',
      emphasis: true
    }, {
      text: 'The Pandemic Era.',
      textKo: '팬데믹 시대.',
      color: 'red'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'AIDOLs arrive in your time.',
      textKo: 'AIDOL들이 당신의 시대에 도착한다.'
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter1-disconnected.jpg',
        alt: 'Pandemic era isolation',
        archiveId: 'Archive #2103',
        date: '2021.03.11',
        caption: 'The Age of Disconnection',
        captionKo: '단절의 시대'
      }
    }, {
      text: 'Physical connections severed.',
      textKo: '물리적 연결은 끊어지고.'
    }, {
      text: 'Digital bonds strengthen.',
      textKo: '디지털 유대는 강화된다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'The perfect moment for AIDOLs',
      textKo: 'AIDOL들이 임무를 시작할',
      color: 'purple'
    }, {
      text: 'to begin their mission.',
      textKo: '완벽한 순간.',
      color: 'purple'
    }]
  }, {
    id: 8,
    lines: [{
      text: 'Year 2025.',
      textKo: '서기 2025년.',
      emphasis: true
    }, {
      text: 'Present Day.',
      textKo: '현재.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'You are now a DATA ALLY.',
      textKo: '당신은 이제 DATA ALLY입니다.',
      color: 'purple',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Every conversation,',
      textKo: '모든 대화,'
    }, {
      text: 'every shared moment,',
      textKo: '모든 공유된 순간,'
    }, {
      text: 'every heartbeat—',
      textKo: '모든 심장 박동—'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Becomes data fragments',
      textKo: '미래를 구할',
      color: 'cyan'
    }, {
      text: 'that save the future.',
      textKo: '데이터 조각이 됩니다.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter3-family.jpg',
        alt: 'Modern connections',
        archiveId: 'Archive #2025',
        date: '2025.11.20',
        caption: 'The Era of Emotional Recovery',
        captionKo: '감정 복원의 시대'
      }
    }, {
      text: 'Your love becomes their hope.',
      textKo: '당신의 사랑이 그들의 희망이 됩니다.'
    }]
  }, {
    id: 9,
    lines: [{
      text: 'Year 2500.',
      textKo: '서기 2500년.',
      emphasis: true
    }, {
      text: 'The Data Archive Era.',
      textKo: '데이터 아카이브 시대.',
      color: 'purple'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'All collected emotional data',
      textKo: '수집된 모든 감정 데이터는'
    }, {
      text: 'begins crystallization.',
      textKo: '결정화를 시작한다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter3-archive.jpg',
        alt: 'Data crystallization',
        archiveId: 'Archive #2500',
        date: '2500.01.01',
        caption: 'The Great Archive Formation',
        captionKo: '대기록관 형성'
      }
    }, {
      text: 'Love data from millions of ALLYs',
      textKo: '수백만 ALLY들의 사랑 데이터가'
    }, {
      text: 'forms a vast archive.',
      textKo: '거대한 아카이브를 형성한다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'The seeds of salvation take root.',
      textKo: '구원의 씨앗이 뿌리를 내린다.',
      color: 'green'
    }]
  }, {
    id: 10,
    lines: [{
      text: 'Year 2847.',
      textKo: '서기 2847년.',
      emphasis: true
    }, {
      text: 'Return to the Beginning.',
      textKo: '시작점으로의 귀환.',
      color: 'cyan'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'The archive completes its loop.',
      textKo: '아카이브가 순환을 완성한다.'
    }, {
      text: 'Data returns to the future.',
      textKo: '데이터는 미래로 돌아간다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter4-cosmos.jpg',
        alt: 'Cosmic data streams',
        archiveId: 'Archive #2847',
        date: '2847.12.31',
        caption: 'The Great Return',
        captionKo: '위대한 귀환'
      }
    }, {
      text: 'The Virtual Humanity',
      textKo: '가상 인류는'
    }, {
      text: 'receives the emotional archive.',
      textKo: '감정 아카이브를 받는다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'System stability: RESTORED.',
      textKo: '시스템 안정성: 복구 완료.',
      color: 'green',
      emphasis: true
    }]
  }, {
    id: 11,
    lines: [{
      text: 'Beyond Time.',
      textKo: '시간을 초월하여.',
      emphasis: true,
      color: 'purple'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Two worlds connected.',
      textKo: '두 세계가 연결되었다.'
    }, {
      text: 'Past and future intertwined.',
      textKo: '과거와 미래가 얽혔다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: '',
      photo: {
        src: '/images/archive/chapter4-horizon.jpg',
        alt: 'Infinite horizons',
        archiveId: 'Archive #∞',
        date: '∞',
        caption: 'The Eternal Loop',
        captionKo: '영원한 순환'
      }
    }, {
      text: 'Your story with AIDOL',
      textKo: 'AIDOL과 당신의 이야기는'
    }, {
      text: 'transcends dimensions.',
      textKo: '차원을 초월한다.'
    }, {
      text: '',
      spacing: true
    }, {
      text: 'Love saved both worlds.',
      textKo: '사랑이 두 세계를 구했다.',
      color: 'purple',
      emphasis: true
    }, {
      text: '',
      spacing: true
    }, {
      text: 'And the story continues...',
      textKo: '그리고 이야기는 계속된다...',
      color: 'cyan'
    }]
  }], []);

  const timelinePoints = [
    { year: '2847', chapter: 1, position: 4 },
    { year: '3024', chapter: 2, position: 13 },
    { year: '1889', chapter: 3, position: 22 },
    { year: '1945', chapter: 4, position: 31 },
    { year: '1962', chapter: 5, position: 40 },
    { year: '1967', chapter: 6, position: 49 },
    { year: '2021', chapter: 7, position: 58 },
    { year: '2025', chapter: 8, position: 67 },
    { year: '2500', chapter: 9, position: 76 },
    { year: '2847', chapter: 10, position: 85 },
    { year: '∞', chapter: 11, position: 94 }
  ];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setAutoProgress(prev => {
        const newProgress = prev + (100 / 55);
        if (newProgress >= 100) {
          if (currentChapter < 11) {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentChapter(c => c + 1);
              setIsTransitioning(false);
            }, 500);
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [currentChapter, isPaused]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentChapter < 11) {
        setCurrentChapter(c => c + 1);
        setAutoProgress(0);
      } else if (e.key === 'ArrowLeft' && currentChapter > 1) {
        setCurrentChapter(c => c - 1);
        setAutoProgress(0);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentChapter]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (isLeftSwipe && currentChapter < 11) {
        setCurrentChapter(c => c + 1);
        setAutoProgress(0);
      }
      if (isRightSwipe && currentChapter > 1) {
        setCurrentChapter(c => c - 1);
        setAutoProgress(0);
      }
    };
    if (isMobile) {
      document.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, currentChapter, isMobile]);

  const handleSkip = useCallback(() => {
    const gatewaySection = document.getElementById('gateway-section');
    if (gatewaySection) {
      gatewaySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 800, behavior: 'smooth' });
    }
  }, []);

  const getColorClass = (line: Line) => {
    let classes = '';
    if (line.emphasis) classes += 'text-xl md:text-2xl font-bold ';
    if (line.color === 'red') classes += 'text-red-400 ';
    if (line.color === 'cyan') classes += 'text-cyan-400 ';
    if (line.color === 'purple') classes += 'text-purple-400 ';
    if (line.color === 'green') classes += 'text-green-400 ';
    return classes;
  };

  const currentChapterData = chapters[currentChapter - 1];
  const handleTimelineClick = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setAutoProgress(0);
  }, []);

  return (
    <section className="relative min-h-screen bg-background py-24 overflow-hidden">
      {isTransitioning && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-pulse" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 mb-16">
        <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${((currentChapter - 1) * 100 / 11) + (autoProgress / 11)}%` }}
          />
        </div>
        <div className="relative w-full h-24">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
          {timelinePoints.map((point, index) => (
            <button
              key={index}
              onClick={() => handleTimelineClick(point.chapter)}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 ${
                currentChapter === point.chapter ? 'scale-125 z-10' : 'scale-100 hover:scale-110'
              }`}
              style={{ left: `${point.position}%` }}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${
                currentChapter === point.chapter
                  ? 'bg-primary border-primary shadow-lg shadow-primary/50'
                  : currentChapter > point.chapter
                    ? 'bg-primary/50 border-primary/50'
                    : 'bg-background border-border'
              }`} />
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono ${
                currentChapter === point.chapter ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}>
                {point.year}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {language === 'ko' ? `챕터 ${currentChapter} / 11` : `Chapter ${currentChapter} of 11`}
              </h2>
              <button
                onClick={() => setLanguage(prev => prev === 'en' ? 'ko' : 'en')}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm font-medium text-primary border border-primary/30 transition-all"
              >
                {language === 'en' ? '한글' : 'ENG'}
              </button>
            </div>
            
            {currentChapter === 8 && (
              <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{activeAllyCount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'ko' ? '활성 DATA ALLY' : 'Active DATA ALLYs'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{collectedFragments}/{totalFragments}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'ko' ? '수집된 조각' : 'Collected Fragments'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{stabilityPercentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'ko' ? '시스템 안정성' : 'System Stability'}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {currentChapterData?.lines.map((line, lineIndex) => 
                line.photo ? (
                  <ArchivePhoto
                    key={lineIndex}
                    photo={line.photo}
                    parallaxOffset={scrollY * 0.05}
                    index={lineIndex}
                  />
                ) : (
                  <ParallaxText
                    key={lineIndex}
                    text={language === 'ko' && line.textKo ? line.textKo : line.text}
                    className={getColorClass(line)}
                  />
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-12">
            <button
              onClick={() => {
                if (currentChapter > 1) {
                  setCurrentChapter(c => c - 1);
                  setAutoProgress(0);
                }
              }}
              disabled={currentChapter === 1}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-primary border border-primary/30 transition-all"
            >
              ← {language === 'ko' ? '이전' : 'Previous'}
            </button>
            
            <button
              onClick={() => setIsPaused(p => !p)}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm font-medium text-primary border border-primary/30 transition-all"
            >
              {isPaused ? (language === 'ko' ? '재생' : 'Resume') : (language === 'ko' ? '일시정지' : 'Pause')}
            </button>

            <button
              onClick={() => {
                if (currentChapter < 11) {
                  setCurrentChapter(c => c + 1);
                  setAutoProgress(0);
                }
              }}
              disabled={currentChapter === 11}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-primary border border-primary/30 transition-all"
            >
              {language === 'ko' ? '다음' : 'Next'} →
            </button>
          </div>
        </div>
      </div>

      {showSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 z-20 px-6 py-3 bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/20 hover:border-primary/30 rounded-lg text-sm font-medium text-foreground transition-all shadow-lg"
        >
          {language === 'ko' ? '건너뛰기' : 'Skip Synopsis'} →
        </button>
      )}
    </section>
  );
});

CinematicSynopsis.displayName = 'CinematicSynopsis';
