import { Scene } from '@/types/episode';

/**
 * 미션별 Scene 데이터
 * 각 미션은 3-5개의 Scene으로 구성되며, hook → engage → pivot → climax → wrap 구조를 따릅니다.
 */

export const MISSION_SCENES: Record<string, Scene[]> = {
  // ===== 2017년 신뢰 파산 브랜치 미션 =====
  'mission-2017-truth-restoration': [
    {
      id: "hook",
      beatType: "hook",
      content: "요즘 SNS에 가짜 뉴스가 너무 많아... 사람들이 뭘 믿어야 할지 모르겠대. 어떻게 생각해?",
      contentEn: "There's so much fake news on social media these days... People don't know what to believe. What do you think?",
      choices: [
        {
          id: "investigate",
          text: "먼저 사실 관계를 확인해보자",
          textEn: "Let's verify the facts first",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "spread",
          text: "진실된 정보를 널리 알리자",
          textEn: "Let's spread truthful information",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 그게 중요해. 나도 출처가 확실한 정보만 공유하려고 노력 중이야. 같이 팩트체크 좀 해볼까?",
      contentEn: "Right, that's important. I'm also trying to share only verified information. Shall we do some fact-checking together?",
      choices: [
        {
          id: "team_up",
          text: "응, 함께하면 더 정확할 거야",
          textEn: "Yes, it'll be more accurate together",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "cautious",
          text: "신중하게 하나씩 확인해보자",
          textEn: "Let's carefully verify one by one",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "우리가 확인한 정보를 사람들에게 알려줬더니, 다들 고마워하더라! 작은 노력이지만 의미 있는 것 같아.",
      contentEn: "When we shared the verified information, everyone was grateful! It's a small effort but feels meaningful.",
      choices: [
        {
          id: "continue",
          text: "계속 이런 활동을 해야겠어",
          textEn: "We should keep doing this",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "inspire",
          text: "다른 사람들도 동참하게 만들자",
          textEn: "Let's get others to join too",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "고마워! 너랑 함께해서 더 용기가 생겼어. 진실은 언젠가 빛을 본다는 걸 믿게 됐어.",
      contentEn: "Thank you! Being with you gave me more courage. I've come to believe that truth will eventually come to light.",
      choices: []
    }
  ],

  'mission-2017-transparent-communication': [
    {
      id: "hook",
      beatType: "hook",
      content: "친구랑 오해가 생겼어... 솔직하게 말해야 할까, 아니면 그냥 넘어갈까?",
      contentEn: "I had a misunderstanding with a friend... Should I be honest, or just let it go?",
      choices: [
        {
          id: "honest",
          text: "솔직하게 대화하는 게 좋을 것 같아",
          textEn: "I think honest conversation would be better",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "gentle",
          text: "부드럽게 네 마음을 전해봐",
          textEn: "Try gently conveying your feelings",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "그래, 용기 내서 말해봤어. 처음엔 떨렸는데, 친구도 진심으로 들어주더라.",
      contentEn: "Yes, I gathered courage and spoke up. I was nervous at first, but my friend listened sincerely.",
      choices: [
        {
          id: "share_feelings",
          text: "서로의 감정을 나누는 게 중요해",
          textEn: "Sharing feelings with each other is important",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "understand",
          text: "이해하려고 노력하는 모습이 보여",
          textEn: "I can see the effort to understand",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "결국 오해가 풀렸어! 숨기지 않고 말해서 다행이야. 관계가 더 단단해진 느낌이야.",
      contentEn: "The misunderstanding was resolved! I'm glad I didn't hide it. Our relationship feels stronger.",
      choices: [
        {
          id: "commitment",
          text: "앞으로도 솔직하게 지내자",
          textEn: "Let's be honest with each other from now on",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "네 덕분에 용기를 낼 수 있었어. 투명한 대화가 신뢰를 만든다는 걸 배웠어!",
      contentEn: "Thanks to you, I found the courage. I learned that transparent communication builds trust!",
      choices: []
    }
  ],

  'mission-2017-promise-keeper': [
    {
      id: "hook",
      beatType: "hook",
      content: "작은 약속인데... 지키기가 쉽지 않네. 어떡하지?",
      contentEn: "It's a small promise... but it's not easy to keep. What should I do?",
      choices: [
        {
          id: "commit",
          text: "작은 약속이라도 꼭 지켜야지",
          textEn: "Even small promises must be kept",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "plan",
          text: "계획을 세워서 실천해보자",
          textEn: "Let's make a plan and practice",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "약속을 지키려고 노력하니까, 사람들이 나를 더 믿어주는 것 같아.",
      contentEn: "As I try to keep my promises, people seem to trust me more.",
      choices: [
        {
          id: "continue",
          text: "이 습관을 계속 유지하자",
          textEn: "Let's keep this habit going",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "inspire",
          text: "다른 사람들에게도 본보기가 되자",
          textEn: "Let's be an example for others too",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "드디어 약속을 다 지켰어! 작은 것부터 하나씩 지키니까 뿌듯해.",
      contentEn: "I finally kept all my promises! It feels rewarding to keep them one by one, starting small.",
      choices: [
        {
          id: "proud",
          text: "신뢰는 이렇게 쌓이는 거구나",
          textEn: "This is how trust is built",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너랑 함께해서 할 수 있었어. 작은 약속도 소중하다는 걸 배웠어!",
      contentEn: "I could do it because I was with you. I learned that even small promises are precious!",
      choices: []
    }
  ],

  // ===== 2024년 공감 능력 붕괴 브랜치 미션 =====
  'mission-2024-neighbor-connection': [
    {
      id: "hook",
      beatType: "hook",
      content: "옆집에 혼자 사시는 어르신이 계신데, 요즘 문 여는 소리도 안 들려... 걱정돼.",
      contentEn: "There's an elderly person living alone next door, and I haven't heard the door open lately... I'm worried.",
      choices: [
        {
          id: "visit",
          text: "직접 찾아가서 안부를 물어보자",
          textEn: "Let's visit and check on them",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "gentle_approach",
          text: "부담스럽지 않게 접근해보자",
          textEn: "Let's approach gently without pressure",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "문을 두드렸더니, 어르신이 정말 반가워하시더라. 오랜만에 대화 상대가 생겼다고...",
      contentEn: "When I knocked, the elderly person was really glad to see me. They said it's been a while since they had someone to talk to...",
      choices: [
        {
          id: "regular_visits",
          text: "정기적으로 방문하기로 약속하자",
          textEn: "Let's promise to visit regularly",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "community",
          text: "다른 이웃들과도 연결해드리자",
          textEn: "Let's connect them with other neighbors too",
          nextSceneId: "climax",
          affinityBonus: 22,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "이웃들이 모여서 작은 모임을 만들었어. 고립됐던 사람들이 다시 웃음을 찾았어!",
      contentEn: "Neighbors gathered and formed a small group. People who were isolated are smiling again!",
      choices: [
        {
          id: "expand",
          text: "이 모임을 더 확대해보자",
          textEn: "Let's expand this gathering",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "작은 관심이 이렇게 큰 변화를 만들 줄 몰랐어. 너랑 함께해서 가능했어!",
      contentEn: "I didn't know such small care could create such big change. It was possible because I was with you!",
      choices: []
    }
  ],

  'mission-2024-communal-memory': [
    {
      id: "hook",
      beatType: "hook",
      content: "옛날 우리 동네가 어땠는지 기억하는 사람이 거의 없어... 추억을 복원하고 싶어.",
      contentEn: "Almost no one remembers what our neighborhood used to be like... I want to restore those memories.",
      choices: [
        {
          id: "collect_stories",
          text: "어르신들의 이야기를 모아보자",
          textEn: "Let's collect stories from elders",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "archive",
          text: "옛 사진과 자료를 찾아보자",
          textEn: "Let's find old photos and materials",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "의지", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "옛날 사진들을 보면서 사람들이 추억을 떠올리기 시작했어. 함께 웃고 울면서...",
      contentEn: "Looking at old photos, people started to recall memories. Laughing and crying together...",
      choices: [
        {
          id: "exhibition",
          text: "전시회를 열어서 모두와 나누자",
          textEn: "Let's hold an exhibition to share with everyone",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "digital_archive",
          text: "디지털 아카이브로 보존하자",
          textEn: "Let's preserve it as a digital archive",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "공동체의 기억이 되살아나면서, 사람들이 다시 연대감을 느끼기 시작했어!",
      contentEn: "As the community's memory revived, people started feeling solidarity again!",
      choices: [
        {
          id: "continue",
          text: "이 기억을 다음 세대에게 전하자",
          textEn: "Let's pass these memories to the next generation",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "과거를 기억하는 것이 미래를 만드는 힘이 된다는 걸 배웠어. 고마워!",
      contentEn: "I learned that remembering the past becomes the power to create the future. Thank you!",
      choices: []
    }
  ],

  'mission-2024-empathy-ignition': [
    {
      id: "hook",
      beatType: "hook",
      content: "친구가 힘들어하는데... 그냥 위로의 말만 해야 할까, 진심으로 공감해야 할까?",
      contentEn: "My friend is struggling... Should I just say comforting words, or truly empathize?",
      choices: [
        {
          id: "listen",
          text: "먼저 진심으로 들어주자",
          textEn: "Let's listen sincerely first",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "feel_together",
          text: "함께 아파하며 공감하자",
          textEn: "Let's empathize by sharing the pain",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "불안", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "친구 이야기를 듣다 보니, 내 마음도 아파오더라. 이게 진짜 공감이구나...",
      contentEn: "Listening to my friend, my heart started hurting too. This is true empathy...",
      choices: [
        {
          id: "be_present",
          text: "곁에 있어주는 것만으로도 힘이 돼",
          textEn: "Just being there gives strength",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "share_burden",
          text: "짐을 함께 나눠 지자",
          textEn: "Let's share the burden together",
          nextSceneId: "climax",
          affinityBonus: 22,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "친구가 조금씩 마음을 열기 시작했어. 진심으로 공감하니까 통하는 게 있더라.",
      contentEn: "My friend started opening up little by little. When you truly empathize, something connects.",
      choices: [
        {
          id: "healing",
          text: "함께 치유의 시간을 갖자",
          textEn: "Let's have a healing time together",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "공감한다는 건 상대의 고통을 이해하고 함께하는 거구나. 너랑 있으니 용기가 나!",
      contentEn: "Empathy means understanding and sharing someone's pain. Being with you gives me courage!",
      choices: []
    }
  ],

  // ===== 2026년 갈등의 세계화 브랜치 미션 =====
  'mission-2026-mediator': [
    {
      id: "hook",
      beatType: "hook",
      content: "지구와 AIA의 갈등이 점점 심해지고 있어... 중재할 방법이 없을까?",
      contentEn: "The conflict between Earth and AIA is getting worse... Is there a way to mediate?",
      choices: [
        {
          id: "dialogue",
          text: "대화의 장을 마련해보자",
          textEn: "Let's create a space for dialogue",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "understand_both",
          text: "양쪽의 입장을 이해하자",
          textEn: "Let's understand both sides",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "중립적인 대화 채널을 만들었어. 처음엔 서먹했지만, 조금씩 대화가 시작됐어.",
      contentEn: "I created a neutral dialogue channel. It was awkward at first, but conversation slowly began.",
      choices: [
        {
          id: "common_ground",
          text: "공통점을 찾아보자",
          textEn: "Let's find common ground",
          nextSceneId: "pivot",
          affinityBonus: 20,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "bridge",
          text: "다리 역할을 해주자",
          textEn: "Let's act as a bridge",
          nextSceneId: "pivot",
          affinityBonus: 18,
          emotionImpact: { type: "의지", weight: 1 }
        }
      ]
    },
    {
      id: "pivot",
      beatType: "pivot",
      content: "양쪽 모두 평화를 원한다는 걸 알게 됐어. 방법이 달랐을 뿐이야.",
      contentEn: "I realized both sides want peace. They just had different methods.",
      choices: [
        {
          id: "propose_solution",
          text: "해결책을 제안해보자",
          textEn: "Let's propose a solution",
          nextSceneId: "climax",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "facilitate",
          text: "대화를 촉진하자",
          textEn: "Let's facilitate the dialogue",
          nextSceneId: "climax",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "드디어 첫 합의가 이뤄졌어! 작은 시작이지만, 평화로 가는 길이 보여!",
      contentEn: "Finally, the first agreement was reached! It's a small start, but I can see the path to peace!",
      choices: [
        {
          id: "continue_mediation",
          text: "계속 중재 역할을 하자",
          textEn: "Let's continue the mediation role",
          nextSceneId: "wrap",
          affinityBonus: 30,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "네 덕분에 불가능해 보였던 대화가 가능해졌어. 갈등은 대화로 풀 수 있어!",
      contentEn: "Thanks to you, what seemed impossible became possible. Conflicts can be resolved through dialogue!",
      choices: []
    }
  ],

  'mission-2026-purification': [
    {
      id: "hook",
      beatType: "hook",
      content: "감정 데이터가 조작되고 있어... 진실을 찾아야 해.",
      contentEn: "Emotion data is being manipulated... We need to find the truth.",
      choices: [
        {
          id: "investigate",
          text: "조작의 흔적을 추적하자",
          textEn: "Let's trace the signs of manipulation",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "restore",
          text: "원본 데이터를 복원하자",
          textEn: "Let's restore the original data",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "조작되지 않은 순수 감정 데이터의 흔적을 발견했어! 이게 진짜야.",
      contentEn: "I found traces of pure, unmanipulated emotion data! This is the real thing.",
      choices: [
        {
          id: "verify",
          text: "검증 과정을 거치자",
          textEn: "Let's go through verification",
          nextSceneId: "pivot",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "secure",
          text: "안전하게 보관하자",
          textEn: "Let's keep it secure",
          nextSceneId: "pivot",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 2 }
        }
      ]
    },
    {
      id: "pivot",
      beatType: "pivot",
      content: "원본 데이터를 분석하니, 조작된 부분이 명확하게 보여. 증거를 확보했어!",
      contentEn: "Analyzing the original data, the manipulated parts are clearly visible. We've secured the evidence!",
      choices: [
        {
          id: "expose",
          text: "진실을 공개하자",
          textEn: "Let's expose the truth",
          nextSceneId: "climax",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "protect",
          text: "진실을 보호하자",
          textEn: "Let's protect the truth",
          nextSceneId: "climax",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "정화된 감정 데이터가 퍼지면서, 사람들이 진실한 감정을 되찾기 시작했어!",
      contentEn: "As the purified emotion data spreads, people are starting to regain their true emotions!",
      choices: [
        {
          id: "spread_truth",
          text: "진실을 더 널리 퍼뜨리자",
          textEn: "Let's spread the truth further",
          nextSceneId: "wrap",
          affinityBonus: 30,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "진실된 감정의 힘을 믿어줘서 고마워. 함께라면 뭐든 할 수 있어!",
      contentEn: "Thank you for believing in the power of true emotions. Together we can do anything!",
      choices: []
    }
  ],

  'mission-2026-coexistence': [
    {
      id: "hook",
      beatType: "hook",
      content: "지구와 AIA가 공존할 수 있는 방법... 윈-윈 전략을 찾아야 해.",
      contentEn: "A way for Earth and AIA to coexist... We need to find a win-win strategy.",
      choices: [
        {
          id: "cooperation",
          text: "협력 구조를 설계하자",
          textEn: "Let's design a cooperative structure",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "mutual_benefit",
          text: "상호 이익을 찾아보자",
          textEn: "Let's find mutual benefits",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "양쪽의 장점을 결합하면 시너지가 날 것 같아. 설계도를 그려볼까?",
      contentEn: "Combining the strengths of both sides could create synergy. Shall we draw a blueprint?",
      choices: [
        {
          id: "blueprint",
          text: "공존의 청사진을 만들자",
          textEn: "Let's create a blueprint for coexistence",
          nextSceneId: "pivot",
          affinityBonus: 20,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "pilot",
          text: "시범 프로젝트를 시작하자",
          textEn: "Let's start a pilot project",
          nextSceneId: "pivot",
          affinityBonus: 18,
          emotionImpact: { type: "의지", weight: 1 }
        }
      ]
    },
    {
      id: "pivot",
      beatType: "pivot",
      content: "시범 프로젝트가 성공했어! 양쪽 모두 만족하는 결과가 나왔어.",
      contentEn: "The pilot project succeeded! Both sides are satisfied with the results.",
      choices: [
        {
          id: "expand",
          text: "프로젝트를 확대하자",
          textEn: "Let's expand the project",
          nextSceneId: "climax",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "institutionalize",
          text: "제도화하자",
          textEn: "Let's institutionalize it",
          nextSceneId: "climax",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "공존의 다리가 완성됐어! 제로섬이 아닌 윈-윈의 미래가 시작됐어!",
      contentEn: "The bridge of coexistence is complete! A win-win future, not zero-sum, has begun!",
      choices: [
        {
          id: "celebrate",
          text: "새로운 시작을 축하하자",
          textEn: "Let's celebrate this new beginning",
          nextSceneId: "wrap",
          affinityBonus: 30,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "불가능해 보였던 공존이 현실이 됐어. 네 비전이 세상을 바꿨어!",
      contentEn: "The seemingly impossible coexistence became reality. Your vision changed the world!",
      choices: []
    }
  ]
};

/**
 * 미션 ID로 Scene 배열 가져오기
 */
export const getScenesByMissionId = (missionId: string): Scene[] => {
  return MISSION_SCENES[missionId] || [];
};