import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Idol {
  id: number;
  name: string;
  image: string;
  personality: string;
  mbtiMatch: string[];
}

// Sample virtual idols data
const virtualIdols: Idol[] = [
  { id: 1, name: "Aria", image: "🌟", personality: "Bright and energetic", mbtiMatch: ["ENFP", "ESFP", "ENFJ"] },
  { id: 2, name: "Luna", image: "🌙", personality: "Mysterious", mbtiMatch: ["INFJ", "INFP", "INTJ"] },
  { id: 3, name: "Zero", image: "⚡", personality: "Charismatic", mbtiMatch: ["ENTJ", "ESTP", "ENTP"] },
  { id: 4, name: "Miyu", image: "🌸", personality: "Gentle", mbtiMatch: ["ISFJ", "ISFP", "ESFJ"] },
  { id: 5, name: "Kai", image: "🔥", personality: "Passionate", mbtiMatch: ["ESFP", "ENFP", "ESTP"] },
  { id: 6, name: "Sera", image: "💎", personality: "Elegant", mbtiMatch: ["ISFJ", "INFJ", "ISFP"] },
  { id: 7, name: "Rio", image: "🎵", personality: "Free-spirited", mbtiMatch: ["ENFP", "INFP", "ESFP"] },
  { id: 8, name: "Nova", image: "✨", personality: "Creative", mbtiMatch: ["INTJ", "INTP", "ENFP"] }
];

export const WorldCup = () => {
  const [contestants, setContestants] = useState<Idol[]>([]);
  const [currentPair, setCurrentPair] = useState<[Idol, Idol] | null>(null);
  const [winners, setWinners] = useState<Idol[]>([]);
  const [round, setRound] = useState(1);
  const [mbtiResult, setMbtiResult] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedMbti = localStorage.getItem('mbtiResult');
    if (!storedMbti) {
      toast.error("Please complete the MBTI test first!");
      navigate('/mbti');
      return;
    }
    
    setMbtiResult(storedMbti);
    
    // Filter idols based on MBTI compatibility
    const compatibleIdols = virtualIdols.filter(idol => 
      idol.mbtiMatch.includes(storedMbti)
    );
    
    // If less than 4 compatible idols, add some random ones
    const finalIdols = compatibleIdols.length >= 4 
      ? compatibleIdols.slice(0, 8)
      : [...compatibleIdols, ...virtualIdols.filter(idol => !compatibleIdols.includes(idol))].slice(0, 8);
    
    setContestants(finalIdols);
    setCurrentPair([finalIdols[0], finalIdols[1]]);
  }, [navigate]);

  const handleChoice = (chosen: Idol) => {
    const newWinners = [...winners, chosen];
    setWinners(newWinners);

    const remainingContestants = contestants.slice(2);
    
    if (remainingContestants.length >= 2) {
      setCurrentPair([remainingContestants[0], remainingContestants[1]]);
      setContestants(remainingContestants);
    } else if (remainingContestants.length === 1) {
      // Last contestant automatically advances
      const finalWinners = [...newWinners, remainingContestants[0]];
      if (finalWinners.length === 1) {
        // Tournament complete
        localStorage.setItem('idealType', JSON.stringify(finalWinners[0]));
        toast.success(`${finalWinners[0].name} has been selected as your ideal type!`);
        navigate('/photocard');
      } else {
        // Start next round
        setContestants(finalWinners);
        setWinners([]);
        setCurrentPair([finalWinners[0], finalWinners[1]]);
        setRound(round + 1);
      }
    } else {
      // Start next round with winners
      if (newWinners.length === 1) {
        localStorage.setItem('idealType', JSON.stringify(newWinners[0]));
        toast.success(`${newWinners[0].name} has been selected as your ideal type!`);
        navigate('/photocard');
      } else {
        setContestants(newWinners);
        setWinners([]);
        setCurrentPair([newWinners[0], newWinners[1]]);
        setRound(round + 1);
      }
    }
  };

  if (!currentPair) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Preparing ideal type world cup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Virtual Idol Ideal Type World Cup</h1>
          <p className="text-muted-foreground">Find your ideal type that matches your MBTI ({mbtiResult})</p>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 inline-block">
            <p className="text-sm font-medium">Round {round}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {currentPair.map((idol) => (
            <Card 
              key={idol.id}
              className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer card-hover"
              onClick={() => handleChoice(idol)}
            >
              <div className="text-center space-y-4">
                <div className="text-8xl mb-4">{idol.image}</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{idol.name}</h3>
                  <p className="text-muted-foreground">{idol.personality} personality</p>
                </div>
                <Button 
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldCup;