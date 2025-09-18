import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ChatModal from "@/components/ChatModal";
import StoryGameModal from "@/components/StoryGameModal";

interface StoryChoice {
  id: string;
  text: string;
  result: string;
  nextSceneId?: string;
  nftReward?: string;
}

interface StoryScene {
  id: string;
  title: string;
  content: string;
  choices: StoryChoice[];
  isEnding?: boolean;
  nftReward?: string;
}

interface StoryScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  emoji: string;
  unlocked: boolean;
  progress: number;
  scenes: StoryScene[];
  category: 'daily' | 'debut' | 'special';
  difficulty: 'easy' | 'normal' | 'hard';
  estimatedTime: string;
}

const Play = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<StoryScenario | null>(null);
  const [showStoryGame, setShowStoryGame] = useState(false);

  useEffect(() => {
    const finalPick = localStorage.getItem('finalPick');
    if (!finalPick) {
      navigate('/pick');
      return;
    }
    setSelectedIdol(JSON.parse(finalPick));
  }, [navigate]);

  const scenarios: StoryScenario[] = [
    {
      id: 'morning_routine',
      title: '🌅 첫 만남의 아침',
      description: '데뷔를 앞둔 아이돌과의 첫 만남',
      location: '연습생 기숙사',
      emoji: '🌅',
      unlocked: true,
      progress: 0,
      category: 'daily',
      difficulty: 'easy',
      estimatedTime: '5분',
      scenes: [
        {
          id: 'morning_start',
          title: '기숙사 복도에서',
          content: `새벽 6시, 기숙사 복도에서 ${selectedIdol?.name || '아이돌'}을 마주쳤습니다.\n긴장한 듯 보이지만 당신을 보자 살짝 미소를 짓습니다.`,
          choices: [
            {
              id: 'encourage',
              text: '응원의 말을 건네기',
              result: '당신의 따뜻한 말에 용기를 얻었습니다.',
              nextSceneId: 'morning_end'
            },
            {
              id: 'casual_talk',
              text: '자연스럽게 인사하기',
              result: '편안한 분위기가 만들어졌습니다.',
              nextSceneId: 'morning_end'
            }
          ]
        },
        {
          id: 'morning_end',
          title: '특별한 순간',
          content: `연습실 앞에서 ${selectedIdol?.name || '아이돌'}이 당신에게 특별한 포토카드를 건네줍니다.\n"고마워요, 이거 받아주세요!"`,
          choices: [
            {
              id: 'accept_gift',
              text: '감사히 받기',
              result: '첫 만남 기념 포토카드를 획득했습니다!',
              nftReward: 'first_meeting_photocard'
            }
          ],
          isEnding: true,
          nftReward: 'first_meeting_photocard'
        }
      ]
    },
    {
      id: 'debut_stage',
      title: '🎤 데뷔 무대의 기적',
      description: '운명의 데뷔 무대, 그 특별한 순간들',
      location: '음악방송 스튜디오',
      emoji: '🎤',
      unlocked: false,
      progress: 0,
      category: 'debut',
      difficulty: 'hard',
      estimatedTime: '10분',
      scenes: [
        {
          id: 'debut_preparation',
          title: '데뷔 무대 준비',
          content: `드디어 데뷔 무대 당일! ${selectedIdol?.name || '아이돌'}이 대기실에서 긴장하고 있습니다.\n당신만이 이 순간을 함께할 수 있습니다.`,
          choices: [
            {
              id: 'calm_nerves',
              text: '긴장을 풀어주기',
              result: '당신의 도움으로 마음이 차분해졌습니다.',
              nextSceneId: 'debut_success'
            }
          ]
        },
        {
          id: 'debut_success',
          title: '데뷔의 완성',
          content: `무대를 성공적으로 마친 ${selectedIdol?.name || '아이돌'}이 눈물을 흘리며 당신에게 달려옵니다.\n"당신이 있어서 가능했어요!"`,
          choices: [
            {
              id: 'celebrate_debut',
              text: '데뷔를 축하하기',
              result: '데뷔 기념 특별 포토카드와 Rookie 뱃지(SBT)를 획득했습니다!',
              nftReward: 'debut_special_sbt'
            }
          ],
          isEnding: true,
          nftReward: 'debut_special_sbt'
        }
      ]
    }
  ];

  const handleScenarioSelect = (scenario: StoryScenario) => {
    if (!scenario.unlocked) {
      toast.error("이 스토리는 아직 잠겨있습니다!");
      return;
    }
    setCurrentScenario(scenario);
    setShowStoryGame(true);
  };

  if (!selectedIdol) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            {selectedIdol.name}의 일상 스토리
          </h1>
          <p className="text-xl text-muted-foreground">
            텍스트 게임을 클리어하며 특별한 NFT 포토카드를 획득하세요
          </p>
        </div>

        {/* Idol Profile Card */}
        <Card className="glass-dark border-white/10 p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img src={selectedIdol.image} alt={selectedIdol.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {selectedIdol.personality}
              </Badge>
              <Button onClick={() => setShowChat(true)} variant="outline" size="sm">
                💬 대화하기
              </Button>
            </div>
          </div>
        </Card>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`group cursor-pointer transition-all duration-300 glass-dark border-white/10 card-hover relative overflow-hidden ${
                !scenario.unlocked ? 'opacity-50' : ''
              }`}
              onClick={() => handleScenarioSelect(scenario)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{scenario.emoji}</span>
                  <div className="flex gap-2">
                    <Badge className={`text-xs ${scenario.difficulty === 'easy' ? 'bg-green-500' : scenario.difficulty === 'normal' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                      {scenario.difficulty.toUpperCase()}
                    </Badge>
                    {!scenario.unlocked && <div className="text-gray-500">🔒</div>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg gradient-text">{scenario.title}</h3>
                  <p className="text-muted-foreground text-sm">{scenario.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>📍 {scenario.location}</span>
                    <span>⏱️ {scenario.estimatedTime}</span>
                    <span>{scenario.category === 'daily' ? '📅' : scenario.category === 'debut' ? '🌟' : '💎'}</span>
                  </div>
                </div>

                <Button 
                  variant={scenario.unlocked ? "default" : "secondary"}
                  size="sm"
                  className="w-full"
                  disabled={!scenario.unlocked}
                >
                  {scenario.unlocked ? "🎮 텍스트 게임 시작" : "잠김"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 pt-8">
          <Button onClick={() => navigate('/collection')} variant="outline">
            🗃️ 컬렉션 보기
          </Button>
          <Button onClick={() => navigate('/growth')} variant="outline">
            📈 성장 현황
          </Button>
          <Button onClick={() => navigate('/')} variant="outline">
            🏠 홈으로
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showChat && selectedIdol && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          character={{
            id: selectedIdol.id || 1,
            name: selectedIdol.name,
            image: selectedIdol.image,
            personality: selectedIdol.personality
          }}
        />
      )}

      {showStoryGame && currentScenario && selectedIdol && (
        <StoryGameModal
          isOpen={showStoryGame}
          onClose={() => setShowStoryGame(false)}
          scenario={currentScenario}
          idolName={selectedIdol.name}
        />
      )}
    </div>
  );
};

export default Play;