import { useState } from "react";
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
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "아이돌의 어떤 모습에 가장 반하나요?",
    options: [
      { text: "무대 위에서 팬들과 소통하며 밝게 웃는 모습", type: 'E' },
      { text: "혼자 조용히 연습하거나 생각에 잠긴 모습", type: 'I' }
    ]
  },
  {
    id: 2,
    question: "아이돌의 매력을 어떻게 발견하나요?",
    options: [
      { text: "실제 무대나 방송에서 보이는 확실한 실력과 비주얼", type: 'S' },
      { text: "숨겨진 재능이나 앞으로의 가능성을 상상하며", type: 'N' }
    ]
  },
  {
    id: 3,
    question: "아이돌을 좋아하게 되는 결정적 순간은?",
    options: [
      { text: "완벽한 실력과 프로다운 모습을 보았을 때", type: 'T' },
      { text: "진심 어린 감정 표현이나 인간적인 모습을 보았을 때", type: 'F' }
    ]
  },
  {
    id: 4,
    question: "덕질 스타일은?",
    options: [
      { text: "콘서트 날짜 체크, 굿즈 구매 등 계획적으로 덕질", type: 'J' },
      { text: "그때그때 기분에 따라 자유롭게 덕질", type: 'P' }
    ]
  },
  {
    id: 5,
    question: "아이돌이 힘들어 보일 때 어떻게 하고 싶나요?",
    options: [
      { text: "팬미팅이나 콘서트에서 큰 소리로 응원하며 힘을 주고 싶다", type: 'E' },
      { text: "마음속으로 조용히 응원하며 지켜보고 싶다", type: 'I' }
    ]
  },
  {
    id: 6,
    question: "아이돌의 어떤 콘텐츠를 선호하나요?",
    options: [
      { text: "정해진 포맷의 예능이나 음악방송 같은 안정적인 콘텐츠", type: 'S' },
      { text: "예상치 못한 라이브나 즉흥적인 브이로그 같은 새로운 콘텐츠", type: 'N' }
    ]
  },
  {
    id: 7,
    question: "아이돌과 관련된 논란이 있을 때?",
    options: [
      { text: "팩트를 확인하고 객관적으로 판단한다", type: 'T' },
      { text: "아이돌의 마음과 상황을 먼저 헤아려본다", type: 'F' }
    ]
  },
  {
    id: 8,
    question: "입덕 후 팬 활동은?",
    options: [
      { text: "팬클럽 가입, 정기 구독 등 체계적으로 활동", type: 'J' },
      { text: "그때그때 하고 싶은 활동만 자유롭게", type: 'P' }
    ]
  }
];

export const MBTITest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<'boy' | 'girl' | null>(null);
  const navigate = useNavigate();

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

      toast.success(`당신의 입덕 타입은 ${mbtiResult}입니다!`);
      localStorage.setItem('mbtiResult', mbtiResult);
      navigate('/appearance');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">아이돌 입덕 성향 분석</h1>
          <p className="text-muted-foreground">당신이 반하는 아이돌 모먼트를 찾아보세요</p>
          
          {!selectedGender ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">당신의 이상형을 선택하세요</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className="p-8 bg-card/80 backdrop-blur-sm border-border cursor-pointer hover:border-primary/50 transition-all duration-300 card-hover"
                  onClick={() => setSelectedGender('boy')}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">👨‍🎤</div>
                    <h3 className="text-xl font-bold">당신의 소년 고르기</h3>
                    <p className="text-muted-foreground">소년 아이돌 중에서 이상형 찾기</p>
                  </div>
                </Card>
                
                <Card 
                  className="p-8 bg-card/80 backdrop-blur-sm border-border cursor-pointer hover:border-primary/50 transition-all duration-300 card-hover"
                  onClick={() => setSelectedGender('girl')}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">👩‍🎤</div>
                    <h3 className="text-xl font-bold">당신의 소녀 고르기</h3>
                    <p className="text-muted-foreground">소녀 아이돌 중에서 이상형 찾기</p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <>
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </p>
            </>
          )}
        </div>

        {selectedGender && (
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-8">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option.type)}
                    variant="outline"
                    size="lg"
                    className="w-full p-6 text-left justify-start hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MBTITest;