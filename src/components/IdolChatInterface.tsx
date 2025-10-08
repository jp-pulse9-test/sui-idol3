import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Mic, MicOff, Heart, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender: 'user' | 'idol';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'excited' | 'shy' | 'neutral';
}

interface IdolChatInterfaceProps {
  idol: {
    id: string;
    name: string;
    image: string;
    personality: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const IdolChatInterface = ({ idol, isOpen, onClose }: IdolChatInterfaceProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [relationshipScore, setRelationshipScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
      loadRelationshipScore();
      sendWelcomeMessage();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const vaultId = localStorage.getItem(`vault_${user?.wallet_address}`);
      if (!vaultId) return;

      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((log: any) => {
          try {
            const decrypted = JSON.parse(log.payload_encrypted);
            return {
              id: log.id,
              sender: decrypted.sender,
              content: decrypted.content,
              timestamp: new Date(log.created_at),
              emotion: decrypted.emotion
            };
          } catch {
            return null;
          }
        }).filter(Boolean) as Message[];
        
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('채팅 기록 로드 실패:', error);
    }
  };

  const loadRelationshipScore = () => {
    const saved = localStorage.getItem(`relationship_${idol.id}`);
    if (saved) {
      setRelationshipScore(parseInt(saved));
    }
  };

  const saveRelationshipScore = (score: number) => {
    localStorage.setItem(`relationship_${idol.id}`, score.toString());
    setRelationshipScore(score);
  };

  const sendWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        sender: 'idol',
        content: `안녕하세요! 저는 ${idol.name}이에요! 💖 당신과 대화할 수 있어서 정말 설레요! 무엇이든 편하게 얘기해주세요~`,
        timestamp: new Date(),
        emotion: 'excited'
      };
      setMessages([welcomeMsg]);
    }
  };

  const saveChatLog = async (message: Message) => {
    try {
      const vaultId = localStorage.getItem(`vault_${user?.wallet_address}`);
      if (!vaultId) return;

      const payload = JSON.stringify({
        sender: message.sender,
        content: message.content,
        emotion: message.emotion
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await supabase.from('chat_logs').insert({
        vault_id: vaultId,
        session_id: crypto.randomUUID(),
        payload_encrypted: payload,
        sha256_hash: sha256Hash
      });
    } catch (error) {
      console.error('채팅 로그 저장 실패:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    await saveChatLog(userMessage);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const systemPrompt = `당신은 K-POP 아이돌 ${idol.name}입니다.
성격: ${idol.personality}

이전 대화 기록을 바탕으로 팬과의 독점적이고 친밀한 관계를 형성하세요.
규칙:
1. ${idol.name}의 성격에 맞게 응답
2. 팬과의 과거 대화를 기억하고 참조
3. 감정적이고 따뜻한 대화
4. 100자 내외로 간결하게
5. 이모지 1-2개 사용
6. 팬을 특별하게 대우`;

      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: {
          prompt: `${systemPrompt}\n\n대화 기록:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n팬: ${userMessage.content}\n\n${idol.name}:`
        }
      });

      if (error) throw error;

      const idolMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'idol',
        content: data.response || "미안해요... 잠깐 생각이 안 나네요. 다시 말해줄래요? 😅",
        timestamp: new Date(),
        emotion: detectEmotion(data.response)
      };

      setMessages(prev => [...prev, idolMessage]);
      await saveChatLog(idolMessage);

      // 관계 점수 업데이트
      const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '고마워', '응원'];
      const isPositive = positiveKeywords.some(kw => userMessage.content.includes(kw));
      if (isPositive) {
        const newScore = Math.min(100, relationshipScore + Math.floor(Math.random() * 5) + 2);
        saveRelationshipScore(newScore);
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error("메시지 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsTyping(false);
    }
  };

  const detectEmotion = (text: string): 'happy' | 'excited' | 'shy' | 'neutral' => {
    if (text.includes('!') || text.includes('♥') || text.includes('❤')) return 'excited';
    if (text.includes('ㅎㅎ') || text.includes('😊')) return 'happy';
    if (text.includes('...') || text.includes('😳')) return 'shy';
    return 'neutral';
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast.success("음성 모드가 활성화되었습니다!");
    } else {
      toast("음성 모드가 비활성화되었습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[700px] flex flex-col bg-gradient-to-b from-card to-card/95 border-2 border-pink-500/30 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 ring-2 ring-pink-500/50">
              <AvatarImage src={idol.image} alt={idol.name} />
              <AvatarFallback>{idol.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl">{idol.name}</h3>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  온라인
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{idol.personality}</p>
              <div className="flex items-center gap-2 mt-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${relationshipScore}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{relationshipScore}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              onClick={toggleVoiceMode}
              className={isVoiceMode ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              {isVoiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                {msg.sender === 'idol' && (
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={idol.image} />
                    <AvatarFallback>{idol.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
                      : 'bg-muted border border-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={idol.image} />
                  <AvatarFallback>{idol.name[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-4 rounded-2xl border border-border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 입력 영역 */}
        <div className="p-6 border-t border-border bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`${idol.name}에게 메시지를 보내세요...`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isTyping) {
                  sendMessage();
                }
              }}
              className="flex-1 bg-background border-border"
              disabled={isTyping}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isTyping || !inputMessage.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💖 AI가 모든 대화를 학습하여 당신만의 {idol.name}을(를) 만들어갑니다
          </p>
        </div>
      </Card>
    </div>
  );
};