import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Image as ImageIcon, Sparkles, X, AlertCircle } from "lucide-react";
import { useEpisodeStory } from "@/hooks/useEpisodeStory";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { EpisodeCompletionModal } from "./EpisodeCompletionModal";

interface EpisodeGameModalProps {
  episode: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    turns: number;
  };
  idol: {
    id: number;
    name: string;
    personality: string;
    persona_prompt: string;
    image: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: any) => void;
}

export const EpisodeGameModal: React.FC<EpisodeGameModalProps> = ({
  episode,
  idol,
  isOpen,
  onClose,
  onComplete
}) => {
  const { language, t } = useLanguage();
  const [inputMessage, setInputMessage] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isGeneratingImage,
    currentTurn,
    sendMessage,
    resetStory
  } = useEpisodeStory(episode, idol);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage;
    setInputMessage("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    if (currentTurn >= 8) {
      // Episode completed
      const memoryCards = messages.filter(m => m.isHighlight && m.imageUrl);
      const result = {
        episodeId: episode.id,
        turns: currentTurn,
        memoryCards: memoryCards.length,
        images: memoryCards.map(m => m.imageUrl!),
        vriReward: 50 + (memoryCards.length * 10)
      };
      setCompletionResult(result);
      setShowCompletionModal(true);
    } else {
      resetStory();
      onClose();
    }
  };

  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    if (completionResult) {
      onComplete?.(completionResult);
    }
    resetStory();
    onClose();
  };

  if (!isOpen) return null;

  const maxTurns = 8;
  const progressPercentage = Math.min((currentTurn / maxTurns) * 100, 100);
  const isCompleted = currentTurn >= maxTurns;
  const turnsRemaining = maxTurns - currentTurn;
  const showWarning = turnsRemaining <= 2 && turnsRemaining > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] md:h-[85vh] p-0 gap-0 bg-gradient-to-br from-background via-card/80 to-purple-500/5 backdrop-blur-md border-border">
          {/* Header */}
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <DialogTitle className="text-xl md:text-2xl font-bold gradient-text mb-2">
                  {episode.title}
                </DialogTitle>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {episode.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <img 
                      src={idol.image} 
                      alt={idol.name}
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                    />
                    {idol.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentTurn}/{maxTurns} {language === 'en' ? 'turns' : '턴'}
                  </Badge>
                  <Badge className={`text-xs ${
                    episode.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    episode.difficulty === 'Normal' ? 'bg-blue-500/20 text-blue-400' :
                    episode.difficulty === 'Hard' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {episode.difficulty}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Progress value={progressPercentage} className="mt-3 md:mt-4 h-2" />
            
            {/* Turn Warning */}
            {showWarning && (
              <div className="mt-2 flex items-center gap-2 text-xs text-orange-500 bg-orange-500/10 px-3 py-2 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {language === 'en' 
                  ? `${turnsRemaining} turn${turnsRemaining > 1 ? 's' : ''} remaining!`
                  : `${turnsRemaining}턴 남음!`
                }
              </div>
            )}
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef}>
            <div className="space-y-3 md:space-y-4 py-3 md:py-4">
              {/* Initial greeting */}
              {messages.length === 0 && (
                <Card className="p-3 md:p-4 bg-primary/5 border-primary/20 animate-fade-in">
                  <div className="flex items-start gap-2 md:gap-3">
                    <img 
                      src={idol.image} 
                      alt={idol.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-primary mb-1 text-sm md:text-base">{idol.name}</div>
                      <p className="text-xs md:text-sm leading-relaxed">
                        {language === 'en' 
                          ? `Hi! I'm ${idol.name}. Ready for our story together? Let's begin this adventure!`
                          : `안녕! 나는 ${idol.name}이야. 우리의 이야기를 시작할 준비됐어? 함께 모험을 떠나보자!`
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {msg.role === 'assistant' ? (
                    <Card className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 ${
                      msg.isHighlight 
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10' 
                        : 'bg-card/50'
                    }`}>
                      <div className="flex items-start gap-2 md:gap-3">
                        <img 
                          src={idol.image} 
                          alt={idol.name}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/50 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-primary mb-1 flex items-center gap-2 text-sm md:text-base">
                            {idol.name}
                            {msg.isHighlight && (
                              <Badge variant="secondary" className="text-xs gap-1 animate-pulse">
                                <Sparkles className="w-3 h-3" />
                                {language === 'en' ? 'Highlight' : '하이라이트'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content.replace('🎬 HIGHLIGHT:', '').trim()}
                          </p>
                          {msg.imageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden border-2 border-primary/30 animate-scale-in">
                              <img 
                                src={msg.imageUrl} 
                                alt="Scene illustration"
                                className="w-full h-auto"
                              />
                              <div className="p-2 bg-black/20 text-xs text-center text-muted-foreground">
                                {language === 'en' ? '✨ Memory Card Generated' : '✨ 메모리 카드 생성됨'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="max-w-[85%] md:max-w-[80%] p-3 md:p-4 bg-primary/20 border-primary/30">
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </Card>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <Card className="p-3 md:p-4 bg-card/50">
                    <div className="flex items-center gap-2 md:gap-3">
                      <img 
                        src={idol.image} 
                        alt={idol.name}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/50"
                      />
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs md:text-sm text-muted-foreground typing-animation">
                          {idol.name} {language === 'en' ? 'is thinking' : '가 생각하고 있어'}...
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {isGeneratingImage && (
                <Card className="p-3 md:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 animate-pulse">
                  <div className="flex items-center gap-2 md:gap-3">
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400 animate-pulse" />
                    <div className="flex-1">
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {language === 'en' ? '🎨 Creating memory card illustration...' : '🎨 메모리 카드 일러스트 생성 중...'}
                      </span>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {language === 'en' ? 'This may take 5-10 seconds' : '5-10초 소요될 수 있어요'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {isCompleted && !showCompletionModal && (
                <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 text-center animate-scale-in">
                  <div className="mb-4">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto animate-bounce" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold gradient-text mb-2">
                    {language === 'en' ? '🎉 Episode Complete!' : '🎉 에피소드 완료!'}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    {language === 'en' 
                      ? `You've completed the story with ${idol.name}!`
                      : `${idol.name}와의 이야기를 완료했어요!`
                    }
                  </p>
                  <Button 
                    onClick={handleClose} 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {language === 'en' ? 'View Results' : '결과 보기'}
                  </Button>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          {!isCompleted && (
            <div className="p-3 md:p-4 border-t border-border/50 bg-card/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'en' ? "Your action or response..." : "당신의 행동이나 응답..."}
                  disabled={isLoading}
                  className="flex-1 bg-background/50 text-sm md:text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {language === 'en' 
                  ? `Turn ${currentTurn}/${maxTurns} • Press Enter to send`
                  : `턴 ${currentTurn}/${maxTurns} • Enter로 전송`
                }
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      {showCompletionModal && completionResult && (
        <EpisodeCompletionModal
          isOpen={showCompletionModal}
          onClose={handleCompletionClose}
          episode={episode}
          idol={idol}
          result={completionResult}
        />
      )}
    </>
  );
};

export default EpisodeGameModal;
