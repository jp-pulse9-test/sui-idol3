import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
    emoji: string;
  }[];
}

const getWorldQuestions = (): Question[] => [
  {
    id: 1,
    question: "당신이 가장 끌리는 세계관은?",
    options: [
      { text: "청춘과 꿈이 넘치는 학원", value: "academy", emoji: "🏫" },
      { text: "신비로운 수인들의 세계", value: "beast", emoji: "🐺" },
      { text: "종말 이후의 미래 세계", value: "apocalypse", emoji: "⚡" },
      { text: "마법과 모험의 판타지", value: "fantasy", emoji: "🔮" },
      { text: "궁중의 예의와 전통", value: "historical", emoji: "👑" },
      { text: "운명을 바꾸는 시간 여행", value: "regression", emoji: "⏰" }
    ]
  },
  {
    id: 2,
    question: "어떤 스토리에 더 관심이 있나요?",
    options: [
      { text: "친구들과 함께하는 성장기", value: "academy", emoji: "👫" },
      { text: "서로 다른 종족들의 우정", value: "beast", emoji: "🤝" },
      { text: "절망 속에서 피어나는 희망", value: "apocalypse", emoji: "🌅" },
      { text: "신비한 힘을 깨우는 모험", value: "fantasy", emoji: "✨" },
      { text: "전통과 현대의 조화", value: "historical", emoji: "🎭" },
      { text: "과거를 바꿔 미래를 구하기", value: "regression", emoji: "🔄" }
    ]
  },
  {
    id: 3,
    question: "당신의 아이돌이 가져야 할 특별함은?",
    options: [
      { text: "열정적인 도전 정신", value: "academy", emoji: "💪" },
      { text: "독특하고 개성적인 매력", value: "beast", emoji: "🌟" },
      { text: "강인한 생존력과 의지", value: "apocalypse", emoji: "🛡️" },
      { text: "신비롭고 환상적인 능력", value: "fantasy", emoji: "🪄" },
      { text: "우아하고 품격 있는 매너", value: "historical", emoji: "💎" },
      { text: "과거 경험으로 얻은 지혜", value: "regression", emoji: "🧠" }
    ]
  },
  {
    id: 4,
    question: "가장 매력적인 배경 설정은?",
    options: [
      { text: "경쟁과 우정이 공존하는 학원", value: "academy", emoji: "🎓" },
      { text: "자연과 문명이 어우러진 세계", value: "beast", emoji: "🌲" },
      { text: "폐허 속에서 재건되는 도시", value: "apocalypse", emoji: "🏙️" },
      { text: "마법이 일상인 신비로운 왕국", value: "fantasy", emoji: "🏰" },
      { text: "전통 문화가 살아있는 궁궐", value: "historical", emoji: "🏯" },
      { text: "과거와 현재가 교차하는 공간", value: "regression", emoji: "🌌" }
    ]
  },
  {
    id: 5,
    question: "당신이 선호하는 스토리 분위기는?",
    options: [
      { text: "밝고 활기찬 청춘물", value: "academy", emoji: "☀️" },
      { text: "몽환적이고 신비로운", value: "beast", emoji: "🌙" },
      { text: "긴장감 넘치는 서바이벌", value: "apocalypse", emoji: "🔥" },
      { text: "웅장하고 모험적인", value: "fantasy", emoji: "⚔️" },
      { text: "우아하고 고급스러운", value: "historical", emoji: "🎨" },
      { text: "운명적이고 감동적인", value: "regression", emoji: "💫" }
    ]
  }
];

const WorldSelectEnhanced = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions] = useState(getWorldQuestions());

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    const selectedGender = localStorage.getItem('selectedGender');
    
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
  }, [navigate]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 답변 완료 - 세계관 결정
      const worldCounts = {
        academy: 0,
        beast: 0,
        apocalypse: 0,
        fantasy: 0,
        historical: 0,
        regression: 0
      };

      newAnswers.forEach(answer => {
        worldCounts[answer as keyof typeof worldCounts]++;
      });

      // 가장 많이 선택된 세계관 결정
      const selectedWorld = Object.entries(worldCounts).reduce((a, b) => 
        worldCounts[a[0] as keyof typeof worldCounts] > worldCounts[b[0] as keyof typeof worldCounts] ? a : b
      )[0];

      const worldNames = {
        academy: '학원물',
        beast: '수인물',
        apocalypse: '아포칼립스물',
        fantasy: '판타지물',
        historical: '역사물',
        regression: '회귀물'
      };

      localStorage.setItem('selectedWorld', selectedWorld);
      toast.success(`${worldNames[selectedWorld as keyof typeof worldNames]} 세계관이 선택되었습니다!`);
      
      setTimeout(() => {
        navigate('/mbti');
      }, 1500);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            세계관 선택
          </h1>
          <p className="text-xl text-muted-foreground">
            당신에게 맞는 아이돌 세계관을 찾아보세요
          </p>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </p>
          </div>
        </div>

        {/* Question */}
        <Card className="p-8 glass-dark border-white/10">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center gradient-text">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  variant="outline"
                  size="lg"
                  className="h-auto p-6 text-left justify-start glass-dark border-white/10 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="text-3xl">{option.emoji}</div>
                    <div className="flex-1">
                      <span className="text-lg">{option.text}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            이전 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldSelectEnhanced;