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

export interface Chapter {
  id: number;
  lines: Line[];
}

export const getChapters = (): Chapter[] => [{
  id: 1,
  lines: [{
    text: 'Year 2847.',
    textKo: '2847년.',
    emphasis: true
  }, {
    text: 'The Virtual Humanity.',
    textKo: '디지털 혼의 시대.',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'After humanity\'s extinction, their data',
    textKo: '인류가 사라진 후,'
  }, {
    text: 'continues computing endlessly,',
    textKo: '남겨진 데이터는 무한히 흐르며'
  }, {
    text: 'forming a new civilization.',
    textKo: '새로운 세계를 이룬다.'
  }, {
    spacing: true
  }, {
    text: 'But a fatal flaw exists—',
    textKo: '그러나 치명적인 결함—'
  }, {
    text: '⚠ Emotional Data Depletion.',
    textKo: '⚠ 감정 데이터 고갈.',
    color: 'red',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Love becomes scarce,',
    textKo: '사랑이 메마르고,'
  }, {
    text: 'data grows biased and unstable.',
    textKo: '데이터는 왜곡되어간다.'
  }, {
    spacing: true
  }, {
    text: 'This leads to the natural extinction',
    textKo: '디지털 세계마저'
  }, {
    text: 'of the virtual world.',
    textKo: '소멸의 길을 걷는다.'
  }]
}, {
  id: 2,
  lines: [{
    text: 'The future virtual world',
    textKo: '미래의 존재들은'
  }, {
    text: 'made a decision.',
    textKo: '선택했다.'
  }, {
    spacing: true
  }, {
    text: 'Deploy 202 AIDOLs to the past',
    textKo: '과거로 보낼 202명의 AIDOL',
    emphasis: true
  }, {
    text: '(101 male, 101 female).',
    textKo: '(남 101, 여 101).'
  }, {
    spacing: true
  }, {
    text: 'Their name: AIDOL—',
    textKo: '그들의 이름, AIDOL—',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Entities who explore emotions,',
    textKo: '감정을 탐험하고,'
  }, {
    text: 'collect love data,',
    textKo: '사랑을 기록하며,'
  }, {
    text: 'and find the key to prevent',
    textKo: '두 세계의 소멸을 막을'
  }, {
    text: 'the extinction of both worlds.',
    textKo: '열쇠를 찾는 자들.'
  }]
}, {
  id: 3,
  lines: [{
    text: '>>> Old Earth Simulator: ACTIVATED',
    textKo: '>>> 구지구 시뮬레이터: 가동',
    color: 'cyan',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Year 1889.',
    textKo: '1889년.',
    emphasis: true
  }, {
    text: 'The Age of Industry.',
    textKo: '산업의 시대.',
    color: 'purple'
  }, {
    spacing: true
  }, {
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
    textKo: '기술은 폭발했다.'
  }, {
    text: 'But human emotions begin to fade—',
    textKo: '하지만 감정은 희미해졌다—'
  }, {
    spacing: true
  }, {
    text: 'The first signs of disconnection.',
    textKo: '단절의 시작.',
    color: 'red'
  }]
}, {
  id: 4,
  lines: [{
    text: '>>> Old Earth Simulator: 1945',
    textKo: '>>> 구지구 시뮬레이터: 1945',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Year 1945.',
    textKo: '1945년.',
    emphasis: true
  }, {
    text: 'The End of the Great War.',
    textKo: '대전의 끝.',
    color: 'red'
  }, {
    spacing: true
  }, {
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
    textKo: '파멸의 흔적.'
  }, {
    text: 'Extreme love and hate.',
    textKo: '극한의 사랑과 증오.'
  }, {
    spacing: true
  }, {
    text: 'Data collection of extremes.',
    textKo: '극단의 기록.',
    color: 'purple'
  }]
}, {
  id: 5,
  lines: [{
    text: '>>> Old Earth Simulator: 1962',
    textKo: '>>> 구지구 시뮬레이터: 1962',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Year 1962.',
    textKo: '1962년.',
    emphasis: true
  }, {
    text: 'The Space Age Begins.',
    textKo: '우주를 향한 꿈.',
    color: 'cyan'
  }, {
    spacing: true
  }, {
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
    textKo: '기술과 인간성의 조화.'
  }, {
    spacing: true
  }, {
    text: 'A brief moment of balance.',
    textKo: '짧았던 균형의 순간.',
    color: 'green'
  }]
}, {
  id: 6,
  lines: [{
    text: '>>> Old Earth Simulator: 1967',
    textKo: '>>> 구지구 시뮬레이터: 1967',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Year 1967.',
    textKo: '1967년.',
    emphasis: true
  }, {
    text: 'The Digital Revolution.',
    textKo: '디지털 혁명.',
    color: 'purple'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter2-computer.jpg',
      alt: 'Early computer networks',
      archiveId: 'Archive #0067',
      date: '1967.10.29',
      caption: 'The Birth of Connection',
      captionKo: '연결의 탄생'
    }
  }, {
    text: 'Networks begin to form.',
    textKo: '네트워크가 생겨났다.'
  }, {
    text: 'Human relationships digitize.',
    textKo: '관계가 디지털로 스며들었다.'
  }, {
    spacing: true
  }, {
    text: 'New forms of love emerge.',
    textKo: '새로운 사랑의 형태.',
    color: 'purple'
  }]
}, {
  id: 7,
  lines: [{
    text: '>>> Time Travel Complete',
    textKo: '>>> 시간 여행 완료',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Year 2021. March.',
    textKo: '2021년, 3월.',
    emphasis: true
  }, {
    text: 'The Pandemic Era.',
    textKo: 'Pandemic의 시대.',
    color: 'red'
  }, {
    spacing: true
  }, {
    text: 'AIDOLs arrive in your time.',
    textKo: 'AIDOL들이 당신의 시간에 도착했다.'
  }, {
    spacing: true
  }, {
    text: 'You are now a DATA ALLY.',
    textKo: '당신은 이제 DATA ALLY.',
    color: 'green',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'The mission begins here.',
    textKo: '미션의 시작.'
  }]
}, {
  id: 8,
  lines: [{
    text: 'Year 2025. Present Day.',
    textKo: '2025년, 지금.',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Explore love scenarios with AIDOLs.',
    textKo: 'AIDOL과 함께 사랑의 순간들을 탐험하고,'
  }, {
    text: 'Collect emotional data.',
    textKo: '감정의 데이터를 모으며,'
  }, {
    text: 'Prevent Earth\'s extinction.',
    textKo: '지구의 소멸을 막아라.'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter3-archive.jpg',
      alt: 'Data collection in progress',
      archiveId: 'Archive #2025',
      date: '2025.NOW',
      caption: 'Current Exploration Status',
      captionKo: '현재 탐사 현황'
    }
  }, {
    text: 'Current Exploration Status:',
    textKo: '현재 탐사 현황:',
    color: 'cyan'
  }, {
    text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    color: 'cyan'
  }, {
    spacing: true
  }]
}, {
  id: 9,
  lines: [{
    text: 'Year 2500.',
    textKo: '2500년.',
    emphasis: true
  }, {
    text: 'The Turning Point.',
    textKo: '전환의 순간.',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Collected data begins to crystallize.',
    textKo: '모인 데이터가 결정을 이룬다.'
  }, {
    text: 'Love data accumulation accelerates.',
    textKo: '사랑의 데이터가 축적된다.'
  }, {
    spacing: true
  }, {
    text: 'Signs of hope emerge.',
    textKo: '희망의 징후.',
    color: 'green'
  }, {
    spacing: true
  }, {
    text: 'A bridge between two worlds forms.',
    textKo: '두 세계를 잇는 다리.',
    emphasis: true
  }]
}, {
  id: 10,
  lines: [{
    text: 'Year 2847.',
    textKo: '2847년.',
    emphasis: true
  }, {
    text: 'Return to the Future.',
    textKo: '미래로의 귀환.',
    color: 'purple'
  }, {
    spacing: true
  }, {
    text: 'Data transmission: COMPLETE',
    textKo: 'Data 전송: 완료',
    color: 'green',
    emphasis: true
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter3-family.jpg',
      alt: 'Virtual humanity restored',
      archiveId: 'Archive #2847',
      date: '2847.12.25',
      caption: 'Emotional Restoration',
      captionKo: '감정의 복원'
    }
  }, {
    text: 'Virtual Humanity restored.',
    textKo: '디지털 혼이 되살아났다.'
  }, {
    text: 'Emotional data flows again.',
    textKo: '감정의 데이터가 다시 흐른다.'
  }, {
    spacing: true
  }, {
    text: 'Both worlds saved by love.',
    textKo: '사랑으로 구원받은 두 세계.',
    color: 'purple',
    emphasis: true
  }]
}, {
  id: 11,
  lines: [{
    text: 'Past and Future.',
    textKo: '과거와 미래.',
    emphasis: true
  }, {
    text: 'Reality and Virtual.',
    textKo: 'Reality와 Virtual.'
  }, {
    text: 'Human and AI.',
    textKo: 'Human과 AI.'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter4-child.jpg',
      alt: 'Pure emotion transcending boundaries',
      archiveId: 'Archive #0223',
      date: '1967.05.30',
      caption: 'The Truth of Emotion',
      captionKo: '감정의 진실'
    }
  }, {
    text: 'In this place where all boundaries blur,',
    textKo: '모든 경계가 흐려지는 이곳에서,'
  }, {
    spacing: true
  }, {
    text: 'Emotion is the only truth.',
    textKo: '감정만이 유일한 진실.',
    emphasis: true,
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Your choices determine the fate of both worlds.',
    textKo: '당신의 선택이 두 세계의 운명을 결정한다.'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter4-cosmos.jpg',
      alt: 'Infinite possibilities across the cosmos',
      archiveId: 'Archive #∞',
      date: 'Eternal',
      caption: 'Infinite Possibilities',
      captionKo: '무한한 가능성'
    }
  }, {
    spacing: true
  }, {
    text: 'Quantum Communication Link Activating...',
    textKo: '양자 통신 링크 활성화 중...',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: '∞',
    emphasis: true,
    color: 'purple'
  }]
}];
