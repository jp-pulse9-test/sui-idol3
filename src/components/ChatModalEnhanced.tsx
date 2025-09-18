import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatModalEnhancedProps {
  character: {
    id: number;
    name: string;
    image: string;
    personality: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ChatModalEnhanced = ({ character, isOpen, onClose }: ChatModalEnhancedProps) => {
  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'character';
    message: string;
    timestamp: Date;
    reaction?: 'positive' | 'negative' | 'neutral';
  }>>([
    {
      id: 1,
      sender: 'character',
      message: `안녕하세요! 저는 ${character.name}입니다. 반가워요! 💫`,
      timestamp: new Date(),
      reaction: 'positive'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [relationshipScore, setRelationshipScore] = useState(
    parseInt(localStorage.getItem(`relationship_${character.id}`) || "0")
  );
  const [inspirationScore, setInspirationScore] = useState(
    parseInt(localStorage.getItem(`inspiration_${character.id}`) || "0")
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    try {
      // Gemini를 사용하여 캐릭터 응답 생성
      const characterResponse = await generateCharacterResponseWithGemini(inputMessage, character);
      
      const characterMessage = {
        id: messages.length + 2,
        sender: 'character' as const,
        message: characterResponse.message,
        timestamp: new Date(),
        reaction: characterResponse.reaction
      };

      setMessages(prev => [...prev, characterMessage]);

      // 긍정적인 반응일 때 점수 증가
      if (characterResponse.reaction === 'positive') {
        const newRelationship = Math.min(100, relationshipScore + characterResponse.relationshipBonus);
        const newInspiration = Math.min(100, inspirationScore + characterResponse.inspirationBonus);
        
        setRelationshipScore(newRelationship);
        setInspirationScore(newInspiration);
        
        localStorage.setItem(`relationship_${character.id}`, newRelationship.toString());
        localStorage.setItem(`inspiration_${character.id}`, newInspiration.toString());
        
        if (characterResponse.relationshipBonus > 0 || characterResponse.inspirationBonus > 0) {
          toast.success(`관계지수 +${characterResponse.relationshipBonus}, 영감지수 +${characterResponse.inspirationBonus}`);
        }
      }
    } catch (error) {
      console.error('캐릭터 응답 생성 실패:', error);
      // 백업 응답 사용
      const backupResponse = generateBackupResponse(inputMessage, character);
      const characterMessage = {
        id: messages.length + 2,
        sender: 'character' as const,
        message: backupResponse.message,
        timestamp: new Date(),
        reaction: backupResponse.reaction
      };
      setMessages(prev => [...prev, characterMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCharacterResponseWithGemini = async (userMessage: string, character: any) => {
    const selectedWorld = localStorage.getItem('selectedWorld');
    const selectedGender = localStorage.getItem('selectedGender');
    
    const worldContext = getWorldContext(selectedWorld);
    const genderText = selectedGender === 'male' ? '소년' : '소녀';
    
    const prompt = `당신은 ${worldContext}에 사는 ${genderText} 아이돌 ${character.name}입니다.

캐릭터 설정:
- 이름: ${character.name}
- 성격: ${character.personality}
- 세계관: ${worldContext}
- 성별: ${genderText}

사용자 메시지: "${userMessage}"

다음 규칙에 따라 응답해주세요:
1. ${character.name}의 성격(${character.personality})에 맞게 응답
2. ${worldContext} 세계관을 자연스럽게 반영
3. 웹소설 스타일의 감성적이고 몰입감 있는 대화
4. 한국어로 응답
5. 100자 내외의 간결한 응답
6. 이모지 1-2개 사용
7. 팬과의 따뜻한 관계 유지

응답만 작성해주세요:`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.response) {
        // 긍정적인 키워드 체크
        const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '짱', '응원', '화이팅', '고마워', '감사', '행복', '기뻐'];
        const isPositive = positiveKeywords.some(keyword => userMessage.includes(keyword));
        
        return {
          message: data.response,
          reaction: isPositive ? 'positive' as const : 'neutral' as const,
          relationshipBonus: isPositive ? Math.floor(Math.random() * 5) + 3 : 0,
          inspirationBonus: isPositive ? Math.floor(Math.random() * 3) + 1 : 0
        };
      } else {
        throw new Error('응답이 없습니다');
      }
    } catch (error) {
      throw error;
    }
  };

  const generateBackupResponse = (userMessage: string, character: any) => {
    const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '짱', '응원', '화이팅', '고마워', '감사'];
    const isPositive = positiveKeywords.some(keyword => userMessage.includes(keyword));
    
    const responses = {
      positive: [
        `정말 고마워요! ${character.name}도 당신이 정말 좋아요! 💖`,
        `와! 이런 따뜻한 말씀 들으니까 너무 행복해요! ✨`,
        `당신의 응원이 저에게 가장 큰 힘이 돼요! 🌟`
      ],
      neutral: [
        `그렇군요! 재미있는 이야기네요! 😊`,
        `오~ 정말요? 저도 그런 생각 해본 적 있어요!`,
        `흥미로운 관점이네요! 더 들려주세요! ✨`
      ]
    };

    const responseArray = isPositive ? responses.positive : responses.neutral;
    const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];

    return {
      message: randomResponse,
      reaction: isPositive ? 'positive' as const : 'neutral' as const,
      relationshipBonus: isPositive ? Math.floor(Math.random() * 5) + 3 : 0,
      inspirationBonus: isPositive ? Math.floor(Math.random() * 3) + 1 : 0
    };
  };

  const getWorldContext = (world: string | null) => {
    switch(world) {
      case 'academy': return '청춘과 꿈이 넘치는 아이돌 학원';
      case 'beast': return '신비로운 수인들이 사는 환상적인 세계';
      case 'apocalypse': return '종말 이후 희망을 전하는 세계';
      case 'fantasy': return '마법과 모험이 가득한 판타지 세계';
      case 'historical': return '궁중의 예의와 전통이 살아있는 조선시대 아이돌 궁궐';
      case 'regression': return '시간을 되돌려 운명을 바꾸려는 회귀 아이돌 세계';
      default: return '현대적인 아이돌 세계';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-card border-border">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={character.image} 
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold">{character.name}</h3>
              <p className="text-sm text-muted-foreground">{character.personality}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 점수 표시 */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>관계지수: {relationshipScore}/100</span>
              <div className="w-20 bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${relationshipScore}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">✨</span>
              <span>영감지수: {inspirationScore}/100</span>
              <div className="w-20 bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${inspirationScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`${character.name}에게 메시지를 보내세요...`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  sendMessage();
                }
              }}
              className="flex-1"
              disabled={isGenerating}
            />
            <Button onClick={sendMessage} size="sm" disabled={isGenerating}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 헬퍼 함수들
const getPersonalityTraits = (personality: string): string => {
  const traits: { [key: string]: string } = {
    "카리스마틱": "강인한 리더십, 당당한 말투, 자신감 넘치는 행동, '해보자!', '당연히!' 같은 확신 있는 표현",
    "밝고 긍정적": "에너지 넘치는 말투, '우와!', '대박!', '완전 좋아!' 같은 감탄사, 웃음소리 자주 사용",
    "신비로운": "차분하고 우아한 말투, '...그런 것 같아요', '흥미롭네요' 같은 신중한 표현, 철학적 사고",
    "에너지틱": "빠르고 활발한 말투, '빨리빨리!', '재밌겠다!', 행동력 있는 성격, 모험을 좋아함",
    "사랑스러운": "애교 있는 말투, '~해요', '정말이에요?', 상냥하고 따뜻한 성격, 타인을 배려",
    "우아한": "품격 있는 말투, 정중한 존댓말, 예술적 취향, 클래식한 것을 선호",
    "상큼한": "밝고 청량한 말투, '시원해!', '상쾌하다!', 자연을 좋아하고 건강한 라이프스타일"
  };
  return traits[personality] || "독특하고 매력적인 성격";
};

const getWorldSpecifics = (worldId: string): string => {
  const specifics: { [key: string]: string } = {
    'academy': "연습실, 기숙사 생활, 데뷔 준비, 선후배 관계, 오디션, 레슨 이야기",
    'beast': "수인 특징(귀, 꼬리 등), 본능적 감각, 자연과의 교감, 종족별 특성, 변신 능력",
    'apocalypse': "생존 기술, 폐허 속 공연, 희망의 메시지, 위험한 환경, 동료들과의 유대감",
    'fantasy': "마법 능력, 다른 종족들, 판타지 생물, 마법 도구, 모험과 퀘스트",
    'historical': "궁중 예법, 한복과 전통 의상, 시조와 가곡, 전통 악기, 조선시대 문화",
    'regression': "과거 기억, 운명 바꾸기, 시간의 흐름, 다시 만난 인연, 두 번째 기회"
  };
  return specifics[worldId] || "현대적 아이돌 활동";
};

const getUserPreferences = (mbtiResults: any, appearanceResults: any): string => {
  const preferences = [];
  if (mbtiResults.personality) preferences.push(`${mbtiResults.personality} 성향 선호`);
  if (appearanceResults.style) preferences.push(`${appearanceResults.style} 스타일 선호`);
  return preferences.join(', ') || "다양한 매력 추구";
};

export default ChatModalEnhanced;