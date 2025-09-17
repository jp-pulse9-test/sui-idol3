import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: Array<{
    text: string;
    value: string;
    emoji: string;
  }>;
}

const questions: Question[] = [
  {
    id: 1,
    question: "선호하는 헤어스타일은?",
    options: [
      { text: "깔끔한 단발", value: "short", emoji: "✂️" },
      { text: "부드러운 웨이브", value: "wave", emoji: "🌊" },
      { text: "시크한 장발", value: "long", emoji: "💫" },
      { text: "독특한 컬러", value: "colorful", emoji: "🎨" }
    ]
  },
  {
    id: 2,
    question: "매력적인 눈매는?",
    options: [
      { text: "큰 동그란 눈", value: "round", emoji: "👀" },
      { text: "날카로운 눈매", value: "sharp", emoji: "⚡" },
      { text: "웃는 눈", value: "smiling", emoji: "😊" },
      { text: "신비로운 눈매", value: "mysterious", emoji: "🌙" }
    ]
  },
  {
    id: 3,
    question: "선호하는 체형은?",
    options: [
      { text: "슬림한 체형", value: "slim", emoji: "🎋" },
      { text: "탄탄한 근육질", value: "athletic", emoji: "💪" },
      { text: "부드러운 곡선", value: "soft", emoji: "🌸" },
      { text: "키가 큰 편", value: "tall", emoji: "🗼" }
    ]
  },
  {
    id: 4,
    question: "선호하는 스타일은?",
    options: [
      { text: "깔끔한 정장", value: "formal", emoji: "🤵" },
      { text: "캐주얼 편안함", value: "casual", emoji: "👕" },
      { text: "힙한 스트릿", value: "street", emoji: "🧢" },
      { text: "로맨틱 플로럴", value: "romantic", emoji: "🌺" }
    ]
  },
  {
    id: 5,
    question: "매력적인 표정은?",
    options: [
      { text: "밝은 미소", value: "bright", emoji: "😄" },
      { text: "섹시한 윙크", value: "wink", emoji: "😉" },
      { text: "차분한 미소", value: "calm", emoji: "😌" },
      { text: "장난스러운 표정", value: "playful", emoji: "😋" }
    ]
  }
];

export const AppearanceTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 외모 취향 분석 완료
      const appearanceProfile = calculateAppearanceProfile(newAnswers);
      localStorage.setItem('appearanceProfile', JSON.stringify(appearanceProfile));
      toast.success("외모 취향 분석이 완료되었습니다!");
      navigate('/result-analysis');
    }
  };

  const calculateAppearanceProfile = (answers: string[]) => {
    // 외모 취향 분석 로직
    const profile = {
      hair: answers[0],
      eyes: answers[1], 
      body: answers[2],
      style: answers[3],
      expression: answers[4],
      type: determineAppearanceType(answers)
    };
    return profile;
  };

  const determineAppearanceType = (answers: string[]) => {
    // 답변 조합으로 외모 취향 타입 결정
    const typeMap: { [key: string]: string } = {
      "cute": "귀여운 타입",
      "sexy": "섹시한 타입", 
      "charismatic": "카리스마 타입",
      "natural": "자연스러운 타입"
    };

    // 간단한 분류 로직 (실제로는 더 복잡한 알고리즘 사용)
    if (answers.includes("round") && answers.includes("bright")) {
      return typeMap.cute;
    } else if (answers.includes("sharp") && answers.includes("wink")) {
      return typeMap.sexy;
    } else if (answers.includes("athletic") && answers.includes("formal")) {
      return typeMap.charismatic;
    } else {
      return typeMap.natural;
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">2. 외형 성향 분석</h1>
          <p className="text-muted-foreground">
            질문 {currentQuestion + 1} / {questions.length}
          </p>
          <Progress value={progress} className="w-full" />
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
                  onClick={() => handleAnswer(option.value)}
                  variant="outline"
                  size="lg"
                  className="h-auto p-6 text-left flex items-center gap-4 hover:bg-primary/10"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-lg">{option.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => navigate('/mbti')}
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

export default AppearanceTest;