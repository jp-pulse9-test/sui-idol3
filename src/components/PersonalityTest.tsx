import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  id: number;
  text: string;
  answers: string[];
  scores: number[][]; // MBTI score mapping [E/I, N/S, F/T, J/P]
}

interface PersonalityTestProps {
  onComplete: (scores: { extroversion: number; intuition: number; feeling: number; judging: number }) => void;
  onSkip: () => void;
  onBack?: () => void; // Add optional onBack prop
}

const PersonalityTest = ({ onComplete, onSkip, onBack }: PersonalityTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('quick');

  // Simple 3-question test
  const quickQuestions: Question[] = [
    {
      id: 1,
      text: "새로운 사람을 만날 때 어떻게 행동하나요?",
      answers: ["적극적으로 먼저 다가간다", "상황에 따라 조심스럽게 접근한다"],
      scores: [[70, 0, 0, 0], [30, 0, 0, 0]]
    },
    {
      id: 2,
      text: "음악을 들을 때 무엇을 가장 중요하게 생각하나요?",
      answers: ["창의적이고 독특한 사운드", "고품질의 안정적인 멜로디"],
      scores: [[0, 70, 0, 0], [0, 30, 0, 0]]
    },
    {
      id: 3,
      text: "일정 관리는 어떤 방식을 선호하나요?",
      answers: ["체계적으로 계획해서 관리", "상황에 따라 유연하게 대응"],
      scores: [[0, 0, 0, 70], [0, 0, 0, 30]]
    }
  ];

  // One-click presets
  const oneClickPresets = [
    { name: "열정적인 리더", emoji: "🔥", scores: { extroversion: 80, intuition: 70, feeling: 60, judging: 75 } },
    { name: "창의적인 아티스트", emoji: "🎨", scores: { extroversion: 40, intuition: 85, feeling: 80, judging: 30 } },
    { name: "안정적인 매니저", emoji: "📋", scores: { extroversion: 60, intuition: 30, feeling: 40, judging: 85 } },
    { name: "자유로운 모험가", emoji: "🌟", scores: { extroversion: 75, intuition: 80, feeling: 70, judging: 25 } }
  ];

  const handleQuickAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < quickQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test completed, calculate scores
      const finalScores = { extroversion: 50, intuition: 50, feeling: 50, judging: 50 };
      
      quickQuestions.forEach((question, index) => {
        const selectedAnswer = newAnswers[index];
        const scores = question.scores[selectedAnswer];
        finalScores.extroversion += (scores[0] - 50);
        finalScores.intuition += (scores[1] - 50);
        finalScores.feeling += (scores[2] - 50);
        finalScores.judging += (scores[3] - 50);
      });

      // Range limitation
      Object.keys(finalScores).forEach(key => {
        finalScores[key as keyof typeof finalScores] = Math.max(0, Math.min(100, finalScores[key as keyof typeof finalScores]));
      });

      onComplete(finalScores);
    }
  };

  const handleOneClickSelect = (preset: typeof oneClickPresets[0]) => {
    onComplete(preset.scores);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-3xl mx-auto space-y-8 pt-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            🧠 Personality Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            나와 잘 맞는 아이돌을 찾기 위한 간단한 성격 테스트
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="quick" className="data-[state=active]:bg-primary/20">
              ⚡ 3문항 빠른 테스트
            </TabsTrigger>
            <TabsTrigger value="oneclick" className="data-[state=active]:bg-primary/20">
              🎯 원클릭 선택
            </TabsTrigger>
            <TabsTrigger value="skip" className="data-[state=active]:bg-primary/20">
              🏃 건너뛰기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-8">
            <Card className="p-8 glass-dark border-white/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    문항 {currentQuestion + 1} / {quickQuestions.length}
                  </Badge>
                  <Progress value={((currentQuestion) / quickQuestions.length) * 100} className="w-32" />
                </div>

                <div className="text-center space-y-8">
                  <h2 className="text-2xl font-bold">
                    {quickQuestions[currentQuestion]?.text}
                  </h2>

                  <div className="space-y-4">
                    {quickQuestions[currentQuestion]?.answers.map((answer, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickAnswer(index)}
                        variant="outline"
                        size="lg"
                        className="w-full p-6 text-lg glass-dark border-white/20 hover:bg-primary/20"
                      >
                        {answer}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="oneclick" className="mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {oneClickPresets.map((preset, index) => (
                <Card
                  key={index}
                  className="p-6 glass-dark border-white/10 card-hover cursor-pointer"
                  onClick={() => handleOneClickSelect(preset)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-4xl">{preset.emoji}</div>
                    <h3 className="text-xl font-bold gradient-text">{preset.name}</h3>
                    <Button variant="outline" size="sm">
                      선택하기
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skip" className="mt-8">
            <Card className="p-8 glass-dark border-white/10 text-center">
              <div className="space-y-6">
                <div className="text-4xl">🏃‍♀️</div>
                <h2 className="text-2xl font-bold gradient-text">테스트 건너뛰기</h2>
                <p className="text-muted-foreground">
                  성격 테스트를 건너뛰고 바로 하트 배틀로 이동합니다
                </p>
                <Button
                  onClick={onSkip}
                  variant="default"
                  size="lg"
                  className="btn-modern"
                >
                  하트 배틀 바로 시작 →
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {onBack && (
          <div className="text-center">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              ← 돌아가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;