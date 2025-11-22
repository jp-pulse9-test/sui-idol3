import { useState, useEffect, useRef } from 'react';
import { BRANCHES } from '@/data/branches';
import { getMissionsByBranch } from '@/data/salvationMissions';
import { useEpisodeStory } from '@/hooks/useEpisodeStory';
import { Branch, SalvationMission } from '@/types/branch';

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

  // 선택된 아이돌 (localStorage에서 가져오기)
  const selectedIdol = JSON.parse(localStorage.getItem('selectedIdol') || 'null');

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

  // 초기 메시지 로드
  useEffect(() => {
    setMessages([
      { type: 'system', content: '⚡ 2028 구원 작전 시스템 부팅 완료', timestamp: new Date() },
      { type: 'system', content: '지구를 구할 타임라인을 선택하세요:', timestamp: new Date() },
      { type: 'branch-select', branches: BRANCHES, timestamp: new Date() },
    ]);
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

  const handleBranchSelect = (branch: Branch) => {
    if (!branch.isUnlocked) {
      setMessages((prev) => [
        ...prev,
        { type: 'system', content: `⚠️ ${branch.name}은(는) 아직 잠겨있습니다. VRI ${branch.requiredVRI}가 필요합니다.`, timestamp: new Date() },
      ]);
      return;
    }

    setSelectedBranch(branch);
    const missions = getMissionsByBranch(branch.id);
    setMessages((prev) => [
      ...prev,
      { type: 'user', content: `> ${branch.name} 선택`, timestamp: new Date() },
      { type: 'system', content: `${branch.year}년 타임라인 로드 완료. 미션을 선택하세요:`, timestamp: new Date() },
      { type: 'mission-select', missions, timestamp: new Date() },
    ]);
    setCurrentMode('mission');
  };

  const handleMissionSelect = (mission: SalvationMission) => {
    setSelectedMission(mission);
    setMessages((prev) => [
      ...prev,
      { type: 'user', content: `> [${mission.title}] 선택`, timestamp: new Date() },
      { type: 'system', content: '미션 시작. 아이돌과의 대화를 시작합니다...', timestamp: new Date() },
    ]);
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
          <div key={index} className="retro-terminal-box mb-3">
            <p className="text-lime-400 font-mono text-sm">
              <span className="text-green-500">SYSTEM:</span> {msg.content}
            </p>
          </div>
        );

      case 'branch-select':
        return (
          <div key={index} className="retro-terminal-box mb-3">
            <p className="text-lime-400 font-mono text-sm mb-3">타임라인 선택:</p>
            <div className="space-y-2">
              {msg.branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  disabled={!branch.isUnlocked}
                  className={`w-full text-left px-4 py-3 border transition-all font-mono text-sm
                    ${
                      branch.isUnlocked
                        ? 'border-lime-500/30 hover:border-lime-500 hover:bg-lime-500/10 text-lime-400'
                        : 'border-gray-700 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="text-green-500">▶</span> [{branch.year}] {branch.name}
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
            <p className="text-lime-400 font-mono text-sm mb-3">미션 선택:</p>
            <div className="space-y-2">
              {msg.missions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className="w-full text-left px-4 py-3 border border-lime-500/30 
                           hover:border-lime-500 hover:bg-lime-500/10 
                           transition-all font-mono text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lime-400">
                      <span className="text-green-500">▶</span> {mission.title}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-lime-500/50 text-xs">{mission.difficulty}</span>
                      <span className="text-green-400 text-xs">+{mission.vriReward} VRI</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleBackToBranch}
              className="w-full mt-3 px-4 py-2 border border-gray-600 text-gray-400 
                       hover:border-lime-500 hover:text-lime-400 font-mono text-xs"
            >
              ← 타임라인 선택으로
            </button>
          </div>
        );

      case 'user':
        return (
          <div key={index} className="retro-terminal-box bg-green-500/10 ml-12 mb-3">
            <p className="text-green-400 font-mono text-sm">{msg.content}</p>
          </div>
        );

      case 'idol':
        return (
          <div key={index} className="retro-terminal-box bg-lime-500/5 mb-3">
            <div className="flex items-start gap-3">
              {selectedIdol?.image && (
                <img
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-10 h-10 rounded-full border border-lime-500/50"
                />
              )}
              <div className="flex-1">
                <p className="text-green-500 font-mono text-xs mb-1">{selectedIdol?.name || '아이돌'}</p>
                <p className="text-lime-300 font-mono text-sm leading-relaxed">{msg.content}</p>
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Memory"
                    className="mt-3 border border-lime-500/30 max-w-full"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div key={index} className="retro-terminal-box border-green-500 bg-green-500/20 mb-3">
            <div className="text-center">
              <p className="text-green-400 font-mono text-lg mb-2">✓ 미션 완료!</p>
              <div className="space-y-1 text-lime-300 font-mono text-sm">
                <p>VRI 보상: +{msg.vriReward}</p>
              </div>
              <button
                onClick={handleBackToMission}
                className="mt-4 px-6 py-2 border border-lime-500 text-lime-400 
                         hover:bg-lime-500 hover:text-black font-mono text-sm"
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
          <h1 className="text-lime-400 font-mono text-lg retro-glow">
            <span className="text-green-500">{'>'}</span> 2028 구원 작전
          </h1>
          <div className="text-xs font-mono text-lime-500/70">
            {currentMode === 'branch' && 'TIMELINE SELECT'}
            {currentMode === 'mission' && `${selectedBranch?.year} / MISSION SELECT`}
            {currentMode === 'episode' && 'EPISODE PLAY'}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input 영역 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-lime-500/30">
        {currentMode === 'episode' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="당신의 행동이나 응답을 입력하세요..."
              disabled={isEpisodeLoading}
              className="flex-1 bg-black border border-lime-500/30 text-lime-400 
                       font-mono px-4 py-2 focus:border-lime-500 focus:outline-none
                       disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isEpisodeLoading || !inputMessage.trim()}
              className="px-6 py-2 border border-lime-500 text-lime-400 
                       hover:bg-lime-500 hover:text-black font-mono
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEpisodeLoading ? '...' : 'SEND'}
            </button>
            <button
              onClick={handleBackToMission}
              className="px-4 py-2 border border-gray-600 text-gray-400 
                       hover:border-lime-500 hover:text-lime-400 font-mono text-sm"
            >
              ← 종료
            </button>
          </div>
        ) : (
          <p className="text-center text-lime-500/50 font-mono text-sm">
            위 버튼을 클릭하여 선택하세요
          </p>
        )}
      </div>
    </div>
  );
};
