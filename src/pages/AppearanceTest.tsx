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
    question: "What hairstyle do you prefer?",
    options: [
      { text: "Clean short hair", value: "short", emoji: "✂️" },
      { text: "Soft waves", value: "wave", emoji: "🌊" },
      { text: "Chic long hair", value: "long", emoji: "💫" },
      { text: "Unique color", value: "colorful", emoji: "🎨" }
    ]
  },
  {
    id: 2,
    question: "What eye shape is attractive?",
    options: [
      { text: "Big round eyes", value: "round", emoji: "👀" },
      { text: "Sharp eyes", value: "sharp", emoji: "⚡" },
      { text: "Smiling eyes", value: "smiling", emoji: "😊" },
      { text: "Mysterious eyes", value: "mysterious", emoji: "🌙" }
    ]
  },
  {
    id: 3,
    question: "What body type do you prefer?",
    options: [
      { text: "Slim build", value: "slim", emoji: "🎋" },
      { text: "Athletic build", value: "athletic", emoji: "💪" },
      { text: "Soft curves", value: "soft", emoji: "🌸" },
      { text: "Tall", value: "tall", emoji: "🗼" }
    ]
  },
  {
    id: 4,
    question: "What style do you prefer?",
    options: [
      { text: "Clean formal wear", value: "formal", emoji: "🤵" },
      { text: "Casual comfort", value: "casual", emoji: "👕" },
      { text: "Hip street style", value: "street", emoji: "🧢" },
      { text: "Romantic floral", value: "romantic", emoji: "🌺" }
    ]
  },
  {
    id: 5,
    question: "What expression is attractive?",
    options: [
      { text: "Bright smile", value: "bright", emoji: "😄" },
      { text: "Sexy wink", value: "wink", emoji: "😉" },
      { text: "Calm smile", value: "calm", emoji: "😌" },
      { text: "Playful expression", value: "playful", emoji: "😋" }
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
      // Appearance preference analysis completed
      const appearanceProfile = calculateAppearanceProfile(newAnswers);
      localStorage.setItem('appearanceProfile', JSON.stringify(appearanceProfile));
      toast.success("Appearance preference analysis completed!");
      navigate('/result-analysis');
    }
  };

  const calculateAppearanceProfile = (answers: string[]) => {
    // Appearance preference analysis logic
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
    // Determine appearance preference type based on answer combinations
    const typeMap: { [key: string]: string } = {
      "cute": "Cute Type",
      "sexy": "Sexy Type", 
      "charismatic": "Charismatic Type",
      "natural": "Natural Type"
    };

    // Simple classification logic (more complex algorithms used in actual implementation)
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
          <h1 className="text-4xl font-bold gradient-text">2. Appearance Preference Analysis</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} / {questions.length}
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
            Previous Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTest;