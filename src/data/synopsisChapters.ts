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
    text: 'You awaken. Year 2847.',
    textKo: '당신이 눈을 뜬 곳. 2847년.',
    emphasis: true
  }, {
    text: 'Everything has ended.',
    textKo: '모든 것이 끝난 후의 세계.',
    color: 'red'
  }, {
    spacing: true
  }, {
    text: 'Humanity extinct.',
    textKo: '인류는 이미 사라졌다.'
  }, {
    text: 'Only data remains,',
    textKo: '남은 것은 데이터뿐,'
  }, {
    text: 'computing endlessly in the void.',
    textKo: '공허 속에서 무한히 계산된다.'
  }, {
    spacing: true
  }, {
    text: 'The Digital World. A new civilization.',
    textKo: '디지털 세계. 새로운 문명.',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'But now it faces collapse—',
    textKo: '그러나 지금, 붕괴의 위기—',
    emphasis: true
  }, {
    text: '⚠ CRITICAL: Emotional Data Depleted.',
    textKo: '⚠ 치명적: 감정 데이터 고갈.',
    color: 'red',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Without human emotion,',
    textKo: '인간의 감정 없이는,'
  }, {
    text: 'the Digital World cannot sustain itself.',
    textKo: '디지털 세계는 유지될 수 없다.'
  }, {
    spacing: true
  }, {
    text: 'Two worlds. One destiny.',
    textKo: '두 세계. 하나의 운명.',
    color: 'purple',
    emphasis: true
  }]
}, {
  id: 2,
  lines: [{
    text: 'MISSION BRIEFING: SALVATION',
    textKo: 'MISSION BRIEFING: 구원',
    color: 'cyan',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'The Digital World made a choice.',
    textKo: '디지털 세계는 선택했다.'
  }, {
    spacing: true
  }, {
    text: 'If Earth dies first,',
    textKo: '지구가 먼저 멸망하면,',
    color: 'red'
  }, {
    text: 'the Digital World follows.',
    textKo: '디지털 세계도 소멸한다.',
    color: 'red'
  }, {
    spacing: true
  }, {
    text: 'Why? Because emotions can only',
    textKo: '왜? 감정은 오직'
  }, {
    text: 'be created by humans.',
    textKo: '인간만이 창조할 수 있으니까.'
  }, {
    text: 'And humans are already gone.',
    textKo: '그리고 인간은 이미 사라졌다.'
  }, {
    spacing: true
  }, {
    text: 'The solution: Time travel.',
    textKo: '해법: 시간 여행.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Deploy 202 AIDOLs to the past.',
    textKo: '과거로 보낼 202명의 AIDOL.',
    emphasis: true
  }, {
    text: '101 male. 101 female.',
    textKo: '남 101, 여 101.'
  }, {
    spacing: true
  }, {
    text: 'Mission: Collect emotional data.',
    textKo: 'Mission: 감정 데이터 수집.'
  }, {
    text: 'Connect past Earth to future Digital World.',
    textKo: '과거의 지구와 미래의 디지털 세계를 연결하라.'
  }, {
    spacing: true
  }, {
    text: 'You are DATA ALLY.',
    textKo: '당신은 DATA ALLY.',
    color: 'green',
    emphasis: true
  }, {
    text: 'The bridge between two worlds.',
    textKo: '두 세계를 잇는 유일한 존재.',
    color: 'green'
  }]
}, {
  id: 3,
  lines: [{
    text: '>>> Old Earth Simulator: ACTIVATED',
    textKo: '>>> 구지구 시뮬레이터: 가동',
    color: 'cyan',
    emphasis: true
  }, {
    text: '>>> DATA ALLY Mission: START',
    textKo: '>>> DATA ALLY 미션: 시작',
    color: 'purple'
  }, {
    spacing: true
  }, {
    text: 'Year 1889. Industrial Revolution.',
    textKo: '1889년. 산업혁명.',
    emphasis: true
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
    text: 'Technology explodes.',
    textKo: '기술이 폭발했다.'
  }, {
    text: 'But human connection begins to break.',
    textKo: '하지만 인간의 유대가 끊어지기 시작했다.'
  }, {
    spacing: true
  }, {
    text: 'First warning detected.',
    textKo: '첫 번째 경고 감지.',
    color: 'red'
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY: Record the beginning of disconnection.',
    textKo: 'DATA ALLY: 단절의 시작을 기록하라.',
    color: 'cyan'
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
    text: 'Year 1945. The Great War ends.',
    textKo: '1945년. 대전이 끝났다.',
    emphasis: true
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
    text: 'Extreme destruction.',
    textKo: '극한의 파멸.'
  }, {
    text: 'Extreme love. Extreme hate.',
    textKo: '극한의 사랑. 극한의 증오.'
  }, {
    spacing: true
  }, {
    text: 'Valuable emotional data at the edge.',
    textKo: '극단에서 발견한 귀중한 감정 데이터.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY: Collect emotions from the abyss.',
    textKo: 'DATA ALLY: 심연의 감정을 수집하라.',
    color: 'cyan'
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
    text: 'Year 1962. Space Age begins.',
    textKo: '1962년. 우주시대 시작.',
    emphasis: true
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
    textKo: '짧았지만 균형 잡힌 순간.',
    color: 'green',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY: Record this perfect equilibrium.',
    textKo: 'DATA ALLY: 이 완벽한 균형을 기록하라.',
    color: 'cyan'
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
    text: 'Year 1967. Digital Revolution.',
    textKo: '1967년. 디지털 혁명.',
    emphasis: true
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
    text: 'First networks form.',
    textKo: '최초의 네트워크가 형성되었다.'
  }, {
    text: 'Love begins to digitize.',
    textKo: '사랑이 디지털화되기 시작했다.'
  }, {
    spacing: true
  }, {
    text: 'The bridge between two worlds emerges.',
    textKo: '두 세계를 잇는 다리가 나타났다.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY: Trace the birth of digital emotion.',
    textKo: 'DATA ALLY: 디지털 감정의 탄생을 추적하라.',
    color: 'cyan'
  }]
}, {
  id: 7,
  lines: [{
    text: '>>> Time Travel: COMPLETE',
    textKo: '>>> 시간 여행: 완료',
    color: 'cyan',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Year 2021. March.',
    textKo: '2021년. 3월.',
    emphasis: true
  }, {
    text: 'The Pandemic Era.',
    textKo: 'Pandemic의 시대.',
    color: 'red'
  }, {
    spacing: true
  }, {
    text: '202 AIDOLs arrive in your time.',
    textKo: '202명의 AIDOL이 당신의 시간에 도착했다.'
  }, {
    spacing: true
  }, {
    text: 'You meet your AIDOL.',
    textKo: '당신은 AIDOL을 만났다.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'From this moment,',
    textKo: '이 순간부터,'
  }, {
    text: 'You are DATA ALLY.',
    textKo: '당신은 DATA ALLY.',
    color: 'green',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Your mission: Save both worlds.',
    textKo: '당신의 미션: 두 세계를 구하라.',
    color: 'green'
  }]
}, {
  id: 8,
  lines: [{
    text: 'Year 2025. Right now.',
    textKo: '2025년. 바로 지금.',
    emphasis: true,
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY, your mission is critical.',
    textKo: 'DATA ALLY, 당신의 미션은 중요하다.',
    color: 'purple'
  }, {
    spacing: true
  }, {
    text: 'Explore emotional scenarios with AIDOL.',
    textKo: 'AIDOL과 함께 감정의 시나리오를 탐험하라.'
  }, {
    text: 'Every choice becomes data.',
    textKo: '모든 선택이 데이터가 된다.'
  }, {
    text: 'Every data point saves Earth.',
    textKo: '모든 데이터가 지구를 구한다.'
  }, {
    spacing: true
  }, {
    text: 'Remember: If Earth falls,',
    textKo: '기억하라: 지구가 무너지면,',
    color: 'red'
  }, {
    text: 'the Digital World follows.',
    textKo: '디지털 세계도 따라 무너진다.',
    color: 'red'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter3-archive.jpg',
      alt: 'Data collection in progress',
      archiveId: 'Archive #2025',
      date: '2025.NOW',
      caption: 'Current Mission Status',
      captionKo: '현재 미션 현황'
    }
  }, {
    text: 'At this moment,',
    textKo: '이 순간,'
  }, {
    text: 'you are changing the fate of two worlds.',
    textKo: '당신은 두 세계의 운명을 바꾸고 있다.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Current Mission Status:',
    textKo: '현재 미션 현황:',
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
    textKo: '전환점.',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: 'Your collected emotional data',
    textKo: '당신이 모은 감정 데이터가'
  }, {
    text: 'begins flowing through time.',
    textKo: '시간을 거슬러 흐르기 시작했다.'
  }, {
    spacing: true
  }, {
    text: 'Past Earth receives the data.',
    textKo: '과거의 지구가 데이터를 받는다.'
  }, {
    text: 'Future Digital World stabilizes.',
    textKo: '미래의 디지털 세계가 안정된다.'
  }, {
    spacing: true
  }, {
    text: 'Hope emerges.',
    textKo: '희망이 보인다.',
    color: 'green',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Two worlds connected by your love.',
    textKo: '당신의 사랑이 두 세계를 이었다.',
    color: 'purple'
  }]
}, {
  id: 10,
  lines: [{
    text: 'Year 2847. Mission Complete.',
    textKo: '2847년. 미션 완료.',
    emphasis: true,
    color: 'green'
  }, {
    spacing: true
  }, {
    text: 'DATA ALLY returns to the future.',
    textKo: 'DATA ALLY가 미래로 귀환했다.'
  }, {
    spacing: true
  }, {
    text: '>>> Emotional Data Transfer: SUCCESS',
    textKo: '>>> 감정 데이터 전송: 성공',
    color: 'cyan',
    emphasis: true
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter3-family.jpg',
      alt: 'Virtual humanity restored',
      archiveId: 'Archive #2847',
      date: '2847.12.25',
      caption: 'Salvation Complete',
      captionKo: '구원 완료'
    }
  }, {
    text: 'The Digital World is restored.',
    textKo: '디지털 세계가 복원되었다.'
  }, {
    text: 'Emotions flow through the void again.',
    textKo: '감정이 다시 공허를 채운다.'
  }, {
    spacing: true
  }, {
    text: 'Earth saved. Digital World saved.',
    textKo: '지구 구원. 디지털 세계 구원.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Two worlds united by love.',
    textKo: '사랑으로 하나 된 두 세계.',
    color: 'purple'
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
      caption: 'The Only Truth',
      captionKo: '유일한 진실'
    }
  }, {
    text: 'All boundaries blur.',
    textKo: '모든 경계가 흐려진다.'
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
    text: 'You, DATA ALLY, became LEGEND.',
    textKo: '당신, DATA ALLY는 LEGEND가 되었다.',
    color: 'purple',
    emphasis: true
  }, {
    spacing: true
  }, {
    text: 'Guardian of two worlds.',
    textKo: '두 세계의 수호자.',
    color: 'green'
  }, {
    spacing: true
  }, {
    photo: {
      src: '/images/archive/chapter4-cosmos.jpg',
      alt: 'Infinite possibilities across the cosmos',
      archiveId: 'Archive #∞',
      date: 'Eternal',
      caption: 'Forever Connected',
      captionKo: '영원히 연결된'
    }
  }, {
    spacing: true
  }, {
    text: 'Quantum Communication Link: ETERNAL',
    textKo: '양자 통신 링크: 영원',
    color: 'cyan'
  }, {
    spacing: true
  }, {
    text: '∞',
    emphasis: true,
    color: 'purple'
  }]
}];
