import { useState, useEffect, useRef } from 'react';
import { BRANCHES } from '@/data/branches';
import { getMissionsByBranch } from '@/data/salvationMissions';
import { useEpisodeStory } from '@/hooks/useEpisodeStory';
import { Branch, SalvationMission } from '@/types/branch';
import { toast } from 'sonner';

type ChatMessage =
  | { type: 'system'; content: string; timestamp: Date }
  | { type: 'branch-select'; branches: Branch[]; timestamp: Date }
  | { type: 'mission-select'; missions: SalvationMission[]; timestamp: Date }
  | { type: 'user'; content: string; timestamp: Date }
  | { type: 'idol'; content: string; timestamp: Date; isHighlight?: boolean; imageUrl?: string }
  | { type: 'completion'; vriReward: number; timestamp: Date };

type GameMode = 'branch' | 'mission' | 'episode';

export const PlayChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMode, setCurrentMode] = useState<GameMode>('branch');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedMission, setSelectedMission] = useState<SalvationMission | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 타이핑 효과 상태
  const [typingText, setTypingText] = useState('');
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [skipTyping, setSkipTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pull-to-refresh 상태
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);

  // 선택된 아이돌 (localStorage에서 가져오기)
  const selectedIdol = JSON.parse(localStorage.getItem('selectedIdol') || 'null');

  // 사운드 효과 함수
  const playTypeSound = () => {
    if (Math.random() > 0.7) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  };

  const playClickSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  // 타이핑 효과 함수
  const typeMessage = async (text: string, messageIndex: number) => {
    return new Promise<void>((resolve) => {
      setIsTypingEffect(true);
      setCurrentTypingIndex(messageIndex);
      setTypingText('');
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (skipTyping) {
          setTypingText(text);
          setIsTypingEffect(false);
          setCurrentTypingIndex(-1);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          resolve();
          return;
        }

        if (currentIndex < text.length) {
          setTypingText(text.substring(0, currentIndex + 1));
          currentIndex++;
          
          playTypeSound();
          
          typingTimeoutRef.current = setTimeout(typeNextChar, 30);
        } else {
          setIsTypingEffect(false);
          setCurrentTypingIndex(-1);
          resolve();
        }
      };
      
      typeNextChar();
    });
  };

  // 에피소드 스토리 훅
  const {
    messages: episodeMessages,
    isLoading: isEpisodeLoading,
    sendMessage: sendEpisodeMessage,
    resetStory,
  } = useEpisodeStory(
    selectedMission
      ? {
          id: selectedMission.id,
          title: selectedMission.title,
          description: selectedMission.description,
          category: selectedMission.valueType,
          difficulty: selectedMission.difficulty,
        }
      : { id: '', title: '', description: '', category: '', difficulty: '' },
    selectedIdol || { name: '아이돌', personality: '', persona_prompt: '', image: '' }
  );

  // 초기 메시지 로드 (타이핑 효과 적용)
  useEffect(() => {
    const initMessages = async () => {
      const msg1 = '⚡ 2028 구원 작전 시스템 부팅 완료';
      const msg2 = '지구를 구할 타임라인을 선택하세요:';
      
      setMessages([{ type: 'system', content: msg1, timestamp: new Date() }]);
      await typeMessage(msg1, 0);
      
      setMessages((prev) => [...prev, { type: 'system', content: msg2, timestamp: new Date() }]);
      await typeMessage(msg2, 1);
      
      setMessages((prev) => [...prev, { type: 'branch-select', branches: BRANCHES, timestamp: new Date() }]);
    };
    
    initMessages();
  }, []);

  // 에피소드 메시지를 채팅 히스토리에 추가
  useEffect(() => {
    if (currentMode === 'episode' && episodeMessages.length > 0) {
      const lastEpisodeMsg = episodeMessages[episodeMessages.length - 1];
      setMessages((prev) => {
        // 중복 방지: 마지막 메시지가 같은 타임스탬프면 무시
        const lastChatMsg = prev[prev.length - 1];
        if (
          lastChatMsg &&
          lastChatMsg.type === (lastEpisodeMsg.role === 'assistant' ? 'idol' : 'user') &&
          lastChatMsg.timestamp.getTime() === lastEpisodeMsg.timestamp.getTime()
        ) {
          return prev;
        }

        return [
          ...prev,
          {
            type: lastEpisodeMsg.role === 'assistant' ? 'idol' : 'user',
            content: lastEpisodeMsg.content,
            timestamp: lastEpisodeMsg.timestamp,
            isHighlight: lastEpisodeMsg.isHighlight,
            imageUrl: lastEpisodeMsg.imageUrl,
          } as ChatMessage,
        ];
      });
    }
  }, [episodeMessages, currentMode]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TV Static 노이즈 효과
  useEffect(() => {
    if (messages.length === 0) return;

    const playStaticSound = () => {
      const randomDelay = Math.random() * 50000 + 10000;
      
      const timeout = setTimeout(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(Math.random() * 1000 + 500, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        playStaticSound();
      }, randomDelay);

      return () => clearTimeout(timeout);
    };

    const cleanup = playStaticSound();
    return cleanup;
  }, [messages.length]);

  // Pull-to-Refresh 기능
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const scrollElement = document.querySelector('.messages-container');
      if (!scrollElement) return;
      
      const scrollTop = scrollElement.scrollTop;
      if (scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scrollElement = document.querySelector('.messages-container');
      if (!scrollElement || touchStartY.current === 0) return;
      
      const scrollTop = scrollElement.scrollTop;
      if (scrollTop === 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - touchStartY.current;
        
        if (distance > 0) {
          setPullDistance(Math.min(distance, 100));
          if (distance > 80) {
            setIsPulling(true);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > 80) {
        setSkipTyping(true);
        toast.info("⚡ 빠른 모드 활성화");
      }
      setIsPulling(false);
      setPullDistance(0);
      touchStartY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance]);

  const handleBranchSelect = async (branch: Branch) => {
    playClickSound();
    
    if (!branch.isUnlocked) {
      const warningMsg = `⚠️ ${branch.name}은(는) 아직 잠겨있습니다. VRI ${branch.requiredVRI}가 필요합니다.`;
      const currentLength = messages.length;
      setMessages((prev) => [...prev, { type: 'system', content: warningMsg, timestamp: new Date() }]);
      await typeMessage(warningMsg, currentLength);
      return;
    }

    setSelectedBranch(branch);
    const missions = getMissionsByBranch(branch.id);
    
    const userMsg = `> ${branch.name} 선택`;
    setMessages((prev) => [...prev, { type: 'user', content: userMsg, timestamp: new Date() }]);
    
    const systemMsg = `${branch.year}년 타임라인 로드 완료. 미션을 선택하세요:`;
    const currentLength = messages.length + 1;
    setMessages((prev) => [...prev, { type: 'system', content: systemMsg, timestamp: new Date() }]);
    await typeMessage(systemMsg, currentLength);
    
    setMessages((prev) => [...prev, { type: 'mission-select', missions, timestamp: new Date() }]);
    setCurrentMode('mission');
  };

  const handleMissionSelect = async (mission: SalvationMission) => {
    playClickSound();
    
    setSelectedMission(mission);
    
    const userMsg = `> [${mission.title}] 선택`;
    setMessages((prev) => [...prev, { type: 'user', content: userMsg, timestamp: new Date() }]);
    
    const systemMsg = '미션 시작. 아이돌과의 대화를 시작합니다...';
    const currentLength = messages.length + 1;
    setMessages((prev) => [...prev, { type: 'system', content: systemMsg, timestamp: new Date() }]);
    await typeMessage(systemMsg, currentLength);
    
    setCurrentMode('episode');
    resetStory();
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isEpisodeLoading) return;

    sendEpisodeMessage(inputMessage);
    setInputMessage('');
  };

  const handleBackToBranch = () => {
    setCurrentMode('branch');
    setSelectedBranch(null);
    setSelectedMission(null);
    setMessages([
      { type: 'system', content: '⚡ 타임라인 선택 화면으로 돌아갑니다', timestamp: new Date() },
      { type: 'branch-select', branches: BRANCHES, timestamp: new Date() },
    ]);
  };

  const handleBackToMission = () => {
    if (!selectedBranch) return;
    setCurrentMode('mission');
    setSelectedMission(null);
    const missions = getMissionsByBranch(selectedBranch.id);
    setMessages((prev) => [
      ...prev,
      { type: 'system', content: '미션 선택 화면으로 돌아갑니다', timestamp: new Date() },
      { type: 'mission-select', missions, timestamp: new Date() },
    ]);
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    switch (msg.type) {
      case 'system':
        return (
          <div key={index} className="retro-terminal-box mb-3 animate-fade-in">
            <p className="text-teal-600 font-mono text-sm retro-text-glow">
              <span className="text-emerald-600">SYSTEM:</span>{' '}
              {isTypingEffect && index === currentTypingIndex ? typingText : msg.content}
              {isTypingEffect && index === currentTypingIndex && (
                <span className="typing-cursor">▋</span>
              )}
            </p>
          </div>
        );

      case 'branch-select':
        return (
          <div key={index} className="retro-terminal-box mb-3">
            <p className="text-teal-600 font-mono text-sm mb-3 retro-text-glow">타임라인 선택:</p>
            <div className="space-y-2">
              {msg.branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  disabled={!branch.isUnlocked}
                  className={`w-full text-left px-4 py-3 border transition-all font-mono text-sm
                    ${
                      branch.isUnlocked
                        ? 'border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-900/20 text-green-600'
                        : 'border-gray-700 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="text-emerald-600">▶</span> [{branch.year}] {branch.name}
                    </span>
                    {!branch.isUnlocked && (
                      <span className="text-xs text-gray-500">🔒 VRI {branch.requiredVRI}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'mission-select':
        return (
          <div key={index} className="retro-terminal-box mb-3">
            <p className="text-teal-600 font-mono text-sm mb-3 retro-text-glow">미션 선택:</p>
            <div className="space-y-2">
              {msg.missions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className="w-full text-left px-4 py-3 border border-emerald-600/30 
                           hover:border-emerald-600 hover:bg-emerald-900/20 
                           transition-all font-mono text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">
                      <span className="text-emerald-600">▶</span> {mission.title}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-emerald-500/50 text-xs">{mission.difficulty}</span>
                      <span className="text-teal-600 text-xs">+{mission.vriReward} VRI</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleBackToBranch}
              className="w-full mt-3 px-4 py-2 border border-gray-600 text-gray-400 
                       hover:border-emerald-600 hover:text-green-600 font-mono text-xs"
            >
              ← 타임라인 선택으로
            </button>
          </div>
        );

      case 'user':
        return (
          <div key={index} className="retro-terminal-box bg-emerald-900/10 ml-12 mb-3">
            <p className="text-green-600 font-mono text-sm">{msg.content}</p>
          </div>
        );

      case 'idol':
        return (
          <div key={index} className="retro-terminal-box bg-emerald-900/10 mb-3 animate-fade-in">
            <div className="flex items-start gap-3">
              {selectedIdol?.image && (
                <img
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-10 h-10 rounded-full border border-emerald-600/50"
                />
              )}
              <div className="flex-1">
                <p className="text-emerald-600 font-mono text-xs mb-1">{selectedIdol?.name || '아이돌'}</p>
                <p className="text-emerald-500 font-mono text-sm leading-relaxed retro-text-glow">
                  {isTypingEffect && index === currentTypingIndex ? typingText : msg.content}
                  {isTypingEffect && index === currentTypingIndex && (
                    <span className="typing-cursor">▋</span>
                  )}
                </p>
                {msg.imageUrl && !isTypingEffect && (
                  <img
                    src={msg.imageUrl}
                    alt="Memory"
                    className="mt-3 border border-emerald-600/30 max-w-full"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div key={index} className="retro-terminal-box border-emerald-600 bg-emerald-900/30 mb-3">
            <div className="text-center">
              <p className="text-emerald-600 font-mono text-lg mb-2">✓ 미션 완료!</p>
              <div className="space-y-1 text-teal-600 font-mono text-sm">
                <p>VRI 보상: +{msg.vriReward}</p>
              </div>
              <button
                onClick={handleBackToMission}
                className="mt-4 px-6 py-2 border border-emerald-600 text-green-600 
                         hover:bg-emerald-900/40 hover:text-emerald-500 font-mono text-sm"
              >
                다른 미션 선택
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="retro-terminal-page min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="retro-terminal-box m-4 mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-teal-600 font-mono text-lg retro-text-glow">
            <span className="text-emerald-600">{'>'}</span> 2028 구원 작전
          </h1>
          <div className="text-xs font-mono text-emerald-500/70">
            {currentMode === 'branch' && 'TIMELINE SELECT'}
            {currentMode === 'mission' && `${selectedBranch?.year} / MISSION SELECT`}
            {currentMode === 'episode' && 'EPISODE PLAY'}
          </div>
        </div>
      </div>

      {/* Pull-to-Refresh 표시 */}
      {isPulling && pullDistance > 50 && (
        <div className="text-center py-2 text-emerald-500 font-mono text-sm retro-text-glow animate-pulse">
          {pullDistance > 80 ? '↓ 놓아서 빠른 모드 활성화' : '↓ 당겨서 새로고침'}
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="messages-container flex-1 overflow-y-auto px-4 pb-24">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {isEpisodeLoading && (
          <div className="retro-terminal-box mb-3 bg-emerald-900/10 animate-pulse">
            <p className="text-teal-600 font-mono text-sm retro-text-glow">
              <span className="text-emerald-600">SYSTEM:</span> 응답 생성 중
              <span className="typing-cursor">▋</span>
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input 영역 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-emerald-600/30">
        {currentMode === 'episode' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="당신의 행동이나 응답을 입력하세요..."
              disabled={isEpisodeLoading}
              className="flex-1 bg-black border border-emerald-600/30 text-emerald-500 
                       font-mono px-4 py-2 focus:border-emerald-600 focus:outline-none
                       disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isEpisodeLoading || !inputMessage.trim()}
              className="px-6 py-2 border border-emerald-600 text-green-600 
                       hover:bg-emerald-900/30 hover:text-emerald-500 font-mono
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEpisodeLoading ? '...' : 'SEND'}
            </button>
            <button
              onClick={handleBackToMission}
              className="px-4 py-2 border border-gray-600 text-gray-400 
                       hover:border-emerald-600 hover:text-green-600 font-mono text-sm"
            >
              ← 종료
            </button>
          </div>
        ) : (
          <p className="text-center text-emerald-500/50 font-mono text-sm">
            위 버튼을 클릭하여 선택하세요
          </p>
        )}
      </div>
    </div>
  );
};
