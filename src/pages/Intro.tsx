import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarMap } from '@/components/simulator/StarMap';
import { ChatTerminal } from '@/components/simulator/ChatTerminal';
import { FragmentLibrary } from '@/components/simulator/FragmentLibrary';
import { HistoryNode, ChatMessage, Fragment, SimulatorState } from '@/types/simulator';
import { initializeHistory, sendSimulatorMessage, getFutureScenarios } from '@/services/simulatorService';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
          text: 'AIDOL101 CORE ONLINE.\nConnecting to Old Earth Archives...\n' + initialNodes.length + ' Historical Nodes loaded.\n\nSelect [FUTURE] tab to view calculated probability tracks (2026-2080).',
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error(err);
        setState(prev => ({ ...prev, status: 'error' }));
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

    const { response, newFragment, newNode } = await sendSimulatorMessage(
      chatHistory,
      activeNodes,
      text
    );

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
        setState(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
      } else {
        setFutureNodes(prev => [...prev, newNode]);
      }
    }
  }, [chatHistory, state.nodes, futureNodes, viewMode]);

  const handleNodeClick = (node: HistoryNode) => {
    const context = viewMode === 'future' ? 'predicted event' : 'archived event';
    handleSendMessage(`Access data on ${context}: "${node.eventName}" (${node.year}).`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 flex flex-col font-orbitron overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">
            AIDOL<span className="text-primary">101</span>
          </h1>
          <p className="text-[10px] text-accent mt-1 tracking-[0.3em] uppercase">
            Old Earth Simulator // Ver 2.5
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mode Switch */}
          <div className="flex bg-muted/50 border border-border rounded-md p-1 gap-1">
            <button 
              onClick={() => setViewMode('past')}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-all duration-300 ${
                viewMode === 'past' 
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PAST ARCHIVE
            </button>
            <button 
              onClick={() => setViewMode('future')}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-all duration-300 ${
                viewMode === 'future' 
                ? 'bg-accent text-accent-foreground shadow-[0_0_15px_hsl(var(--accent)/0.4)]' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              FUTURE SIM [2026+]
            </button>
          </div>

          <div className="hidden lg:block text-right">
            <div className="text-[9px] text-muted-foreground uppercase">Status</div>
            <div className={`text-xs font-bold ${state.status === 'ready' ? 'text-accent' : 'text-yellow-500'} animate-pulse`}>
              {state.status === 'ready' ? 'SYSTEM ONLINE' : state.status.toUpperCase()}
            </div>
          </div>

          <Button
            onClick={() => navigate('/pick')}
            size="sm"
            className="gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* Star Map Section */}
        <section className="lg:col-span-7 h-[400px] lg:h-full relative border border-border rounded-lg bg-background">
          {state.status === 'initializing' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
              <div className="text-xs text-primary animate-pulse tracking-widest">SCANNING ARCHIVES...</div>
            </div>
          ) : (
            <StarMap 
              nodes={viewMode === 'past' ? state.nodes : futureNodes} 
              onNodeClick={handleNodeClick} 
              mode={viewMode}
            />
          )}
        </section>

        {/* Right Panel: Terminal & Fragments */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex-1 min-h-0 border border-border rounded-lg bg-background/50 backdrop-blur-sm">
            <ChatTerminal 
              messages={chatHistory} 
              onSendMessage={handleSendMessage}
              isLoading={isLoadingChat} 
            />
          </div>
          <div className="h-1/3 min-h-[180px] border border-border rounded-lg">
            <FragmentLibrary fragments={state.fragments} />
          </div>
        </section>

      </main>
    </div>
  );
};

export default Intro;
