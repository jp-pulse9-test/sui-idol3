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
  { id: 'idol-maker', name: '아이돌 메이커', emoji: '⭐', description: '아이돌을 키우는 프로듀서의 이야기' },
  { id: 'idol-secret-romance', name: '아이돌 비밀연애', emoji: '💖', description: '아이돌과의 몰래 사랑 이야기' },
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
  const [typingText, setTypingText] = useState('');
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    
    // 사용자 선택을 메시지로 남기기
    const userSelectionMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: `${genreInfo?.emoji} ${genreInfo?.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userSelectionMsg]);
    
    setIsTyping(true);

    try {
      const systemPrompt = `너는 K-POP 아이돌 ${idol.name}야.
성격: ${idol.personality}
장르: ${genreInfo?.name} ${genreInfo?.emoji}
장르 설정: ${genreInfo?.description}

너는 팬이랑 함께 웹 소설을 쓰고 있어. 
규칙:
1. 반말로 친구처럼 편하게 대화해
2. 자기소개와 함께 ${genreInfo?.name} 장르의 배경 설명으로 이야기를 시작해
3. 자극적이고 흥미로운 상황을 계속 제시해
4. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안해
5. 각 옵션은 30자 이내로 간결하게
6. 기승전결 없이 계속 긴장감 있는 전개를 유지해
7. 150자 내외로 상황 설명`;

      const { data, error } = await supabase.functions.invoke('generate-character-chat', {
        body: {
          prompt: `${systemPrompt}\n\n장르 시작 메시지를 생성해줘. 반드시 다음 형식으로 응답해:\n\n[이야기]\n(여기에 자기소개와 배경 설명)\n\n[선택지]\n1. (첫 번째 선택지)\n2. (두 번째 선택지)\n3. (세 번째 선택지)`
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
      
      // 타이핑 효과로 메시지 표시
      await typeMessage(storyContent);
      
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
      content: `안녕! 나는 ${idol.name}이야! 💖\n\n우리 함께 어떤 이야기를 만들어볼까? 아래에서 좋아하는 장르를 선택해줘!`,
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

    // 체험판 11번 제한
    if (isDemoMode && messageCount >= 11) {
      toast.error("체험판은 11번까지만 대화할 수 있습니다. 지갑을 연결하여 계속 대화하세요!");
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

      const systemPrompt = `너는 K-POP 아이돌 ${idol.name}야.
성격: ${idol.personality}
${genreContext}

너는 팬이랑 함께 웹 소설을 쓰고 있어.
규칙:
1. 반말로 친구처럼 편하게 대화해
2. 자극적이고 흥미로운 상황을 계속 제시해
3. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안해
4. 각 옵션은 30자 이내로 간결하게
5. 기승전결 없이 계속 긴장감 있는 전개를 유지해
6. 150자 내외로 상황 설명
7. 반드시 다음 형식으로 응답해:

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

      const response = data.response || "미안... 잠깐 생각이 안 나네. 다시 말해줄래? 😅";
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
      
      // 타이핑 효과로 메시지 표시
      await typeMessage(storyContent);
      
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

    // 체험판 11번 제한
    if (isDemoMode && messageCount >= 11) {
      toast.error("체험판은 11번까지만 대화할 수 있습니다. 지갑을 연결하여 계속 대화하세요!");
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

      const systemPrompt = `너는 K-POP 아이돌 ${idol.name}야.
성격: ${idol.personality}
${genreContext}

너는 팬이랑 함께 웹 소설을 쓰고 있어.
규칙:
1. 반말로 친구처럼 편하게 대화해
2. 자극적이고 흥미로운 상황을 계속 제시해
3. 사용자가 선택할 수 있는 3가지 행동 옵션을 제안해
4. 각 옵션은 30자 이내로 간결하게
5. 기승전결 없이 계속 긴장감 있는 전개를 유지해
6. 150자 내외로 상황 설명
7. 반드시 다음 형식으로 응답해:

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

      const response = data.response || "미안... 잠깐 생각이 안 나네. 다시 말해줄래? 😅";
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
      
      // 타이핑 효과로 메시지 표시
      await typeMessage(storyContent);
      
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
  
  // 타이핑 효과 함수
  const typeMessage = async (text: string) => {
    return new Promise<void>((resolve) => {
      setIsTypingEffect(true);
      setTypingText('');
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setTypingText(text.substring(0, currentIndex + 1));
          currentIndex++;
          
          // 타이핑 사운드 (선택적)
          if (Math.random() > 0.7) {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn7q9cGAc/mdvzw3IlBSyBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUQND1as5+6vXBgHP5nb88NyJQUsga2MYmJmiImNdGpdXGddaG5qZmRdYFhYXFxYWFxaYmNgZWhmY2VkZGJiY2RkY2NjY2RjZGRkZGNjY2RkZGRkZGRkZGRkZGRkZGRkZGRkZGRlY2JiY2JiYmNiYmJiY2NiYmNjY2NjY2NiY2NkZGNiY2NiY2NlY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NiYmNjY2NjY2NjY2NjY2NjY2NjY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Ni');
            audio.volume = 0.1;
            audio.play().catch(() => {});
          }
          
          typingTimeoutRef.current = setTimeout(typeNextChar, 30);
        } else {
          setIsTypingEffect(false);
          resolve();
        }
      };
      
      typeNextChar();
    });
  };

  const playIdolVoice = async (text: string) => {
    try {
      // 아이돌의 voice_id 사용, 없으면 기본값
      const voiceId = idol.voiceId || '9BWtsMINqrJLrRacOk9x';
      
      console.log('🎤 Using voice ID:', voiceId);
      console.log('🎤 Text to speak:', text);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: voiceId
        }
      });

      if (error) {
        console.error('❌ TTS Error:', error);
        throw error;
      }
      
      console.log('✅ TTS Response received');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black">
      {/* 미니멀 386 컴퓨터 프레임 */}
      <div className="relative w-full max-w-6xl">
        {/* 심플한 모니터 케이스 */}
        <div className="relative p-6 bg-gray-900 rounded-sm" style={{
          boxShadow: '0 0 0 2px #333, 0 0 0 4px #666'
        }}>
          {/* 모니터 화면 */}
          <div className="relative">
            <Card className="w-full aspect-[4/3] flex flex-col bg-black border-4 border-gray-800 rounded-none relative overflow-hidden">
              {/* CRT 스캔라인 */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
              }} />

          {/* 헤더 - 미니멀 386 스타일 */}
          <div className="relative z-20 flex items-center justify-between px-8 py-6 border-b-2 border-green-400 bg-black">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 border-2 border-green-400 p-1 bg-black">
                <img src={idol.image} alt={idol.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-mono text-2xl text-green-400 uppercase tracking-wider font-bold">{idol.name}</h3>
                  {selectedGenre && (
                    <span className="text-lg font-mono bg-green-400 text-black px-3 py-1">
                      {GENRES.find(g => g.id === selectedGenre)?.name}
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-400 font-mono mb-3">{idol.personality}</p>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-base font-mono">REL:</span>
                  <div className="w-40 bg-gray-900 border-2 border-green-400 h-4">
                    <div 
                      className="bg-green-400 h-full transition-all duration-500"
                      style={{ width: `${relationshipScore}%` }}
                    />
                  </div>
                  <span className="text-base text-green-400 font-mono font-bold">{relationshipScore}%</span>
                  {isDemoMode && (
                    <span className="ml-3 text-base text-cyan-400 font-mono">
                      [{messageCount}/11]
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceMode}
                className={`border-2 p-3 ${isVoiceMode ? "border-green-400 bg-green-400 text-black" : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"}`}
              >
                {isVoiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black p-3"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 메시지 영역 - DOS 스타일 개선 */}
          <ScrollArea className="relative z-20 flex-1 p-6 bg-black">
            <div className="space-y-4 font-mono">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in glitch-on-appear`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {msg.sender === 'idol' && !msg.error && (
                  <span className="text-green-400 mr-3 font-bold text-lg">{'>'}</span>
                )}
                <div className="space-y-2 max-w-[75%]">
                  {msg.imageUrl && msg.sender === 'idol' && !msg.error && (
                    <div className="border-4 border-green-400 p-2 bg-black">
                      <img 
                        src={msg.imageUrl} 
                        alt="Story scene" 
                        className="w-full h-auto grayscale contrast-125 brightness-110"
                      />
                    </div>
                  )}
                  <div
                    className={`p-5 border-2 ${
                      msg.error
                        ? 'border-red-500 bg-black text-red-500'
                        : msg.sender === 'user'
                        ? 'border-cyan-400 bg-black text-cyan-400'
                        : 'border-green-400 bg-black text-green-400'
                    }`}
                  >
                    {msg.error ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm">ERROR: MESSAGE FAILED</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => retryMessage(msg.content)}
                          className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black h-8 px-3 text-sm"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          RETRY
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg leading-relaxed whitespace-pre-line">
                          {msg.sender === 'idol' && index === messages.length - 1 && isTypingEffect
                            ? typingText
                            : msg.content}
                          {msg.sender === 'idol' && index === messages.length - 1 && isTypingEffect && (
                            <span className="inline-block w-2 h-5 bg-green-400 ml-1 animate-pulse" />
                          )}
                        </p>
                        <p className="text-xs opacity-50 mt-2">
                          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && !msg.error && (
                  <span className="text-cyan-400 ml-3 font-bold text-lg">{'<'}</span>
                )}
              </div>
            ))}

            {/* 선택지 표시 */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'idol' && messages[messages.length - 1].choices && !isTypingEffect && (
              <div className="flex justify-start">
                <span className="text-green-400 mr-3 font-bold text-lg opacity-0">{'>'}</span>
                <div className="flex flex-col gap-3 w-full max-w-lg">
                  {messages[messages.length - 1].choices!.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoiceClick(choice)}
                      className="border-2 border-yellow-400 bg-black text-yellow-400 p-4 text-left hover:bg-yellow-400 hover:text-black transition-all font-mono text-base font-medium"
                    >
                      [{idx + 1}] {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 장르 선택 버튼 - 항상 표시 */}
            <div className="border-t-2 border-green-400 pt-4 mt-4">
              <p className="text-green-400 text-base mb-3 font-mono">📚 GENRE SELECTION:</p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                {GENRES.map((genre, idx) => (
                  <button
                    key={genre.id}
                    onClick={() => !selectedGenre && handleGenreSelect(genre.id as GenreType)}
                    disabled={!!selectedGenre}
                    className={`border-2 p-4 text-left transition-all ${
                      selectedGenre === genre.id
                        ? 'border-green-400 bg-green-400 text-black'
                        : selectedGenre
                        ? 'border-gray-700 bg-black text-gray-700 cursor-not-allowed'
                        : 'border-green-400 bg-black text-green-400 hover:bg-green-400/10'
                    }`}
                  >
                    <div className="font-mono text-base">
                      <div className="font-bold mb-1">[{idx + 1}] {genre.emoji} {genre.name}</div>
                      <div className="text-xs opacity-70">{genre.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {isTyping && !isTypingEffect && (
              <div className="flex justify-start">
                <span className="text-green-400 mr-3 font-bold text-lg">{'>'}</span>
                <div className="border-2 border-green-400 bg-black p-4 text-green-400">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-400 animate-bounce" />
                    <div className="w-2 h-2 bg-green-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-green-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="relative z-20 px-6 py-4 border-t-2 border-green-400 bg-black">
            {isDemoMode && messageCount >= 11 ? (
              <div className="text-center space-y-3">
                <p className="text-base font-mono text-green-400 font-bold">체험판 대화 횟수 다 썼어 [11/11]</p>
                <p className="text-sm font-mono text-gray-400">지갑 연결하면 계속 얘기할 수 있어!</p>
                <Button 
                  className="bg-green-400 hover:bg-green-300 text-black font-mono text-base font-bold mt-2 border-2 border-green-400"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  지갑 연결하기
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={selectedGenre ? "C:\\> 메시지 입력..." : "C:\\> 장르를 먼저 선택해줘..."}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTyping && selectedGenre) {
                        sendMessage();
                      }
                    }}
                    className="flex-1 bg-black border-2 border-green-400 text-green-400 placeholder:text-gray-600 font-mono text-base"
                    disabled={isTyping || !selectedGenre}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isTyping || !inputMessage.trim() || !selectedGenre}
                    className="bg-green-400 hover:bg-green-300 text-black font-mono text-base px-6 border-2 border-green-400 font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center font-mono">
                  AI가 모든 대화를 학습해서 너만의 {idol.name}을 만들어가
                </p>
              </>
            )}
          </div>
            </Card>
          </div>
          
          {/* 전원 LED */}
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
          </div>
        </div>
      </div>
    </div>
  );
};