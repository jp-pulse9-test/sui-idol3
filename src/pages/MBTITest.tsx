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

const questions: Question[] = [
  {
    id: 1,
    question: "What aspect of an idol captures your heart the most?",
    options: [
      { 
        text: "Brightly smiling while communicating with fans on stage", 
        type: 'E',
        emoji: "🎤"
      },
      { 
        text: "Quietly practicing alone or lost in thought", 
        type: 'I',
        emoji: "🎯"
      }
    ]
  },
  {
    id: 2,
    question: "How do you discover an idol's charm?",
    options: [
      { 
        text: "Clear talent and visuals shown on actual stages or broadcasts", 
        type: 'S',
        emoji: "⭐"
      },
      { 
        text: "By imagining hidden talents or future potential", 
        type: 'N',
        emoji: "✨"
      }
    ]
  },
  {
    id: 3,
    question: "What's the decisive moment when you start liking an idol?",
    options: [
      { text: "When seeing perfect skills and professional demeanor", type: 'T', emoji: "🏆" },
      { text: "When seeing heartfelt emotional expression or human side", type: 'F', emoji: "💖" }
    ]
  },
  {
    id: 4,
    question: "What's your fandom style?",
    options: [
      { text: "Planned fandom activities like checking concert dates and buying merchandise", type: 'J', emoji: "📅" },
      { text: "Freely engaging in fandom activities based on mood", type: 'P', emoji: "🎲" }
    ]
  },
  {
    id: 5,
    question: "What would you want to do when an idol looks struggling?",
    options: [
      { text: "Cheer loudly at fan meetings or concerts to give them strength", type: 'E', emoji: "📢" },
      { text: "Quietly support them in my heart while watching over them", type: 'I', emoji: "🤍" }
    ]
  },
  {
    id: 6,
    question: "What type of idol content do you prefer?",
    options: [
      { text: "Stable content like formatted variety shows or music broadcasts", type: 'S', emoji: "📺" },
      { text: "New content like unexpected lives or spontaneous vlogs", type: 'N', emoji: "🎬" }
    ]
  },
  {
    id: 7,
    question: "When there's controversy involving an idol?",
    options: [
      { text: "Check facts and make objective judgments", type: 'T', emoji: "🔍" },
      { text: "First consider the idol's feelings and circumstances", type: 'F', emoji: "💭" }
    ]
  },
  {
    id: 8,
    question: "What are your fan activities after becoming a fan?",
    options: [
      { text: "Systematic activities like joining fan clubs and regular subscriptions", type: 'J', emoji: "📋" },
      { text: "Freely doing only activities I want to do at the moment", type: 'P', emoji: "🌈" }
    ]
  }
];

export const MBTITest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      toast.error("Please connect your wallet first!");
      navigate('/');
      return;
    }
    
    const selectedGender = localStorage.getItem('selectedGender');
    if (!selectedGender) {
      toast.error("Please select gender first!");
      navigate('/gender-select');
    }
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

      // Generate personality profile
      const personalityProfile = {
        type: mbtiResult,
        traits: generateTraits(mbtiResult),
        description: generateDescription(mbtiResult)
      };

      // Save results (MBTI string + detailed profile)
      localStorage.setItem('mbtiResult', mbtiResult);
      localStorage.setItem('personalityProfile', JSON.stringify(personalityProfile));
      toast.success(`Your fan type is ${mbtiResult}!`);
      navigate('/appearance');
    }
  };

  const generateTraits = (mbti: string) => {
    const traitMap: { [key: string]: string[] } = {
      'ENFJ': ['Empathetic', 'Leadership-seeking', 'Social'],
      'ENFP': ['Free spirit', 'Creative', 'Optimistic'],
      'ENTJ': ['Natural planner', 'Charismatic', 'Goal-oriented'],
      'ENTP': ['Idea bank', 'Challenging', 'Innovative'],
      'ESFJ': ['Social butterfly', 'Caring', 'Cooperative'],
      'ESFP': ['Mood maker', 'Spontaneous', 'Energetic'],
      'ESTJ': ['Realist', 'Responsible', 'Systematic'],
      'ESTP': ['Adventurer', 'Practical', 'Adaptable'],
      'INFJ': ['Idealist', 'Intuitive', 'Independent'],
      'INFP': ['Dreamer', 'Emotional', 'Individualistic'],
      'INTJ': ['Strategist', 'Perfectionist', 'Original'],
      'INTP': ['Logician', 'Analytical', 'Curious'],
      'ISFJ': ['Protector', 'Cautious', 'Devoted'],
      'ISFP': ['Artist', 'Flexible', 'Peaceful'],
      'ISTJ': ['Practical worker', 'Reliable', 'Meticulous'],
      'ISTP': ['Jack of all trades', 'Realistic', 'Calm']
    };
    return traitMap[mbti] || ['Unique', 'Attractive', 'Special'];
  };

  const generateDescription = (mbti: string) => {
    const descriptions: { [key: string]: string } = {
      'ENFJ': 'As an extroverted and emotionally rich person, you deeply empathize with idols heartfelt emotional expressions.',
      'ENFP': 'Being free-spirited and creative, you are drawn to idols who show unexpected charm and endless possibilities.',
      'ENTJ': 'With strong leadership qualities, you prefer charismatic idols who dominate the stage.',
      'ENTP': 'Being innovative, you are attracted to idols who present new attempts and original content.',
      'ESFJ': 'Being social and caring, you like idols who value communication with fans.',
      'ESFP': 'Being lively and spontaneous, you are drawn to bright and energetic idols.',
      'ESTJ': 'Being realistic and systematic, you prefer idols who show professional skills and perfect performances.',
      'ESTP': 'Being adventurous and practical, you are interested in idols who show various charms and adaptability.',
      'INFJ': 'Being idealistic, you are drawn to idols with deep emotions and authenticity.',
      'INFP': 'Being emotional and individualistic, you like idols with unique charm and their own distinctive style.',
      'INTJ': 'Being strategic and perfectionist, you prefer idols who combine excellent skills with originality.',
      'INTP': 'Being logical and analytical, you are drawn to idols with excellent skills and intellectual charm.',
      'ISFJ': 'Being cautious and devoted, you like idols with warm and human charm.',
      'ISFP': 'Being artistic and peaceful, you are drawn to idols with natural and pure charm.',
      'ISTJ': 'Being reliable and meticulous, you prefer idols who show stable and consistent charm.',
      'ISTP': 'Being practical and calm, you are attracted to idols who are skilled yet humble.'
    };
    return descriptions[mbti] || 'You have unique and special preferences.';
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">1. Inner Personality Analysis</h1>
          <p className="text-muted-foreground">Find the idol moments that capture your heart</p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} / {questions.length}
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
            onClick={() => navigate('/gender-select')}
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

export default MBTITest;