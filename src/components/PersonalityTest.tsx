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
      text: "How do you approach meeting new people?",
      answers: ["I actively approach them first", "I approach cautiously depending on the situation"],
      scores: [[70, 0, 0, 0], [30, 0, 0, 0]]
    },
    {
      id: 2,
      text: "What do you value most when listening to music?",
      answers: ["Creative and unique sounds", "High-quality and stable melodies"],
      scores: [[0, 70, 0, 0], [0, 30, 0, 0]]
    },
    {
      id: 3,
      text: "What's your preferred way of managing schedules?",
      answers: ["Systematically with planning", "Flexibly according to situations"],
      scores: [[0, 0, 0, 70], [0, 0, 0, 30]]
    }
  ];

  // One-click presets
  const oneClickPresets = [
    { name: "Passionate Leader", emoji: "🔥", scores: { extroversion: 80, intuition: 70, feeling: 60, judging: 75 } },
    { name: "Creative Artist", emoji: "🎨", scores: { extroversion: 40, intuition: 85, feeling: 80, judging: 30 } },
    { name: "Stable Manager", emoji: "📋", scores: { extroversion: 60, intuition: 30, feeling: 40, judging: 85 } },
    { name: "Free Adventurer", emoji: "🌟", scores: { extroversion: 75, intuition: 80, feeling: 70, judging: 25 } }
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
            A simple personality test to find idols that match you well
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="quick" className="data-[state=active]:bg-primary/20">
              ⚡ 3-Question Quick Test
            </TabsTrigger>
            <TabsTrigger value="oneclick" className="data-[state=active]:bg-primary/20">
              🎯 One-Click Selection
            </TabsTrigger>
            <TabsTrigger value="skip" className="data-[state=active]:bg-primary/20">
              🏃 Skip
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-8">
            <Card className="p-8 glass-dark border-white/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Question {currentQuestion + 1} / {quickQuestions.length}
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
                      Select
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
                <h2 className="text-2xl font-bold gradient-text">Skip Test</h2>
                <p className="text-muted-foreground">
                  Skip the personality test and go directly to the Heart Battle
                </p>
                <Button
                  onClick={onSkip}
                  variant="default"
                  size="lg"
                  className="btn-modern"
                >
                  Start Heart Battle Now →
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
              ← Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;