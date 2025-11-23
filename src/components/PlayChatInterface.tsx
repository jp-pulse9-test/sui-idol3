import { useState, useEffect, useRef } from 'react';
import { BRANCHES } from '@/data/branches';
import { getMissionsByBranch } from '@/data/salvationMissions';
import { getScenesByMissionId } from '@/data/missionScenes';
import { useEpisodeStory } from '@/hooks/useEpisodeStory';
import { useFreeInputTickets } from '@/hooks/useFreeInputTickets';
import { Branch, SalvationMission } from '@/types/branch';
import { toast } from 'sonner';

type ChatMessage =
  | { type: 'system'; content: string; timestamp: Date }
  | { type: 'branch-select'; branches: Branch[]; timestamp: Date }
  | { type: 'mission-select'; missions: SalvationMission[]; timestamp: Date }
  | { type: 'idol-profile'; idol: { name: string; image: string; personality?: string; persona_prompt?: string }; timestamp: Date }
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
  const [isFreeInputMode, setIsFreeInputMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { tickets, useTicket } = useFreeInputTickets();
  
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
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn7q9cGAc/mdvzw3IlBSyBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUQND1as5+6vXBgHP5nb88NyJQUsga2MYmJmiImNdGpdXGddaG5qZmRdYFhYXFxYWFxaYmNgZWhmY2VkZGJiY2RkY2NjY2RjZGRkZGNjY2RkZGRkZGRkZGRkZGRkZGRkZGRkZGRlY2JiY2JiYmNiYmJiY2NiYmNjY2NjY2NiY2NkZGNiY2NiY2NlY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NiYmNjY2NjY2NjY2NjY2NjY2NjY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Ni');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  };

  const playClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn7q9cGAc/mdvzw3IlBSyBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUQND1as5+6vXBgHP5nb88NyJQUsga2MYmJmiImNdGpdXGddaG5qZmRdYFhYXFxYWFxaYmNgZWhmY2VkZGJiY2RkY2NjY2RjZGRkZGNjY2RkZGRkZGRkZGRkZGRkZGRkZGRkZGRlY2JiY2JiYmNiYmJiY2NiYmNjY2NjY2NiY2NkZGNiY2NiY2NlY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NiYmNjY2NjY2NjY2NjY2NjY2NjY2RjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Ni');
    audio.volume = 0.15;
    audio.play().catch(() => {});
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
      : { 
          id: 'default-mission', 
          title: '자유 대화', 
          description: '아이돌과 자유롭게 대화하세요', 
          category: 'casual', 
          difficulty: 'easy' 
        },
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
    
    const idolName = selectedIdol?.name || '아이돌';
    const systemMsg = `미션 시작. ${idolName}과의 대화를 시작합니다...`;
    const currentLength = messages.length + 1;
    setMessages((prev) => [...prev, { type: 'system', content: systemMsg, timestamp: new Date() }]);
    await typeMessage(systemMsg, currentLength);
    
    // Add idol profile card
    setMessages((prev) => [...prev, { 
      type: 'idol-profile', 
      idol: selectedIdol || { name: '아이돌', image: '', personality: '', persona_prompt: '' },
      timestamp: new Date() 
    } as any]);
    
    setCurrentMode('episode');
    resetStory();
    
    // Start conversation after a delay to ensure proper context
    setTimeout(() => {
      // Send initial greeting request to AI
      sendEpisodeMessage('[SYSTEM: Start conversation and greet the user]');
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isEpisodeLoading) return;

    sendEpisodeMessage(inputMessage);
    setInputMessage('');
    setIsFreeInputMode(false); // Reset free input mode after sending
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

  // 선택지 파싱 함수
  const parseChoices = (content: string): { text: string; choices: string[] } | null => {
    if (!content.includes('[선택지]')) return null;
    
    const [mainText, choicesText] = content.split('[선택지]');
    const choicePattern = /[1-9]️⃣\s*(.+?)(?=\n[1-9]️⃣|$)/gs;
    const matches = [...choicesText.matchAll(choicePattern)];
    const choices = matches.map(m => m[1].trim());
    
    return choices.length > 0 ? { text: mainText.trim(), choices } : null;
  };

  // 선택지 클릭 핸들러
  const handleChoiceSelect = (choice: string, choiceNumber: number) => {
    playClickSound();
    if (isEpisodeLoading) return;
    
    const message = `${choiceNumber}번 선택: ${choice}`;
    sendEpisodeMessage(message);
    setIsFreeInputMode(false);
  };

  // 자유 입력권 사용 핸들러
  const handleUseFreeInputTicket = () => {
    if (useTicket()) {
      setIsFreeInputMode(true);
      playClickSound();
      toast.success("🎫 자유 입력권 사용! 원하는 답변을 입력하세요.");
    } else {
      toast.error("자유 입력권이 부족합니다. Settings에서 구매하세요.");
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    switch (msg.type) {
      case 'system':
        return (
          <div key={index} className="retro-terminal-box mb-3 animate-fade-in">
            <p className="font-mono text-sm" style={{ color: 'var(--terminal-green)' }}>
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
            <p className="font-mono text-sm mb-3" style={{ color: 'var(--terminal-green)' }}>타임라인 선택:</p>
            <div className="space-y-2">
              {msg.branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  disabled={!branch.isUnlocked}
                  className={`w-full text-left px-4 py-3 border transition-all font-mono text-sm
                    ${
                      branch.isUnlocked
                        ? 'border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-900/20'
                        : 'border-gray-700 text-gray-600 cursor-not-allowed'
                    }`}
                  style={branch.isUnlocked ? { color: 'var(--terminal-green)' } : {}}
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
            <p className="font-mono text-sm mb-3" style={{ color: 'var(--terminal-green)' }}>미션 선택:</p>
            <div className="space-y-2">
              {msg.missions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className="w-full text-left px-4 py-3 border border-emerald-600/30 
                           hover:border-emerald-600 hover:bg-emerald-900/20 
                           transition-all font-mono text-sm"
                  style={{ color: 'var(--terminal-green)' }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="text-emerald-600">▶</span> {mission.title}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-emerald-500/50 text-xs">{mission.difficulty}</span>
                      <span className="text-xs" style={{ color: 'var(--terminal-green)' }}>+{mission.vriReward} VRI</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleBackToBranch}
              className="w-full mt-3 px-4 py-2 border border-gray-600 text-gray-400 
                       hover:border-emerald-600 font-mono text-xs"
              style={{ color: 'var(--terminal-green)' }}
            >
              ← 타임라인 선택으로
            </button>
          </div>
        );

      case 'idol-profile':
        return (
          <div key={index} className="retro-terminal-box border-emerald-600/50 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 mb-4 animate-fade-in">
            <div className="flex items-center gap-4 p-2">
              {msg.idol.image && (
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                  <img
                    src={msg.idol.image}
                    alt={msg.idol.name}
                    className="relative w-20 h-20 rounded-full border-2 border-emerald-600/70 object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-emerald-500 font-mono text-lg font-bold mb-1 retro-text-glow">
                  {msg.idol.name}
                </h3>
                <p className="text-emerald-600/70 font-mono text-xs">
                  🎤 Your AI Buddy
                </p>
              </div>
              <div className="text-emerald-600/50 text-xs font-mono">
                READY
              </div>
            </div>
          </div>
        );

      case 'user':
        return (
          <div key={index} className="retro-terminal-box bg-emerald-900/10 ml-12 mb-3">
            <p className="font-mono text-sm" style={{ color: 'var(--terminal-green)' }}>{msg.content}</p>
          </div>
        );

      case 'idol':
        const parsed = parseChoices(msg.content);
        const displayContent = parsed ? parsed.text : msg.content;
        
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
                
                {/* 본문 텍스트 */}
                <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--terminal-green)' }}>
                  {isTypingEffect && index === currentTypingIndex ? typingText : displayContent}
                  {isTypingEffect && index === currentTypingIndex && (
                    <span className="typing-cursor">▋</span>
                  )}
                </p>
                
                {/* 이미지 */}
                {msg.imageUrl && !isTypingEffect && (
                  <img
                    src={msg.imageUrl}
                    alt="Memory"
                    className="mt-3 border border-emerald-600/30 max-w-full"
                  />
                )}
                
                {/* 선택지 버튼 */}
                {parsed && parsed.choices.length > 0 && !isTypingEffect && (
                  <div className="mt-4 space-y-2">
                    <p className="text-emerald-600/70 font-mono text-xs mb-2 animate-fade-in">[선택지]</p>
                    {parsed.choices.map((choice, choiceIdx) => (
                      <button
                        key={choiceIdx}
                        onClick={() => handleChoiceSelect(choice, choiceIdx + 1)}
                        disabled={isEpisodeLoading}
                        className="w-full text-left px-4 py-3 border border-emerald-600/30 
                                 hover:border-emerald-600 hover:bg-emerald-900/30 hover:scale-[1.02]
                                 hover:shadow-lg hover:shadow-emerald-600/20
                                 transition-all duration-300 font-mono text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 animate-fade-in relative overflow-hidden
                                 before:absolute before:inset-0 before:bg-gradient-to-r 
                                 before:from-transparent before:via-emerald-500/10 before:to-transparent
                                 before:translate-x-[-100%] hover:before:translate-x-[100%]
                                 before:transition-transform before:duration-700"
                        style={{ 
                          color: 'var(--terminal-green)',
                          animationDelay: `${choiceIdx * 0.1}s`
                        }}
                      >
                        <span className="text-emerald-600">{choiceIdx + 1}️⃣</span> {choice}
                      </button>
                    ))}
                    
                    {/* 자유 입력권 사용 버튼 */}
                    <button
                      onClick={handleUseFreeInputTicket}
                      disabled={isEpisodeLoading || tickets === 0 || isFreeInputMode}
                      className="w-full px-4 py-2 border border-purple-600/50 
                               hover:border-purple-600 hover:bg-purple-900/20 hover:scale-[1.02]
                               hover:shadow-lg hover:shadow-purple-600/20
                               text-purple-400 font-mono text-sm transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               animate-fade-in relative overflow-hidden
                               before:absolute before:inset-0 before:bg-gradient-to-r 
                               before:from-transparent before:via-purple-500/10 before:to-transparent
                               before:translate-x-[-100%] hover:before:translate-x-[100%]
                               before:transition-transform before:duration-700"
                      style={{ 
                        animationDelay: `${parsed.choices.length * 0.1}s`
                      }}
                    >
                      🎫 자유 입력권 사용 ({tickets}개 보유)
                    </button>
                  </div>
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
          <>
            {(() => {
              const lastMsg = messages[messages.length - 1];
              const hasChoices = lastMsg?.type === 'idol' && 
                                parseChoices(lastMsg.content)?.choices.length > 0;
              
              // 선택지가 있고 자유 입력 모드가 아니면 입력 차단
              if (hasChoices && !isFreeInputMode && !isEpisodeLoading) {
                return (
                  <p className="text-center text-emerald-500/70 font-mono text-sm">
                    ⬆️ 위 선택지를 클릭하거나 자유 입력권을 사용하세요
                  </p>
                );
              }
              
              // 자유 입력 모드 또는 선택지가 없으면 입력 필드 표시
              return (
                <div className="relative">
                  {isFreeInputMode && (
                    <div className="absolute -top-8 left-0 right-0 text-center">
                      <span className="text-purple-400 font-mono text-xs bg-purple-900/30 px-3 py-1 rounded-full">
                        🎫 자유 입력 모드
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={isFreeInputMode ? "자유롭게 입력하세요..." : "답변을 입력하세요..."}
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
                </div>
              );
            })()}
          </>
        ) : (
          <p className="text-center text-emerald-500/50 font-mono text-sm">
            위 버튼을 클릭하여 선택하세요
          </p>
        )}
      </div>
    </div>
  );
};
