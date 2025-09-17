import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Heart } from "lucide-react";
import { toast } from "sonner";

interface ChatModalProps {
  character: {
    id: number;
    name: string;
    image: string;
    personality: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal = ({ character, isOpen, onClose }: ChatModalProps) => {
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

  if (!isOpen) return null;

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    // 캐릭터 응답 생성
    const characterResponse = generateCharacterResponse(inputMessage, character);
    const characterMessage = {
      id: messages.length + 2,
      sender: 'character' as const,
      message: characterResponse.message,
      timestamp: new Date(),
      reaction: characterResponse.reaction
    };

    setMessages([...messages, userMessage, characterMessage]);
    setInputMessage("");

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
  };

  const generateCharacterResponse = (userMessage: string, character: any) => {
    // 긍정적인 키워드들
    const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '짱', '응원', '화이팅', '고마워', '감사'];
    const isPositive = positiveKeywords.some(keyword => userMessage.includes(keyword));
    
    // 캐릭터 성격에 따른 응답
    const responses = {
      '카리스마틱': {
        positive: [
          "고마워요! 앞으로도 더 멋진 모습 보여드릴게요! 🔥",
          "당신의 응원이 저에게 큰 힘이 됩니다. 💪",
          "함께라면 무엇이든 해낼 수 있을 것 같아요!"
        ],
        neutral: [
          "그렇군요. 더 궁금한 게 있다면 언제든 물어보세요.",
          "좋은 이야기네요. 저도 그런 생각을 해본 적이 있어요.",
          "흥미로운 관점이네요!"
        ]
      },
      '밝고 긍정적': {
        positive: [
          "와! 정말 기뻐요! 😊 당신과 이야기하니까 하루가 더 밝아져요!",
          "너무 고마워요! 저도 당신을 응원할게요! ✨",
          "이런 따뜻한 말씀 들으니까 에너지가 충전되는 것 같아요!"
        ],
        neutral: [
          "오~ 재미있는 이야기네요! 더 들려주세요! 😄",
          "그런 일이 있었군요! 저도 비슷한 경험이 있어요.",
          "정말요? 신기하네요! 🌟"
        ]
      },
      '사랑스러운': {
        positive: [
          "헤헤~ 정말요? 너무 기뻐요! 🥰 당신도 정말 좋은 분이에요!",
          "와앙~ 고마워요! 저도 당신이 너무 좋아요! 💕",
          "이런 말씀 해주시면 얼굴이 빨개져요! 😊"
        ],
        neutral: [
          "오호~ 그런 일이 있었군요! 신기해요! 😮",
          "우와~ 재미있어 보여요! 저도 해보고 싶어요!",
          "그렇군요! 많이 배워갑니다! 🌸"
        ]
      },
      '우아한': {
        positive: [
          "정말 감사합니다. 당신의 마음이 저에게 잘 전해졌어요. ✨",
          "이런 따뜻한 말씀을 해주시니 마음이 따뜻해집니다.",
          "당신의 응원이 저에게는 가장 소중한 선물입니다."
        ],
        neutral: [
          "흥미로운 이야기네요. 저도 그런 관점에서 생각해본 적이 있어요.",
          "좋은 말씀이군요. 많은 것을 배웁니다.",
          "그런 생각을 하시는군요. 깊이 있는 분이시네요."
        ]
      }
    };

    const characterResponses = responses[character.personality as keyof typeof responses] || responses['밝고 긍정적'];
    const responseArray = isPositive ? characterResponses.positive : characterResponses.neutral;
    const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];

    return {
      message: randomResponse,
      reaction: isPositive ? 'positive' as const : 'neutral' as const,
      relationshipBonus: isPositive ? Math.floor(Math.random() * 5) + 3 : 0,
      inspirationBonus: isPositive ? Math.floor(Math.random() * 3) + 1 : 0
    };
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
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`${character.name}에게 메시지를 보내세요...`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatModal;