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

  'mission-2017-truth-verification': [
    {
      id: "hook",
      beatType: "hook",
      content: "이 기사 진짜일까? 출처가 좀 의심스러운데...",
      contentEn: "Is this article real? The source seems suspicious...",
      choices: [
        {
          id: "check_source",
          text: "출처부터 확인해보자",
          textEn: "Let's check the source first",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "cross_reference",
          text: "다른 매체도 찾아보자",
          textEn: "Let's look for other sources",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "좋은 생각이야! 여러 곳을 비교해보니 내용이 다르네. 어떤 게 진짜일까?",
      contentEn: "Good idea! Comparing multiple sources shows different content. Which one is real?",
      choices: [
        {
          id: "analyze",
          text: "논리적으로 분석해보자",
          textEn: "Let's analyze logically",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "expert",
          text: "전문가 의견을 찾아보자",
          textEn: "Let's find expert opinions",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "드디어 진실을 찾았어! 역시 꼼꼼하게 확인하는 게 중요하구나.",
      contentEn: "Finally found the truth! Thorough verification is indeed important.",
      choices: [
        {
          id: "share",
          text: "이 방법을 다른 사람들에게도 알려주자",
          textEn: "Let's share this method with others",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "practice",
          text: "앞으로도 계속 이렇게 하자",
          textEn: "Let's keep doing this from now on",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 팩트체크의 중요성을 다시 깨달았어. 고마워!",
      contentEn: "Thanks to you, I realized the importance of fact-checking again. Thank you!",
      choices: []
    }
  ],

  'mission-2017-truth-education': [
    {
      id: "hook",
      beatType: "hook",
      content: "사람들이 가짜 뉴스를 너무 쉽게 믿어버려... 어떻게 하면 좋을까?",
      contentEn: "People believe fake news too easily... What should we do?",
      choices: [
        {
          id: "educate",
          text: "올바른 정보 판단법을 알려주자",
          textEn: "Let's teach proper information judgment",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "campaign",
          text: "캠페인을 시작해보자",
          textEn: "Let's start a campaign",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "좋아! 간단한 체크리스트를 만들어볼까? 출처 확인, 날짜 확인, 교차 검증...",
      contentEn: "Great! Shall we make a simple checklist? Source verification, date check, cross-validation...",
      choices: [
        {
          id: "create",
          text: "체크리스트를 만들어보자",
          textEn: "Let's create a checklist",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "workshop",
          text: "워크샵을 열어보자",
          textEn: "Let's hold a workshop",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "우와, 생각보다 많은 사람들이 관심을 가져줬어! 이제 더 많은 사람들이 현명하게 정보를 판단할 수 있을 거야.",
      contentEn: "Wow, more people showed interest than expected! Now more people will be able to judge information wisely.",
      choices: [
        {
          id: "expand",
          text: "더 많은 곳으로 확대하자",
          textEn: "Let's expand to more places",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "deepen",
          text: "내용을 더 깊이 있게 만들자",
          textEn: "Let's make the content deeper",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너랑 함께 만든 교육 프로그램이 정말 의미 있었어. 작은 변화가 모여 큰 변화를 만들 수 있다는 걸 배웠어!",
      contentEn: "The education program we created together was really meaningful. I learned that small changes can create big changes!",
      choices: []
    }
  ],

  // ===== 2019년 관계 단절 브랜치 미션 =====
  'mission-2019-connection-bridge': [
    {
      id: "hook",
      beatType: "hook",
      content: "요즘 사람들이 너무 각자 살아가는 것 같아... 옆집 사람도 모르고 지나가잖아.",
      contentEn: "People seem to live too separately these days... We don't even know our neighbors.",
      choices: [
        {
          id: "community",
          text: "작은 커뮤니티부터 만들어보자",
          textEn: "Let's start with a small community",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "event",
          text: "이웃과 만날 수 있는 행사를 열자",
          textEn: "Let's hold an event to meet neighbors",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "좋은 생각이야! 작은 모임부터 시작해볼까? 같은 관심사를 가진 사람들끼리 모이면 자연스럽게 친해질 수 있을 거야.",
      contentEn: "Good idea! Shall we start with a small gathering? People with similar interests can naturally become close.",
      choices: [
        {
          id: "organize",
          text: "모임을 직접 조직해보자",
          textEn: "Let's organize the gathering ourselves",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "platform",
          text: "온라인 플랫폼을 만들어보자",
          textEn: "Let's create an online platform",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "첫 모임이 대성공이었어! 사람들이 서로 이야기하고 웃는 모습을 보니 정말 뿌듯해.",
      contentEn: "The first gathering was a huge success! It's so rewarding to see people talking and laughing together.",
      choices: [
        {
          id: "regular",
          text: "정기 모임으로 만들자",
          textEn: "Let's make it a regular gathering",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "diverse",
          text: "다양한 주제로 확장하자",
          textEn: "Let's expand to various topics",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 사람들이 다시 연결되는 걸 봤어. 작은 시작이 이렇게 큰 변화를 만들 수 있다니!",
      contentEn: "Thanks to you, I saw people reconnecting. A small start can create such big changes!",
      choices: []
    }
  ],

  'mission-2019-connection-empathy': [
    {
      id: "hook",
      beatType: "hook",
      content: "사람들이 서로를 이해하려고 하지 않는 것 같아... 다들 자기 말만 하려고 해.",
      contentEn: "People don't seem to try to understand each other... Everyone just wants to talk about themselves.",
      choices: [
        {
          id: "listen",
          text: "먼저 경청하는 법을 알려주자",
          textEn: "Let's teach listening first",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "share",
          text: "서로의 이야기를 나누는 시간을 만들자",
          textEn: "Let's create time to share stories",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 공감이 중요하지. 상대방의 입장에서 생각해보는 연습을 해볼까?",
      contentEn: "Right, empathy is important. Shall we practice thinking from others' perspectives?",
      choices: [
        {
          id: "workshop",
          text: "공감 워크샵을 열어보자",
          textEn: "Let's hold an empathy workshop",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "practice",
          text: "일상에서 실천할 수 있는 방법을 찾자",
          textEn: "Let's find ways to practice in daily life",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "사람들이 서로의 이야기를 듣고 공감하는 모습을 보니 감동이야... 이게 진짜 소통이구나.",
      contentEn: "It's touching to see people listening and empathizing with each other... This is real communication.",
      choices: [
        {
          id: "spread",
          text: "이 문화를 더 널리 퍼뜨리자",
          textEn: "Let's spread this culture wider",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "deepen",
          text: "더 깊은 공감 능력을 키우자",
          textEn: "Let's develop deeper empathy skills",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너와 함께 만든 공감의 문화가 정말 아름다워. 사람들이 서로를 이해하는 세상, 우리가 만들어가고 있어!",
      contentEn: "The culture of empathy we created together is truly beautiful. We're creating a world where people understand each other!",
      choices: []
    }
  ],

  'mission-2019-connection-digital': [
    {
      id: "hook",
      beatType: "hook",
      content: "온라인에서는 연결되어 있지만, 실제로는 더 외로운 것 같아... 이상하지 않아?",
      contentEn: "We're connected online, but actually feel more lonely... Isn't that strange?",
      choices: [
        {
          id: "balance",
          text: "온오프라인 균형을 찾아보자",
          textEn: "Let's find online-offline balance",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "meaningful",
          text: "의미 있는 디지털 소통을 만들자",
          textEn: "Let's create meaningful digital communication",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "그래, 단순히 '좋아요'를 누르는 것보다 진심 어린 대화가 필요해. 어떻게 시작할까?",
      contentEn: "Yes, we need sincere conversations rather than just clicking 'like'. How should we start?",
      choices: [
        {
          id: "quality",
          text: "질 높은 소통 문화를 만들자",
          textEn: "Let's create quality communication culture",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "offline",
          text: "온라인 관계를 오프라인으로 연결하자",
          textEn: "Let's connect online relationships offline",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "온라인에서 시작된 관계가 실제 만남으로 이어지니까 훨씬 더 깊어지는 것 같아!",
      contentEn: "Relationships that started online become much deeper when they lead to real meetings!",
      choices: [
        {
          id: "community",
          text: "온오프라인 통합 커뮤니티를 만들자",
          textEn: "Let's create integrated online-offline community",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "guide",
          text: "건강한 디지털 소통 가이드를 만들자",
          textEn: "Let's create healthy digital communication guide",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "디지털 시대에도 진정한 연결은 가능하다는 걸 보여줬어. 너와 함께라면 뭐든 할 수 있을 것 같아!",
      contentEn: "We showed that genuine connection is possible even in the digital age. I feel like we can do anything together!",
      choices: []
    }
  ],

  // ===== 2021년 의미 상실 브랜치 미션 =====
  'mission-2021-meaning-purpose': [
    {
      id: "hook",
      beatType: "hook",
      content: "요즘 뭘 해도 의미가 없는 것 같아... 그냥 하루하루 살아가는 느낌이야.",
      contentEn: "Nothing seems meaningful these days... Just living day by day.",
      choices: [
        {
          id: "reflect",
          text: "진짜 원하는 게 뭔지 생각해보자",
          textEn: "Let's think about what you really want",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "explore",
          text: "새로운 것들을 탐험해보자",
          textEn: "Let's explore new things",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아... 나도 내가 진짜 원하는 게 뭔지 잘 모르겠어. 같이 찾아볼까?",
      contentEn: "Right... I don't really know what I truly want either. Shall we find out together?",
      choices: [
        {
          id: "values",
          text: "가치관을 정리해보자",
          textEn: "Let's organize your values",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "try",
          text: "여러 가지를 시도해보자",
          textEn: "Let's try various things",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "아, 이거야! 이걸 하고 있을 때가 제일 행복했어. 드디어 내 길을 찾은 것 같아!",
      contentEn: "Ah, this is it! I was happiest when doing this. I think I finally found my path!",
      choices: [
        {
          id: "commit",
          text: "이 길을 계속 가보자",
          textEn: "Let's keep going on this path",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "plan",
          text: "구체적인 계획을 세워보자",
          textEn: "Let's make a concrete plan",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 내 삶의 의미를 찾았어. 이제 매일이 설레고 기대돼!",
      contentEn: "Thanks to you, I found meaning in my life. Now every day is exciting and anticipated!",
      choices: []
    }
  ],

  'mission-2021-meaning-passion': [
    {
      id: "hook",
      beatType: "hook",
      content: "열정이 식어버린 것 같아... 예전에는 뭐든 재밌게 했는데.",
      contentEn: "My passion seems to have cooled down... I used to enjoy everything.",
      choices: [
        {
          id: "remember",
          text: "처음의 마음을 떠올려보자",
          textEn: "Let's remember the initial feeling",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "new",
          text: "새로운 열정을 찾아보자",
          textEn: "Let's find new passion",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "그래, 처음 시작했을 때가 생각나... 그때는 정말 즐거웠는데.",
      contentEn: "Yeah, I remember when I first started... It was really fun back then.",
      choices: [
        {
          id: "restart",
          text: "초심으로 돌아가보자",
          textEn: "Let's go back to basics",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "refresh",
          text: "새로운 방식으로 접근해보자",
          textEn: "Let's approach in a new way",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "와, 다시 불타오르는 느낌이야! 이 감정, 너무 오랜만이야!",
      contentEn: "Wow, I feel the fire burning again! This feeling, it's been so long!",
      choices: [
        {
          id: "maintain",
          text: "이 열정을 계속 유지하자",
          textEn: "Let's keep this passion going",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "share",
          text: "다른 사람들에게도 영감을 주자",
          textEn: "Let's inspire others too",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너랑 함께 다시 열정을 찾았어. 이제 뭐든 할 수 있을 것 같아!",
      contentEn: "I found my passion again with you. Now I feel like I can do anything!",
      choices: []
    }
  ],

  'mission-2021-meaning-contribution': [
    {
      id: "hook",
      beatType: "hook",
      content: "내가 세상에 무슨 도움이 되는 걸까... 그냥 살아가는 것만으로는 부족한 것 같아.",
      contentEn: "What help am I to the world... Just living doesn't seem enough.",
      choices: [
        {
          id: "small",
          text: "작은 것부터 시작해보자",
          textEn: "Let's start with small things",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "talent",
          text: "내 재능을 나눠보자",
          textEn: "Let's share your talents",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 거창한 게 아니어도 돼. 내가 할 수 있는 것부터 해보자.",
      contentEn: "Right, it doesn't have to be grand. Let's start with what you can do.",
      choices: [
        {
          id: "volunteer",
          text: "봉사 활동을 시작해보자",
          textEn: "Let's start volunteering",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "mentor",
          text: "누군가를 도와주자",
          textEn: "Let's help someone",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "누군가에게 도움이 되는 게 이렇게 뿌듯한 거였구나... 이게 내가 찾던 의미야!",
      contentEn: "Being helpful to someone is this rewarding... This is the meaning I was looking for!",
      choices: [
        {
          id: "continue",
          text: "계속 이런 활동을 하자",
          textEn: "Let's keep doing this",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "expand",
          text: "더 많은 사람을 도와주자",
          textEn: "Let's help more people",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 내 삶의 의미를 찾았어. 누군가에게 도움이 되는 삶, 정말 아름다워!",
      contentEn: "Thanks to you, I found meaning in my life. A life that helps others is truly beautiful!",
      choices: []
    }
  ],

  // ===== 2023년 정체성 혼란 브랜치 미션 =====
  'mission-2023-identity-self': [
    {
      id: "hook",
      beatType: "hook",
      content: "나는 누구일까... 다른 사람들이 원하는 모습으로만 살아온 것 같아.",
      contentEn: "Who am I... I feel like I've only lived as others wanted me to be.",
      choices: [
        {
          id: "explore",
          text: "진짜 나를 찾아보자",
          textEn: "Let's find the real you",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "express",
          text: "솔직하게 표현해보자",
          textEn: "Let's express honestly",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "의지", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "그래... 이제는 내가 원하는 대로 살아야 할 때인 것 같아. 용기를 내볼까?",
      contentEn: "Yeah... I think it's time to live as I want. Shall I be brave?",
      choices: [
        {
          id: "accept",
          text: "있는 그대로의 나를 받아들이자",
          textEn: "Let's accept yourself as you are",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "change",
          text: "원하는 모습으로 변화하자",
          textEn: "Let's change to what you want",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "이게 진짜 나구나... 이렇게 편안한 느낌은 처음이야!",
      contentEn: "This is the real me... This comfortable feeling is a first!",
      choices: [
        {
          id: "live",
          text: "이제 진짜 나로 살아가자",
          textEn: "Let's live as the real you now",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "inspire",
          text: "다른 사람들도 용기 내도록 돕자",
          textEn: "Let's help others be brave too",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 진짜 나를 찾았어. 이제 당당하게 살아갈 수 있을 것 같아!",
      contentEn: "Thanks to you, I found the real me. Now I can live confidently!",
      choices: []
    }
  ],

  'mission-2023-identity-authentic': [
    {
      id: "hook",
      beatType: "hook",
      content: "SNS에서의 나와 실제 나가 너무 달라... 어느 게 진짜일까?",
      contentEn: "The me on SNS and the real me are so different... Which one is real?",
      choices: [
        {
          id: "honest",
          text: "솔직한 모습을 보여주자",
          textEn: "Let's show honest self",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "balance",
          text: "균형을 찾아보자",
          textEn: "Let's find balance",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "안정", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 완벽한 척하는 게 지쳤어. 진짜 내 모습을 보여줘도 괜찮을까?",
      contentEn: "Right, I'm tired of pretending to be perfect. Is it okay to show my real self?",
      choices: [
        {
          id: "vulnerable",
          text: "약한 모습도 보여주자",
          textEn: "Let's show vulnerable side too",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "real",
          text: "진짜 일상을 공유하자",
          textEn: "Let's share real daily life",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "사람들이 오히려 더 좋아해줘! 진정성이 통하는구나.",
      contentEn: "People actually like it more! Authenticity works.",
      choices: [
        {
          id: "continue",
          text: "계속 솔직하게 살자",
          textEn: "Let's keep being honest",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "encourage",
          text: "다른 사람들도 격려하자",
          textEn: "Let's encourage others too",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "진정성 있게 사는 게 이렇게 자유로운 거였구나. 너 덕분에 깨달았어!",
      contentEn: "Living authentically is this freeing. I realized it thanks to you!",
      choices: []
    }
  ],

  'mission-2023-identity-values': [
    {
      id: "hook",
      beatType: "hook",
      content: "내 가치관이 뭔지 모르겠어... 그냥 남들 따라 살아온 것 같아.",
      contentEn: "I don't know what my values are... I feel like I just followed others.",
      choices: [
        {
          id: "reflect",
          text: "깊이 생각해보자",
          textEn: "Let's think deeply",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "explore",
          text: "다양한 가치관을 탐색해보자",
          textEn: "Let's explore various values",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "내게 정말 중요한 게 뭘까... 같이 찾아볼까?",
      contentEn: "What's really important to me... Shall we find out together?",
      choices: [
        {
          id: "list",
          text: "중요한 것들을 나열해보자",
          textEn: "Let's list important things",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "experience",
          text: "경험을 통해 알아보자",
          textEn: "Let's find out through experience",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "아, 이게 내가 진짜 중요하게 생각하는 거였구나! 이제 명확해졌어.",
      contentEn: "Ah, this is what I truly value! It's clear now.",
      choices: [
        {
          id: "live",
          text: "이 가치관대로 살아가자",
          textEn: "Let's live by these values",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "share",
          text: "내 가치관을 나누자",
          textEn: "Let's share my values",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 내 가치관을 찾았어. 이제 흔들리지 않고 살아갈 수 있을 것 같아!",
      contentEn: "Thanks to you, I found my values. Now I can live without wavering!",
      choices: []
    }
  ],

  // ===== 2025년 미래 불안 브랜치 미션 =====
  'mission-2025-future-hope': [
    {
      id: "hook",
      beatType: "hook",
      content: "미래가 너무 불안해... 이대로 괜찮을까?",
      contentEn: "The future is so uncertain... Will it be okay like this?",
      choices: [
        {
          id: "plan",
          text: "구체적인 계획을 세워보자",
          textEn: "Let's make concrete plans",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "positive",
          text: "긍정적으로 생각해보자",
          textEn: "Let's think positively",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "그래, 막연한 불안보다는 준비하는 게 낫지. 뭐부터 시작할까?",
      contentEn: "Right, preparing is better than vague anxiety. Where should we start?",
      choices: [
        {
          id: "skills",
          text: "필요한 능력을 키우자",
          textEn: "Let's develop necessary skills",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "network",
          text: "좋은 관계를 만들자",
          textEn: "Let's build good relationships",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "기쁨", weight: 1 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "하나씩 준비하다 보니 불안이 줄어들어! 미래가 기대되기 시작했어.",
      contentEn: "As I prepare step by step, anxiety decreases! I'm starting to look forward to the future.",
      choices: [
        {
          id: "continue",
          text: "계속 준비해나가자",
          textEn: "Let's keep preparing",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "help",
          text: "다른 사람들도 도와주자",
          textEn: "Let's help others too",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "기쁨", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 미래에 대한 희망을 찾았어. 이제 두렵지 않아!",
      contentEn: "Thanks to you, I found hope for the future. I'm not afraid anymore!",
      choices: []
    }
  ],

  'mission-2025-future-resilience': [
    {
      id: "hook",
      beatType: "hook",
      content: "변화가 너무 빨라... 적응하기 힘들어.",
      contentEn: "Changes are too fast... It's hard to adapt.",
      choices: [
        {
          id: "flexible",
          text: "유연하게 대응하는 법을 배우자",
          textEn: "Let's learn to respond flexibly",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "안정", weight: 2 }
        },
        {
          id: "core",
          text: "변하지 않는 핵심을 지키자",
          textEn: "Let's keep unchanging core",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "의지", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 변화를 두려워하지 말고 받아들여야겠어. 어떻게 시작할까?",
      contentEn: "Right, I shouldn't fear change but accept it. How should we start?",
      choices: [
        {
          id: "learn",
          text: "새로운 것을 배우자",
          textEn: "Let's learn new things",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "설렘", weight: 2 }
        },
        {
          id: "mindset",
          text: "마인드셋을 바꾸자",
          textEn: "Let's change mindset",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "변화가 두렵지 않아졌어! 오히려 새로운 기회로 보이기 시작했어.",
      contentEn: "I'm not afraid of change anymore! It's starting to look like new opportunities.",
      choices: [
        {
          id: "embrace",
          text: "변화를 적극적으로 받아들이자",
          textEn: "Let's actively embrace change",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "lead",
          text: "변화를 주도하자",
          textEn: "Let's lead the change",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너 덕분에 회복탄력성을 키웠어. 이제 어떤 변화도 두렵지 않아!",
      contentEn: "Thanks to you, I built resilience. Now I'm not afraid of any change!",
      choices: []
    }
  ],

  'mission-2025-future-sustainability': [
    {
      id: "hook",
      beatType: "hook",
      content: "지구의 미래가 걱정돼... 우리가 뭘 할 수 있을까?",
      contentEn: "I'm worried about Earth's future... What can we do?",
      choices: [
        {
          id: "action",
          text: "작은 실천부터 시작하자",
          textEn: "Let's start with small actions",
          nextSceneId: "engage",
          affinityBonus: 15,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "awareness",
          text: "사람들의 인식을 바꾸자",
          textEn: "Let's change people's awareness",
          nextSceneId: "engage",
          affinityBonus: 12,
          emotionImpact: { type: "설렘", weight: 1 }
        }
      ]
    },
    {
      id: "engage",
      beatType: "engage",
      content: "맞아, 한 사람 한 사람의 노력이 모이면 큰 변화를 만들 수 있어. 뭐부터 할까?",
      contentEn: "Right, individual efforts can create big changes. What should we do first?",
      choices: [
        {
          id: "lifestyle",
          text: "친환경 생활을 실천하자",
          textEn: "Let's practice eco-friendly lifestyle",
          nextSceneId: "climax",
          affinityBonus: 20,
          emotionImpact: { type: "의지", weight: 2 }
        },
        {
          id: "campaign",
          text: "캠페인을 시작하자",
          textEn: "Let's start a campaign",
          nextSceneId: "climax",
          affinityBonus: 18,
          emotionImpact: { type: "설렘", weight: 2 }
        }
      ]
    },
    {
      id: "climax",
      beatType: "climax",
      content: "우리의 작은 실천이 다른 사람들에게도 영감을 주고 있어! 변화가 시작됐어.",
      contentEn: "Our small actions are inspiring others too! Change has begun.",
      choices: [
        {
          id: "expand",
          text: "더 많은 사람들과 함께하자",
          textEn: "Let's do it with more people",
          nextSceneId: "wrap",
          affinityBonus: 25,
          emotionImpact: { type: "기쁨", weight: 2 }
        },
        {
          id: "deepen",
          text: "더 깊이 있게 실천하자",
          textEn: "Let's practice more deeply",
          nextSceneId: "wrap",
          affinityBonus: 22,
          emotionImpact: { type: "의지", weight: 2 }
        }
      ]
    },
    {
      id: "wrap",
      beatType: "wrap",
      content: "너와 함께 지속 가능한 미래를 만들어가고 있어. 희망이 보여!",
      contentEn: "We're creating a sustainable future together. I see hope!",
      choices: []
    }
  ]
};

/**
 * 미션 ID로 Scene 목록 가져오기
 */
export function getScenesByMissionId(missionId: string): Scene[] {
  return MISSION_SCENES[missionId] || [];
}

/**
 * Scene ID로 특정 Scene 가져오기
 */
export function getSceneById(missionId: string, sceneId: string): Scene | undefined {
  const scenes = getScenesByMissionId(missionId);
  return scenes.find(scene => scene.id === sceneId);
}
