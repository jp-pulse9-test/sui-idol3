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
    question: "새로운 사람들과 만날 때 당신은?",
    options: [
      { text: "적극적으로 말을 걸고 친해지려고 한다", type: 'E' },
      { text: "먼저 상대방을 관찰하고 조심스럽게 접근한다", type: 'I' }
    ]
  },
  {
    id: 2,
    question: "정보를 받아들일 때 당신은?",
    options: [
      { text: "구체적이고 현실적인 정보를 선호한다", type: 'S' },
      { text: "가능성과 잠재력에 더 관심이 있다", type: 'N' }
    ]
  },
  {
    id: 3,
    question: "결정을 내릴 때 당신은?",
    options: [
      { text: "논리적이고 객관적인 분석을 중시한다", type: 'T' },
      { text: "사람들의 감정과 가치를 우선 고려한다", type: 'F' }
    ]
  },
  {
    id: 4,
    question: "일상생활에서 당신은?",
    options: [
      { text: "계획을 세우고 체계적으로 진행한다", type: 'J' },
      { text: "상황에 따라 유연하게 적응한다", type: 'P' }
    ]
  },
  {
    id: 5,
    question: "스트레스를 받을 때 당신은?",
    options: [
      { text: "사람들과 함께 있으면서 해소한다", type: 'E' },
      { text: "혼자만의 시간을 가지며 해소한다", type: 'I' }
    ]
  },
  {
    id: 6,
    question: "학습할 때 당신은?",
    options: [
      { text: "단계적이고 체계적인 방법을 선호한다", type: 'S' },
      { text: "전체적인 흐름과 개념을 먼저 파악한다", type: 'N' }
    ]
  },
  {
    id: 7,
    question: "갈등 상황에서 당신은?",
    options: [
      { text: "사실과 논리를 바탕으로 해결한다", type: 'T' },
      { text: "관계와 감정을 고려하여 해결한다", type: 'F' }
    ]
  },
  {
    id: 8,
    question: "여행을 갈 때 당신은?",
    options: [
      { text: "미리 상세한 계획을 세운다", type: 'J' },
      { text: "그때그때 상황에 맞춰 결정한다", type: 'P' }
    ]
  }
];

export const MBTITest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
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

      toast.success(`당신의 MBTI는 ${mbtiResult}입니다!`);
      localStorage.setItem('mbtiResult', mbtiResult);
      navigate('/worldcup');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">MBTI 성격 테스트</h1>
          <p className="text-muted-foreground">나만의 이상형을 찾기 위한 첫 단계</p>
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </p>
        </div>

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