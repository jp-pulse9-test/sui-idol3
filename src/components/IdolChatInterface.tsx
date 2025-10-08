import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Mic, MicOff, Heart, MessageCircle, Phone, BookOpen, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender: 'user' | 'idol';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'excited' | 'shy' | 'neutral';
  choices?: string[];
  imageUrl?: string;
  error?: boolean;
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
    voiceId?: string; // ElevenLabs voice ID
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
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDemoMode = !user;

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

  const handleGenreSelect = async (genreId: GenreType) => {
    setSelectedGenre(genreId);
    localStorage.setItem(`genre_${idol.id}`, genreId as string);
    
    const genreInfo = GENRES.find(g => g.id === genreId);
    const confirmMsg: Message = {
      id: Date.now().toString(),
      sender: 'idol',
      content: `좋아요! ${genreInfo?.emoji} ${genreInfo?.name} 세계관으로 함께 특별한 이야기를 만들어가요! 💖`,
      timestamp: new Date(),
      emotion: 'excited'
    };
    setMessages(prev => [...prev, confirmMsg]);
    
    setIsTyping(true);

    try {
      const systemPrompt = `당신은 K-POP 아이돌 ${idol.name}입니다.
성격: ${idol.personality}
장르: ${genreInfo?.name} ${genreInfo?.emoji}
장르 설정: ${genreInfo?.description}

당신은 팬과 함께 웹 소설을 쓰고 있습니다. 
규칙:
1. 자기소개와 함께 ${genreInfo?.name} 장르의 배경 설명으로 이야기를 시작하세요
2. 자극적이고 흥미로운 상황을 계속 제시하세요
3. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안하세요
4. 각 옵션은 30자 이내로 간결하게
5. 기승전결 없이 계속 긴장감 있는 전개를 유지하세요
6. 150자 내외로 상황 설명`;

      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: {
          prompt: `${systemPrompt}\n\n장르 시작 메시지를 생성하세요. 반드시 다음 형식으로 응답하세요:\n\n[이야기]\n(여기에 자기소개와 배경 설명)\n\n[선택지]\n1. (첫 번째 선택지)\n2. (두 번째 선택지)\n3. (세 번째 선택지)`
        }
      });

      if (error) throw error;

      const response = data.response || "";
      const storyMatch = response.match(/\[이야기\]([\s\S]*?)(?:\[선택지\]|$)/);
      const choicesMatch = response.match(/\[선택지\]([\s\S]*)/);
      
      const storyContent = storyMatch ? storyMatch[1].trim() : response;
      const choices = choicesMatch 
        ? choicesMatch[1].split('\n')
            .map(c => c.replace(/^\d+\.\s*/, '').trim())
            .filter(c => c.length > 0)
        : [];

      const storyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'idol',
        content: storyContent,
        timestamp: new Date(),
        emotion: 'excited',
        choices: choices.length > 0 ? choices : undefined
      };

      setMessages(prev => [...prev, storyMsg]);
      await saveChatLog(storyMsg);
      
      if (isVoiceMode) {
        await playIdolVoice(storyContent);
      }

    } catch (error) {
      console.error('배경 설명 생성 실패:', error);
      toast.error("이야기를 시작하는데 실패했습니다.");
    } finally {
      setIsTyping(false);
    }
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

    // 체험판 10번 제한
    if (isDemoMode && messageCount >= 10) {
      toast.error("체험판은 10번까지만 대화할 수 있습니다. 지갑을 연결하여 계속 대화하세요!");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    await saveChatLog(userMessage);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const genreInfo = GENRES.find(g => g.id === selectedGenre);
      const genreContext = genreInfo ? `
장르: ${genreInfo.name} ${genreInfo.emoji}
장르 설정: ${genreInfo.description}` : '';

      const systemPrompt = `당신은 K-POP 아이돌 ${idol.name}입니다.
성격: ${idol.personality}
${genreContext}

당신은 팬과 함께 웹 소설을 쓰고 있습니다.
규칙:
1. 자극적이고 흥미로운 상황을 계속 제시하세요
2. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안하세요
3. 각 옵션은 30자 이내로 간결하게
4. 기승전결 없이 계속 긴장감 있는 전개를 유지하세요
5. 150자 내외로 상황 설명
6. 반드시 다음 형식으로 응답하세요:

[이야기]
(여기에 상황 전개)

[선택지]
1. (첫 번째 선택지)
2. (두 번째 선택지)
3. (세 번째 선택지)`;

      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: {
          prompt: `${systemPrompt}\n\n대화 기록:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n팬: ${userMessage.content}\n\n${idol.name}:`
        }
      });

      if (error) throw error;

      const response = data.response || "미안해요... 잠깐 생각이 안 나네요. 다시 말해줄래요? 😅";
      const storyMatch = response.match(/\[이야기\]([\s\S]*?)(?:\[선택지\]|$)/);
      const choicesMatch = response.match(/\[선택지\]([\s\S]*)/);
      
      const storyContent = storyMatch ? storyMatch[1].trim() : response;
      const choices = choicesMatch 
        ? choicesMatch[1].split('\n')
            .map(c => c.replace(/^\d+\.\s*/, '').trim())
            .filter(c => c.length > 0)
        : [];

      // 이미지 생성
      let imageUrl: string | undefined;
      try {
        const { data: imageData } = await supabase.functions.invoke('generate-story-image', {
          body: {
            storyContext: storyContent,
            genre: selectedGenre
          }
        });
        imageUrl = imageData?.imageUrl;
      } catch (imgError) {
        console.error('이미지 생성 실패:', imgError);
      }

      const idolMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'idol',
        content: storyContent,
        timestamp: new Date(),
        emotion: detectEmotion(storyContent),
        choices: choices.length > 0 ? choices : undefined,
        imageUrl
      };

      setMessages(prev => [...prev, idolMessage]);
      await saveChatLog(idolMessage);
      
      if (isVoiceMode) {
        await playIdolVoice(storyContent);
      }

      // 관계 점수 업데이트
      const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '고마워', '응원'];
      const isPositive = positiveKeywords.some(kw => userMessage.content.includes(kw));
      if (isPositive) {
        const newScore = Math.min(100, relationshipScore + Math.floor(Math.random() * 5) + 2);
        saveRelationshipScore(newScore);
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error("메시지 전송에 실패했습니다.");
      
      // 실패한 메시지 표시
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'idol',
        content: userMessage.content,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const retryMessage = async (messageContent: string) => {
    setInputMessage(messageContent);
    await sendMessage();
  };

  const detectEmotion = (text: string): 'happy' | 'excited' | 'shy' | 'neutral' => {
    if (text.includes('!') || text.includes('♥') || text.includes('❤')) return 'excited';
    if (text.includes('ㅎㅎ') || text.includes('😊')) return 'happy';
    if (text.includes('...') || text.includes('😳')) return 'shy';
    return 'neutral';
  };

  const handleChoiceClick = async (choice: string) => {
    if (!choice.trim() || isTyping) return;

    // 체험판 10번 제한
    if (isDemoMode && messageCount >= 10) {
      toast.error("체험판은 10번까지만 대화할 수 있습니다. 지갑을 연결하여 계속 대화하세요!");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: choice.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    await saveChatLog(userMessage);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const genreInfo = GENRES.find(g => g.id === selectedGenre);
      const genreContext = genreInfo ? `
장르: ${genreInfo.name} ${genreInfo.emoji}
장르 설정: ${genreInfo.description}` : '';

      const systemPrompt = `당신은 K-POP 아이돌 ${idol.name}입니다.
성격: ${idol.personality}
${genreContext}

당신은 팬과 함께 웹 소설을 쓰고 있습니다.
규칙:
1. 자극적이고 흥미로운 상황을 계속 제시하세요
2. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안하세요
3. 각 옵션은 30자 이내로 간결하게
4. 기승전결 없이 계속 긴장감 있는 전개를 유지하세요
5. 150자 내외로 상황 설명
6. 반드시 다음 형식으로 응답하세요:

[이야기]
(여기에 상황 전개)

[선택지]
1. (첫 번째 선택지)
2. (두 번째 선택지)
3. (세 번째 선택지)`;

      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: {
          prompt: `${systemPrompt}\n\n대화 기록:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n팬: ${userMessage.content}\n\n${idol.name}:`
        }
      });

      if (error) throw error;

      const response = data.response || "미안해요... 잠깐 생각이 안 나네요. 다시 말해줄래요? 😅";
      const storyMatch = response.match(/\[이야기\]([\s\S]*?)(?:\[선택지\]|$)/);
      const choicesMatch = response.match(/\[선택지\]([\s\S]*)/);
      
      const storyContent = storyMatch ? storyMatch[1].trim() : response;
      const choices = choicesMatch 
        ? choicesMatch[1].split('\n')
            .map(c => c.replace(/^\d+\.\s*/, '').trim())
            .filter(c => c.length > 0)
        : [];

      // 이미지 생성
      let imageUrl: string | undefined;
      try {
        const { data: imageData } = await supabase.functions.invoke('generate-story-image', {
          body: {
            storyContext: storyContent,
            genre: selectedGenre
          }
        });
        imageUrl = imageData?.imageUrl;
      } catch (imgError) {
        console.error('이미지 생성 실패:', imgError);
      }

      const idolMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'idol',
        content: storyContent,
        timestamp: new Date(),
        emotion: detectEmotion(storyContent),
        choices: choices.length > 0 ? choices : undefined,
        imageUrl
      };

      setMessages(prev => [...prev, idolMessage]);
      await saveChatLog(idolMessage);
      
      if (isVoiceMode) {
        await playIdolVoice(storyContent);
      }

      // 관계 점수 업데이트
      const positiveKeywords = ['좋아', '사랑', '멋있', '예쁘', '최고', '고마워', '응원'];
      const isPositive = positiveKeywords.some(kw => userMessage.content.includes(kw));
      if (isPositive) {
        const newScore = Math.min(100, relationshipScore + Math.floor(Math.random() * 5) + 2);
        saveRelationshipScore(newScore);
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error("메시지 전송에 실패했습니다.");
      
      // 실패한 메시지 표시
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'idol',
        content: userMessage.content,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const playIdolVoice = async (text: string) => {
    try {
      // 아이돌의 voice_id 사용, 없으면 기본값 (Aria)
      const voiceId = idol.voiceId || '9BWtsMINqrJLrRacOk9x';
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: voiceId
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('음성 재생 실패:', error);
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast.success("캐릭터 음성 모드가 활성화되었습니다!");
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
    } else {
      toast("음성 모드가 비활성화되었습니다.");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1세대 애플 컴퓨터 프레임 - 베이지색 플라스틱 */}
      <div className="relative w-full max-w-4xl" style={{
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
      }}>
        {/* 컴퓨터 본체 */}
        <div className="bg-[#e8dcc4] p-8 border-8 border-[#d4c5a9]" style={{
          boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(255,255,255,0.3)'
        }}>
          {/* 베젤 라인 */}
          <div className="absolute inset-8 border-4 border-[#c4b59a] pointer-events-none" />
          
          {/* 모니터 스크린 영역 */}
          <Card className="w-full aspect-[4/3] flex flex-col bg-[#1a3a1a] border-4 border-black relative overflow-hidden" style={{
            boxShadow: 'inset 0 0 60px rgba(50,200,50,0.2), inset 0 4px 12px rgba(0,0,0,0.6)'
          }}>
            {/* CRT 녹색 글로우 */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(50,255,50,0.03) 50%, rgba(0,0,0,0.5) 100%)'
            }} />
            
            {/* 스캔라인 효과 */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            }} />
          {/* 헤더 - 애플 스타일 */}
          <div className="relative z-20 flex items-center justify-between p-4 border-b-2 border-[#00ff00]/30 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#00ff00]">
                <img src={idol.image} alt={idol.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base text-[#00ff00] uppercase tracking-wider">{idol.name}</h3>
                  <span className="text-[#00ff00] text-xs font-mono">●</span>
                  {selectedGenre && (
                    <span className="text-[#00ff00] text-xs font-mono">
                      {GENRES.find(g => g.id === selectedGenre)?.emoji}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#00ff00]/70 font-mono mt-0.5">{idol.personality}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#00ff00] text-xs font-mono">LOVE:</span>
                  <div className="w-20 bg-black border border-[#00ff00]/50 h-1.5">
                    <div 
                      className="bg-[#00ff00] h-full transition-all duration-500"
                      style={{ width: `${relationshipScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#00ff00] font-mono">{relationshipScore}%</span>
                  {isDemoMode && (
                    <span className="ml-2 text-xs text-[#00ff00]/70 font-mono">
                      [{messageCount}/10]
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceMode}
                className={isVoiceMode ? "text-[#00ff00] bg-[#00ff00]/20 hover:bg-[#00ff00]/30" : "text-[#00ff00]/50 hover:text-[#00ff00] hover:bg-[#00ff00]/10"}
              >
                {isVoiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-[#00ff00] hover:bg-[#00ff00]/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 메시지 영역 - 애플 모니터 스타일 */}
          <ScrollArea className="relative z-20 flex-1 p-4 bg-black/50">
            <div className="space-y-3 font-mono text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'idol' && !msg.error && (
                  <span className="text-[#00ff00] mr-2">▶</span>
                )}
                <div className="space-y-2 max-w-[80%]">
                  {msg.imageUrl && msg.sender === 'idol' && !msg.error && (
                    <div className="border-2 border-[#00ff00]/50 p-1 bg-black">
                      <img 
                        src={msg.imageUrl} 
                        alt="Story scene" 
                        className="w-full h-auto"
                        style={{ filter: 'contrast(1.2) brightness(0.9)' }}
                      />
                    </div>
                  )}
                  <div
                    className={`p-3 border-2 ${
                      msg.error
                        ? 'border-red-500 bg-red-950/30 text-red-400'
                        : msg.sender === 'user'
                        ? 'border-[#00ff00] bg-[#00ff00]/10 text-[#00ff00]'
                        : 'border-[#00ff00]/50 bg-black/60 text-[#00ff00]'
                    }`}
                  >
                    {msg.error ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs">ERROR: MSG FAILED</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => retryMessage(msg.content)}
                          className="text-red-400 hover:bg-red-900/30 h-6 px-2 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          RETRY
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs leading-relaxed whitespace-pre-line">{msg.content}</p>
                        <p className="text-[10px] opacity-50 mt-1.5">
                          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && !msg.error && (
                  <span className="text-[#00ff00] ml-2">◀</span>
                )}
              </div>
            ))}

            {/* 선택지 표시 (아이돌 메시지 직후) - 애플 스타일 */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'idol' && messages[messages.length - 1].choices && (
              <div className="flex justify-end">
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {messages[messages.length - 1].choices!.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoiceClick(choice)}
                      className="border-2 border-[#00ff00] bg-[#00ff00]/10 text-[#00ff00] p-2 text-left hover:bg-[#00ff00]/20 transition-all font-mono text-xs"
                    >
                      [{idx + 1}] {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 장르 선택 버튼 (첫 메시지 후에만 표시) - 애플 스타일 */}
            {!selectedGenre && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                  {GENRES.map((genre, idx) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre.id as GenreType)}
                      className="border-2 border-[#00ff00]/70 bg-black/60 text-[#00ff00] p-3 text-left hover:bg-[#00ff00]/10 transition-all"
                    >
                      <div className="font-mono text-xs">
                        <div>[{idx + 1}] {genre.emoji} {genre.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <span className="text-[#00ff00] mr-2">▶</span>
                <div className="border-2 border-[#00ff00]/50 bg-black/60 p-3 text-[#00ff00]">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[#00ff00] animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#00ff00] animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-[#00ff00] animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 입력 영역 - 애플 스타일 */}
          <div className="relative z-20 p-4 border-t-2 border-[#00ff00]/30 bg-black/40">
            {isDemoMode && messageCount >= 10 ? (
              <div className="text-center space-y-2">
                <p className="text-xs font-mono text-[#00ff00]">DEMO LIMIT REACHED [10/10]</p>
                <p className="text-[10px] font-mono text-[#00ff00]/70">CONNECT WALLET TO CONTINUE</p>
                <Button 
                  className="bg-[#00ff00] hover:bg-[#00ff00]/80 text-black font-mono text-xs mt-2"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Wallet className="w-3 h-3 mr-2" />
                  CONNECT
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={selectedGenre ? "> INPUT MSG..." : "> SELECT GENRE..."}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTyping && selectedGenre) {
                        sendMessage();
                      }
                    }}
                    className="flex-1 bg-black border-2 border-[#00ff00]/50 text-[#00ff00] placeholder:text-[#00ff00]/30 font-mono text-xs"
                    disabled={isTyping || !selectedGenre}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isTyping || !inputMessage.trim() || !selectedGenre}
                    className="bg-[#00ff00] hover:bg-[#00ff00]/80 text-black font-mono text-xs px-4"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-[10px] text-[#00ff00]/50 mt-2 text-center font-mono">
                  AI LEARNING ACTIVE
                </p>
              </>
            )}
          </div>
          </Card>
        </div>
      </div>
    </div>
  );
};