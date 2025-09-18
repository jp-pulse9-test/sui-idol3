import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
    emoji: string;
  }[];
}

const getMaleQuestions = (world: string): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: 1,
      question: "아이돌의 어떤 모습에 가장 반하나요?",
      options: [
        { text: "무대 위에서 팬들과 소통하며 밝게 웃는 모습", type: 'E', emoji: "🎤" },
        { text: "혼자 조용히 연습하거나 생각에 잠긴 모습", type: 'I', emoji: "🎯" }
      ]
    },
    {
      id: 2,
      question: "소년 아이돌의 매력을 어떻게 발견하나요?",
      options: [
        { text: "실제 무대나 방송에서 보이는 확실한 실력과 비주얼", type: 'S', emoji: "⭐" },
        { text: "숨겨진 재능이나 앞으로의 가능성을 상상하며", type: 'N', emoji: "✨" }
      ]
    },
    {
      id: 3,
      question: "소년 아이돌을 좋아하게 되는 결정적 순간은?",
      options: [
        { text: "완벽한 퍼포먼스와 프로다운 모습을 보았을 때", type: 'T', emoji: "🏆" },
        { text: "진심 어린 감정 표현이나 팬을 향한 진실한 마음을 보았을 때", type: 'F', emoji: "💖" }
      ]
    },
    {
      id: 4,
      question: "덕질 스타일은?",
      options: [
        { text: "콘서트 날짜 체크, 굿즈 구매 등 계획적으로 덕질", type: 'J', emoji: "📅" },
        { text: "그때그때 기분에 따라 자유롭게 덕질", type: 'P', emoji: "🎲" }
      ]
    },
    {
      id: 5,
      question: "소년 아이돌이 힘들어 보일 때 어떻게 하고 싶나요?",
      options: [
        { text: "팬미팅이나 콘서트에서 큰 소리로 응원하며 힘을 주고 싶다", type: 'E', emoji: "📢" },
        { text: "마음속으로 조용히 응원하며 지켜보고 싶다", type: 'I', emoji: "🤍" }
      ]
    },
    {
      id: 6,
      question: "소년 아이돌의 어떤 콘텐츠를 선호하나요?",
      options: [
        { text: "정해진 포맷의 예능이나 음악방송 같은 안정적인 콘텐츠", type: 'S', emoji: "📺" },
        { text: "예상치 못한 라이브나 즉흥적인 브이로그 같은 새로운 콘텐츠", type: 'N', emoji: "🎬" }
      ]
    },
    {
      id: 7,
      question: "소년 아이돌과 관련된 논란이 있을 때?",
      options: [
        { text: "팩트를 확인하고 객관적으로 판단한다", type: 'T', emoji: "🔍" },
        { text: "아이돌의 마음과 상황을 먼저 헤아려본다", type: 'F', emoji: "💭" }
      ]
    },
    {
      id: 8,
      question: "입덕 후 팬 활동은?",
      options: [
        { text: "팬클럽 가입, 정기 구독 등 체계적으로 활동", type: 'J', emoji: "📋" },
        { text: "그때그때 하고 싶은 활동만 자유롭게", type: 'P', emoji: "🌈" }
      ]
    },
    {
      id: 9,
      question: "소년 아이돌의 리더십을 어떻게 평가하나요?",
      options: [
        { text: "팬들과 적극적으로 소통하고 이끄는 모습", type: 'E', emoji: "👑" },
        { text: "조용히 뒤에서 멤버들을 챙기는 든든한 모습", type: 'I', emoji: "🛡️" }
      ]
    },
    {
      id: 10,
      question: "소년 아이돌의 성장 과정에서 주목하는 부분은?",
      options: [
        { text: "눈에 보이는 실력 향상과 구체적인 성과", type: 'S', emoji: "📈" },
        { text: "내면의 성숙함과 예술적 표현력의 발전", type: 'N', emoji: "🎨" }
      ]
    },
    {
      id: 11,
      question: "소년 아이돌 그룹의 팀워크를 평가할 때?",
      options: [
        { text: "완벽한 호흡과 프로페셔널한 협업", type: 'T', emoji: "⚙️" },
        { text: "서로를 아끼고 배려하는 따뜻한 관계", type: 'F', emoji: "🤝" }
      ]
    }
  ];

  // 세계관별 추가 질문 수정
  if (world === 'academy') {
    baseQuestions[8].question = "학원 생활에서 소년 아이돌의 어떤 모습에 끌리나요?";
    baseQuestions[8].options = [
      { text: "학생회장이나 반장으로 활발하게 활동하는 모습", type: 'E', emoji: "🏫" },
      { text: "도서관에서 혼자 공부하며 노력하는 모습", type: 'I', emoji: "📚" }
    ];
  }

  return baseQuestions;
};

const getFemaleQuestions = (world: string): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: 1,
      question: "소녀 아이돌의 어떤 모습에 가장 반하나요?",
      options: [
        { text: "무대 위에서 팬들과 소통하며 밝게 웃는 모습", type: 'E', emoji: "🌟" },
        { text: "혼자 조용히 연습하거나 생각에 잠긴 모습", type: 'I', emoji: "🌙" }
      ]
    },
    {
      id: 2,
      question: "소녀 아이돌의 매력을 어떻게 발견하나요?",
      options: [
        { text: "실제 무대나 방송에서 보이는 확실한 실력과 미모", type: 'S', emoji: "💎" },
        { text: "숨겨진 재능이나 앞으로의 가능성을 상상하며", type: 'N', emoji: "🦋" }
      ]
    },
    {
      id: 3,
      question: "소녀 아이돌을 좋아하게 되는 결정적 순간은?",
      options: [
        { text: "완벽한 퍼포먼스와 프로다운 모습을 보았을 때", type: 'T', emoji: "👑" },
        { text: "진심 어린 감정 표현이나 사랑스러운 모습을 보았을 때", type: 'F', emoji: "💕" }
      ]
    },
    {
      id: 4,
      question: "덕질 스타일은?",
      options: [
        { text: "콘서트 날짜 체크, 굿즈 구매 등 계획적으로 덕질", type: 'J', emoji: "📝" },
        { text: "그때그때 기분에 따라 자유롭게 덕질", type: 'P', emoji: "🎀" }
      ]
    },
    {
      id: 5,
      question: "소녀 아이돌이 힘들어 보일 때 어떻게 하고 싶나요?",
      options: [
        { text: "팬미팅이나 콘서트에서 큰 소리로 응원하며 힘을 주고 싶다", type: 'E', emoji: "🎊" },
        { text: "마음속으로 조용히 응원하며 지켜보고 싶다", type: 'I', emoji: "🌸" }
      ]
    },
    {
      id: 6,
      question: "소녀 아이돌의 어떤 콘텐츠를 선호하나요?",
      options: [
        { text: "정해진 포맷의 예능이나 음악방송 같은 안정적인 콘텐츠", type: 'S', emoji: "📽️" },
        { text: "예상치 못한 라이브나 즉흥적인 브이로그 같은 새로운 콘텐츠", type: 'N', emoji: "🎪" }
      ]
    },
    {
      id: 7,
      question: "소녀 아이돌과 관련된 논란이 있을 때?",
      options: [
        { text: "팩트를 확인하고 객관적으로 판단한다", type: 'T', emoji: "🔎" },
        { text: "아이돌의 마음과 상황을 먼저 헤아려본다", type: 'F', emoji: "🌷" }
      ]
    },
    {
      id: 8,
      question: "입덕 후 팬 활동은?",
      options: [
        { text: "팬클럽 가입, 정기 구독 등 체계적으로 활동", type: 'J', emoji: "📋" },
        { text: "그때그때 하고 싶은 활동만 자유롭게", type: 'P', emoji: "🌈" }
      ]
    },
    {
      id: 9,
      question: "소녀 아이돌의 매력 포인트는?",
      options: [
        { text: "활발하고 에너지 넘치는 밝은 매력", type: 'E', emoji: "☀️" },
        { text: "조용하고 신비로운 우아한 매력", type: 'I', emoji: "✨" }
      ]
    },
    {
      id: 10,
      question: "소녀 아이돌의 성장 과정에서 주목하는 부분은?",
      options: [
        { text: "눈에 보이는 실력 향상과 구체적인 성과", type: 'S', emoji: "📊" },
        { text: "내면의 성숙함과 예술적 표현력의 발전", type: 'N', emoji: "🎭" }
      ]
    },
    {
      id: 11,
      question: "소녀 아이돌 그룹의 팀워크를 평가할 때?",
      options: [
        { text: "완벽한 호흡과 프로페셔널한 협업", type: 'T', emoji: "⚙️" },
        { text: "서로를 아끼고 배려하는 따뜻한 관계", type: 'F', emoji: "💖" }
      ]
    }
  ];

  // 세계관별 추가 질문 수정
  if (world === 'academy') {
    baseQuestions[8].question = "학원 생활에서 소녀 아이돌의 어떤 모습에 끌리나요?";
    baseQuestions[8].options = [
      { text: "학생회장이나 반장으로 활발하게 활동하는 모습", type: 'E', emoji: "🎓" },
      { text: "도서관에서 혼자 공부하며 노력하는 모습", type: 'I', emoji: "📖" }
    ];
  }

  return baseQuestions;
};

export const MBTITestEnhanced = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    const selectedGender = localStorage.getItem('selectedGender');
    const selectedWorld = localStorage.getItem('selectedWorld');
    
    if (!walletAddress) {
      toast.error("먼저 지갑을 연결해주세요!");
      navigate('/');
      return;
    }
    
    if (!selectedGender) {
      toast.error("먼저 성별을 선택해주세요!");
      navigate('/pick');
      return;
    }
    
    if (!selectedWorld) {
      toast.error("먼저 세계관을 선택해주세요!");
      navigate('/world-select');
      return;
    }

    // 성별과 세계관에 따른 질문 설정
    const questionsToUse = selectedGender === 'male' 
      ? getMaleQuestions(selectedWorld) 
      : getFemaleQuestions(selectedWorld);
    setQuestions(questionsToUse);
  }, [navigate]);

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate MBTI result
      const types = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      newAnswers.forEach(answer => {
        types[answer as keyof typeof types]++;
      });

      const mbtiResult = 
        (types.E > types.I ? 'E' : 'I') +
        (types.S > types.N ? 'S' : 'N') +
        (types.T > types.F ? 'T' : 'F') +
        (types.J > types.P ? 'J' : 'P');

      // 성격 프로필 생성 (세계관 반영)
      const personalityProfile = {
        type: mbtiResult,
        traits: generateTraits(mbtiResult),
        description: generateDescription(mbtiResult)
      };

      // 결과 저장
      localStorage.setItem('mbtiResult', mbtiResult);
      localStorage.setItem('personalityProfile', JSON.stringify(personalityProfile));
      toast.success(`당신의 입덕 타입은 ${mbtiResult}입니다!`);
      navigate('/appearance');
    }
  };

  const generateTraits = (mbti: string) => {
    const selectedGender = localStorage.getItem('selectedGender');
    const selectedWorld = localStorage.getItem('selectedWorld');
    
    const baseTraits: { [key: string]: string[] } = {
      'ENFJ': ['감정 공감형', '리더십 추구', '사교적'],
      'ENFP': ['자유영혼', '창의적', '낙천적'],
      'ENTJ': ['천상계획자', '카리스마', '목표지향'],
      'ENTP': ['아이디어뱅크', '도전적', '혁신적'],
      'ESFJ': ['인싸담당', '배려심', '협조적'],
      'ESFP': ['분위기메이커', '즉흥적', '활발함'],
      'ESTJ': ['현실주의자', '책임감', '체계적'],
      'ESTP': ['모험가', '실용적', '적응력'],
      'INFJ': ['이상주의자', '직관적', '독립적'],
      'INFP': ['몽상가', '감성적', '개성적'],
      'INTJ': ['전략가', '완벽주의', '독창적'],
      'INTP': ['논리학자', '분석적', '호기심'],
      'ISFJ': ['수호자', '신중함', '헌신적'],
      'ISFP': ['예술가', '유연함', '평화로움'],
      'ISTJ': ['실무자', '신뢰성', '꼼꼼함'],
      'ISTP': ['만능재주꾼', '현실적', '차분함']
    };

    let traits = baseTraits[mbti] || ['독특한', '매력적', '특별한'];
    
    // 세계관별 특성 추가
    if (selectedWorld === 'academy') {
      traits.push('학원물 애호가');
    } else if (selectedWorld === 'beast') {
      traits.push('환상 세계 추구');
    } else if (selectedWorld === 'apocalypse') {
      traits.push('극한 상황 매력');
    }

    return traits;
  };

  const generateDescription = (mbti: string) => {
    const selectedGender = localStorage.getItem('selectedGender');
    const selectedWorld = localStorage.getItem('selectedWorld');
    
    const baseDescriptions: { [key: string]: string } = {
      'ENFJ': `외향적이고 감정이 풍부한 당신은 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌의 진심 어린 감정 표현에 깊이 공감합니다.`,
      'ENFP': `자유롭고 창의적인 당신은 예상치 못한 매력과 끝없는 가능성을 보여주는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 끌립니다.`,
      'ENTJ': `리더십이 강한 당신은 무대를 지배하는 카리스마 있는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 선호합니다.`,
      'ENTP': `혁신적인 당신은 새로운 시도와 독창적인 콘텐츠를 선보이는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 매력을 느낍니다.`,
      'ESFJ': `사교적이고 배려심 많은 당신은 팬들과의 소통을 중시하는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 좋아합니다.`,
      'ESFP': `활발하고 즉흥적인 당신은 밝고 에너지 넘치는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 끌립니다.`,
      'ESTJ': `현실적이고 체계적인 당신은 프로다운 실력과 완벽한 퍼포먼스를 보여주는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 선호합니다.`,
      'ESTP': `모험적이고 실용적인 당신은 다양한 매력과 적응력을 보여주는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 관심을 갖습니다.`,
      'INFJ': `이상주의적인 당신은 깊이 있는 감성과 진정성을 가진 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 끌립니다.`,
      'INFP': `감성적이고 개성적인 당신은 독특한 매력과 자신만의 색깔을 가진 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 좋아합니다.`,
      'INTJ': `전략적이고 완벽주의인 당신은 뛰어난 실력과 독창성을 겸비한 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 선호합니다.`,
      'INTP': `논리적이고 분석적인 당신은 실력이 뛰어나고 지적인 매력을 가진 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 끌립니다.`,
      'ISFJ': `신중하고 헌신적인 당신은 따뜻하고 인간적인 매력을 가진 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 좋아합니다.`,
      'ISFP': `예술적이고 평화로운 당신은 자연스럽고 순수한 매력을 가진 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 끌립니다.`,
      'ISTJ': `신뢰성 있고 꼼꼼한 당신은 안정적이고 일관된 매력을 보여주는 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌을 선호합니다.`,
      'ISTP': `실용적이고 차분한 당신은 실력이 뛰어나면서도 겸손한 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌에게 매력을 느낍니다.`
    };

    let description = baseDescriptions[mbti] || `당신은 독특하고 특별한 ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌 취향을 가지고 있습니다.`;
    
    // 세계관별 설명 추가
    if (selectedWorld === 'academy') {
      description += ' 특히 학원 생활의 청춘과 성장 스토리에 끌립니다.';
    } else if (selectedWorld === 'beast') {
      description += ' 환상적이고 신비로운 수인 세계관에 매료됩니다.';
    } else if (selectedWorld === 'apocalypse') {
      description += ' 극한 상황에서의 희망과 용기에 감동받습니다.';
    } else if (selectedWorld === 'fantasy') {
      description += ' 마법과 모험이 가득한 판타지 세계에 빠져듭니다.';
    }

    return description;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">1. 내면 성향 분석</h1>
          <p className="text-muted-foreground">당신이 반하는 아이돌 모먼트를 찾아보세요</p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            질문 {currentQuestion + 1} / {questions.length}
          </p>
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-border">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.type)}
                  variant="outline"
                  size="lg"
                  className="h-auto p-0 text-left justify-start hover:bg-primary/10 overflow-hidden"
                >
                  <div className="flex items-center gap-4 w-full p-6">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{option.emoji}</span>
                    </div>
                    <span className="text-lg flex-1">{option.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => navigate('/world-select')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            이전 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MBTITestEnhanced;