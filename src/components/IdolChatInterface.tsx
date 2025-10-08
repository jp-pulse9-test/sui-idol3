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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #2a1a3a 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      {/* 90년대 구형 컴퓨터 프레임 - 베이지색 플라스틱 케이스 */}
      <div className="relative w-full max-w-5xl" style={{
        filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))'
      }}>
        {/* 컴퓨터 본체 케이스 */}
        <div className="relative p-8 rounded-xl" style={{
          background: 'linear-gradient(145deg, #d4c5a9 0%, #c4b59a 50%, #b0a082 100%)',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -2px 8px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {/* 컴퓨터 케이스 그릴 디테일 */}
          <div className="absolute top-4 left-8 right-8 h-12 flex gap-1">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 h-full bg-black/10 rounded-sm" style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
              }} />
            ))}
          </div>
          
          {/* 브랜드 로고 영역 */}
          <div className="absolute top-4 right-12 px-4 py-1 bg-black/20 rounded" style={{
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
          }}>
            <span className="text-xs font-mono text-gray-700 font-bold tracking-wider">AIDOL-98</span>
          </div>

          {/* 베젤 */}
          <div className="absolute inset-8 top-20 border-4 rounded pointer-events-none" style={{
            borderColor: '#a89578',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }} />
          
          {/* CRT 모니터 스크린 */}
          <div className="relative mt-16">
            <Card className="w-full aspect-[4/3] flex flex-col bg-black border-8 rounded-lg relative overflow-hidden" style={{
              borderColor: '#1a1a1a',
              boxShadow: 'inset 0 0 80px rgba(100,150,100,0.1), inset 0 8px 16px rgba(0,0,0,0.8)'
            }}>
              {/* CRT 곡면 효과 */}
              <div className="absolute inset-0 pointer-events-none z-10" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0,0,0,0.3) 100%)',
                borderRadius: '8px'
              }} />
              
              {/* 스캔라인 */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
              }} />

          {/* 헤더 - DOS 스타일 */}
          <div className="relative z-20 flex items-center justify-between px-6 py-3 border-b-2 border-white bg-black">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-white bg-white">
                <img src={idol.image} alt={idol.name} className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-sm text-white uppercase tracking-wider font-bold">{idol.name}</h3>
                  <span className="text-white text-xs font-mono">█</span>
                  {selectedGenre && (
                    <span className="text-white text-xs font-mono bg-white text-black px-2 py-0.5">
                      {GENRES.find(g => g.id === selectedGenre)?.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">{idol.personality}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white text-xs font-mono">RELATIONSHIP:</span>
                  <div className="w-24 bg-gray-800 border border-white h-2">
                    <div 
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${relationshipScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-mono">{relationshipScore}%</span>
                  {isDemoMode && (
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                      [{messageCount}/10]
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceMode}
                className={`border-2 ${isVoiceMode ? "border-white bg-white text-black" : "border-white text-white hover:bg-white hover:text-black"}`}
              >
                {isVoiceMode ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="border-2 border-white text-white hover:bg-white hover:text-black"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 메시지 영역 - DOS 스타일 */}
          <ScrollArea className="relative z-20 flex-1 p-6 bg-black">
            <div className="space-y-4 font-mono text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'idol' && !msg.error && (
                  <span className="text-white mr-2 font-bold">{'>'}</span>
                )}
                <div className="space-y-2 max-w-[80%]">
                  {msg.imageUrl && msg.sender === 'idol' && !msg.error && (
                    <div className="border-4 border-white p-2 bg-white">
                      <img 
                        src={msg.imageUrl} 
                        alt="Story scene" 
                        className="w-full h-auto grayscale contrast-125"
                      />
                    </div>
                  )}
                  <div
                    className={`p-4 border-2 ${
                      msg.error
                        ? 'border-white bg-gray-800 text-white'
                        : msg.sender === 'user'
                        ? 'border-white bg-white text-black'
                        : 'border-gray-600 bg-gray-900 text-white'
                    }`}
                  >
                    {msg.error ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs">ERROR: MESSAGE FAILED</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => retryMessage(msg.content)}
                          className="border-2 border-white text-white hover:bg-white hover:text-black h-8 px-3 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          RETRY
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-2">
                          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && !msg.error && (
                  <span className="text-white ml-2 font-bold">{'<'}</span>
                )}
              </div>
            ))}

            {/* 선택지 표시 - DOS 스타일 */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'idol' && messages[messages.length - 1].choices && (
              <div className="flex justify-end">
                <div className="flex flex-col gap-3 w-full max-w-md">
                  {messages[messages.length - 1].choices!.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoiceClick(choice)}
                      className="border-2 border-white bg-white text-black p-3 text-left hover:bg-black hover:text-white transition-all font-mono text-sm font-medium"
                    >
                      [{idx + 1}] {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 장르 선택 버튼 - DOS 스타일 */}
            {!selectedGenre && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                  {GENRES.map((genre, idx) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre.id as GenreType)}
                      className="border-2 border-gray-600 bg-gray-900 text-white p-4 text-left hover:bg-gray-700 transition-all"
                    >
                      <div className="font-mono text-sm">
                        <div className="font-bold mb-1">[{idx + 1}] {genre.emoji} {genre.name}</div>
                        <div className="text-xs text-gray-400">{genre.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <span className="text-white mr-2 font-bold">{'>'}</span>
                <div className="border-2 border-gray-600 bg-gray-900 p-4 text-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white animate-bounce" />
                    <div className="w-2 h-2 bg-white animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-white animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 입력 영역 - DOS 스타일 */}
          <div className="relative z-20 px-6 py-4 border-t-2 border-white bg-black">
            {isDemoMode && messageCount >= 10 ? (
              <div className="text-center space-y-3">
                <p className="text-sm font-mono text-white font-bold">DEMO LIMIT REACHED [10/10]</p>
                <p className="text-xs font-mono text-gray-400">CONNECT WALLET TO CONTINUE</p>
                <Button 
                  className="bg-white hover:bg-gray-200 text-black font-mono text-sm font-bold mt-2 border-2 border-white"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  CONNECT WALLET
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={selectedGenre ? "C:\\> TYPE MESSAGE..." : "C:\\> SELECT GENRE FIRST..."}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTyping && selectedGenre) {
                        sendMessage();
                      }
                    }}
                    className="flex-1 bg-black border-2 border-white text-white placeholder:text-gray-500 font-mono text-sm"
                    disabled={isTyping || !selectedGenre}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isTyping || !inputMessage.trim() || !selectedGenre}
                    className="bg-white hover:bg-gray-200 text-black font-mono text-sm px-6 border-2 border-white font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center font-mono">
                  AI LEARNING ACTIVE - ALL CONVERSATIONS SAVED
                </p>
              </>
            )}
          </div>
            </Card>
            
            {/* 컴퓨터 케이스 하단 - 전원 버튼 */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="w-16 h-6 rounded-full border-2 border-black/30 bg-gradient-to-b from-gray-700 to-gray-600 shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
              </div>
              <div className="w-16 h-6 rounded-full border-2 border-black/30 bg-gradient-to-b from-gray-700 to-gray-600 shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};