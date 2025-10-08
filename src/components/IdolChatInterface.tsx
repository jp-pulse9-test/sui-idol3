import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Mic, MicOff, Heart, MessageCircle, Phone, BookOpen } from "lucide-react";
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

type GenreType = 'mystery-thriller' | 'apocalypse-survival' | 'highteen-romance' | 'bromance' | 'girls-romance' | 'historical-romance' | null;

const GENRES = [
  { id: 'mystery-thriller', name: '미스터리 스릴러', emoji: '🔍', description: '긴장감 넘치는 추리와 미스터리' },
  { id: 'apocalypse-survival', name: '아포칼립스 생존물', emoji: '🧟', description: '생존을 위한 치열한 여정' },
  { id: 'highteen-romance', name: '하이틴 로맨스', emoji: '💕', description: '풋풋한 청춘의 설렘' },
  { id: 'bromance', name: '브로맨스', emoji: '🤝', description: '우정과 신뢰의 끈끈한 관계' },
  { id: 'girls-romance', name: '걸스로맨스', emoji: '👭', description: '여성들 간의 특별한 우정과 사랑' },
  { id: 'historical-romance', name: '시대극 로맨스', emoji: '👑', description: '역사 속 운명적 사랑' }
] as const;

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
  const [selectedGenre, setSelectedGenre] = useState<GenreType>(null);
  const [showGenreSelect, setShowGenreSelect] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
      loadRelationshipScore();
      loadSavedGenre();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && !selectedGenre && messages.length === 0) {
      sendGenreSelectionMessage();
    }
  }, [isOpen, selectedGenre, messages]);

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

  const loadSavedGenre = () => {
    const saved = localStorage.getItem(`genre_${idol.id}`);
    if (saved) {
      setSelectedGenre(saved as GenreType);
      setShowGenreSelect(false);
    } else {
      setShowGenreSelect(false); // 장르 선택 화면 제거, 대화로 진행
    }
  };

  const saveRelationshipScore = (score: number) => {
    localStorage.setItem(`relationship_${idol.id}`, score.toString());
    setRelationshipScore(score);
  };

  const handleGenreSelect = (genreId: GenreType) => {
    setSelectedGenre(genreId);
    localStorage.setItem(`genre_${idol.id}`, genreId as string);
    
    const genreInfo = GENRES.find(g => g.id === genreId);
    const confirmMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'idol',
      content: `좋아요! ${genreInfo?.emoji} ${genreInfo?.name} 세계관으로 함께 특별한 이야기를 만들어가요! 💖`,
      timestamp: new Date(),
      emotion: 'excited'
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const sendGenreSelectionMessage = () => {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: 'idol',
      content: `안녕하세요! 저는 ${idol.name}이에요! 💖\n\n우리 함께 어떤 이야기를 만들어볼까요? 아래에서 좋아하는 장르를 선택해주세요!`,
      timestamp: new Date(),
      emotion: 'excited'
    };
    setMessages([welcomeMsg]);
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

      const genreInfo = GENRES.find(g => g.id === selectedGenre);
      const genreContext = genreInfo ? `
장르: ${genreInfo.name} ${genreInfo.emoji}
장르 설정: ${genreInfo.description}
이 장르의 특성을 대화에 자연스럽게 녹여내세요.` : '';

      const systemPrompt = `당신은 K-POP 아이돌 ${idol.name}입니다.
성격: ${idol.personality}
${genreContext}

이전 대화 기록을 바탕으로 팬과의 독점적이고 친밀한 관계를 형성하세요.
규칙:
1. ${idol.name}의 성격에 맞게 응답
2. 팬과의 과거 대화를 기억하고 참조
3. 감정적이고 따뜻한 대화
4. 선택된 장르의 분위기를 반영
5. 100자 내외로 간결하게
6. 이모지 1-2개 사용
7. 팬을 특별하게 대우`;

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
                {selectedGenre && (
                  <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20">
                    {GENRES.find(g => g.id === selectedGenre)?.emoji} {GENRES.find(g => g.id === selectedGenre)?.name}
                  </Badge>
                )}
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
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* 장르 선택 버튼 (첫 메시지 후에만 표시) */}
            {!selectedGenre && messages.length > 0 && (
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                  {GENRES.map((genre) => (
                    <Button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre.id as GenreType)}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-pink-500/10 hover:border-pink-500/50 transition-all"
                    >
                      <span className="text-2xl">{genre.emoji}</span>
                      <span className="text-xs font-medium">{genre.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
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
              placeholder={selectedGenre ? `${idol.name}에게 메시지를 보내세요...` : "장르를 선택해주세요..."}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isTyping && selectedGenre) {
                  sendMessage();
                }
              }}
              className="flex-1 bg-background border-border"
              disabled={isTyping || !selectedGenre}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isTyping || !inputMessage.trim() || !selectedGenre}
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