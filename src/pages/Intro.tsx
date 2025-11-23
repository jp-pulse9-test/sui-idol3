import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarMap } from '@/components/simulator/StarMap';
import { ChatTerminal } from '@/components/simulator/ChatTerminal';
import { FragmentLibrary } from '@/components/simulator/FragmentLibrary';
import { MissionOverlay } from '@/components/simulator/MissionOverlay';
import { HistoryNode, ChatMessage, Fragment, SimulatorState } from '@/types/simulator';
import { initializeHistory, sendSimulatorMessage, getFutureScenarios } from '@/services/simulatorService';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
type ViewMode = 'past' | 'future';
const Intro: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<SimulatorState>({
    nodes: [],
    fragments: [],
    status: 'initializing'
  });
  const [futureNodes, setFutureNodes] = useState<HistoryNode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('past');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Progressive disclosure states
  const [showMissionOverlay, setShowMissionOverlay] = useState(true);
  const [showChatTerminal, setShowChatTerminal] = useState(false);
  const [futureUnlocked, setFutureUnlocked] = useState(false);
  const [explorationCount, setExplorationCount] = useState(0);
  useEffect(() => {
    const init = async () => {
      try {
        const initialNodes = await initializeHistory();
        const futureData = getFutureScenarios();
        setState(prev => ({
          ...prev,
          nodes: initialNodes,
          status: 'ready'
        }));
        setFutureNodes(futureData);
        setChatHistory([{
          id: 'init',
          role: 'model',
          text: 'System ready. Select a star to begin exploration.',
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error(err);
        setState(prev => ({
          ...prev,
          status: 'error'
        }));
      }
    };
    init();
  }, []);
  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);
    const activeNodes = viewMode === 'past' ? state.nodes : futureNodes;
    const {
      response,
      newFragment,
      newNode
    } = await sendSimulatorMessage(chatHistory, activeNodes, text);
    setIsLoadingChat(false);
    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, modelMsg]);
    if (newFragment) {
      setState(prev => ({
        ...prev,
        fragments: [...prev.fragments, newFragment]
      }));
    }
    if (newNode) {
      if (viewMode === 'past') {
        setState(prev => ({
          ...prev,
          nodes: [...prev.nodes, newNode]
        }));
      } else {
        setFutureNodes(prev => [...prev, newNode]);
      }
    }
  }, [chatHistory, state.nodes, futureNodes, viewMode]);
  const handleNodeClick = (node: HistoryNode) => {
    // Show chat terminal on first interaction
    if (!showChatTerminal) {
      setShowChatTerminal(true);
    }
    setExplorationCount(prev => prev + 1);

    // Unlock future mode after 3 explorations
    if (explorationCount >= 2 && !futureUnlocked) {
      setFutureUnlocked(true);
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: 'future-unlock',
          role: 'model',
          text: '⚡ FUTURE SIMULATION UNLOCKED!\nYou can now access predicted timeline scenarios (2026-2080).',
          timestamp: new Date()
        }]);
      }, 1000);
    }
    const context = viewMode === 'future' ? 'predicted event' : 'archived event';
    handleSendMessage(`Access data on ${context}: "${node.eventName}" (${node.year}).`);
  };
  const suggestedQuestions = ["What caused this event?", "Show related events", "Impact on future"];
  return <div className="min-h-screen bg-background text-foreground p-2 md:p-4 lg:p-6 flex flex-col font-orbitron overflow-hidden">
      {/* Simplified Header */}
      

      {/* Main Interface - Mobile First, Progressive Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
        
        {/* Star Map - Full width on mobile, 70% on desktop */}
        <section className={`relative border border-border rounded-lg bg-background overflow-hidden ${showChatTerminal ? 'h-[60%] lg:h-full lg:flex-[7]' : 'h-full flex-1'}`}>
          {/* Mission Overlay */}
          {showMissionOverlay && <MissionOverlay onClose={() => setShowMissionOverlay(false)} />}

          {state.status === 'initializing' ? <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-primary animate-pulse tracking-widest">
                LOADING HISTORICAL DATA...
              </div>
              <div className="text-xs text-muted-foreground">
                {state.nodes.length} events loaded
              </div>
            </div> : state.status === 'error' ? <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-20">
              <div className="text-destructive text-lg">⚠️ Error loading data</div>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div> : <>
              <StarMap nodes={viewMode === 'past' ? state.nodes : futureNodes} onNodeClick={handleNodeClick} mode={viewMode} />
              
              {/* Interactive hint overlay */}
              {!showChatTerminal && !showMissionOverlay && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="text-center space-y-4 animate-pulse">
                    <div className="text-2xl font-bold text-primary">
                      👆 Click any star to explore
                    </div>
                    <div className="flex gap-2 justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
                      <div className="w-4 h-4 rounded-full bg-primary animate-ping" style={{animationDelay: '100ms'}} />
                      <div className="w-4 h-4 rounded-full bg-primary animate-ping" style={{animationDelay: '200ms'}} />
                    </div>
                  </div>
                </div>}
            </>}
        </section>

        {/* Chat Terminal - Slides up on mobile, right panel on desktop */}
        {showChatTerminal && <section className={`flex flex-col gap-3 overflow-hidden ${'h-[40%] lg:h-full lg:flex-[3]'} animate-slide-in-right`}>
            <div className="flex-1 min-h-0 border border-border rounded-lg bg-background/95 backdrop-blur-sm overflow-hidden">
              <ChatTerminal messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoadingChat} suggestedQuestions={suggestedQuestions} />
            </div>
            
            {/* Fragment Library - Only show when fragments exist */}
            {state.fragments.length > 0 && <div className="h-1/3 min-h-[140px] border border-border rounded-lg overflow-hidden animate-fade-in">
                <FragmentLibrary fragments={state.fragments} />
              </div>}
          </section>}

        {/* Toggle Chat Button - Mobile only, when chat is hidden */}
        {!showChatTerminal && <button onClick={() => setShowChatTerminal(true)} className="lg:hidden fixed bottom-4 right-4 p-4 bg-primary text-primary-foreground rounded-full shadow-lg border-2 border-primary/50 animate-pulse z-40">
            <MessageSquare className="w-5 h-5" />
          </button>}
      </main>
    </div>;
};
export default Intro;