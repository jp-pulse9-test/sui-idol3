import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHighlight?: boolean;
  imageUrl?: string;
}

interface EpisodeContext {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

interface IdolPersona {
  name: string;
  personality: string;
  persona_prompt: string;
  image: string;
}

type BeatType = 'hook' | 'engage' | 'pivot' | 'climax' | 'wrap';

const calculateBeat = (turn: number): BeatType => {
  if (turn <= 2) return 'hook';
  if (turn <= 4) return 'engage';
  if (turn === 5) return 'pivot';
  if (turn === 6) return 'climax';
  return 'wrap';
};

export const useEpisodeStory = (
  episodeContext: EpisodeContext,
  idolPersona: IdolPersona
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentBeat, setCurrentBeat] = useState<BeatType>('hook');
  const abortControllerRef = useRef<AbortController | null>(null);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/episode-story-chat`;
  const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-scene-image`;

  const generateSceneImage = async (sceneDescription: string) => {
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene-image', {
        body: {
          sceneDescription,
          idolName: idolPersona.name,
          episodeTitle: episodeContext.title
        }
      });

      if (error) throw error;
      
      console.log("Scene image generated:", data);
      return data.imageUrl;
    } catch (error) {
      console.error("Failed to generate scene image:", error);
      
      // Import toast dynamically to show error notification
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Image generation failed",
          description: "The story continues, but we couldn't create a memory card for this moment.",
          variant: "destructive",
        });
      });
      
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Don't add system messages to visible chat
    const isSystemMessage = userMessage.startsWith('[SYSTEM:');
    
    // Add user message only if it's not a system message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    if (!isSystemMessage) {
      setMessages(prev => [...prev, newUserMessage]);
    }
    setIsLoading(true);
    
    // Update turn and beat (only for non-system messages)
    const nextTurn = isSystemMessage ? 1 : currentTurn + 1;
    setCurrentTurn(nextTurn);
    const nextBeat = calculateBeat(nextTurn);
    setCurrentBeat(nextBeat);
    
    console.log(`Turn ${nextTurn}, Beat: ${nextBeat}`);

    // Prepare messages for API
    const apiMessages = isSystemMessage 
      ? [newUserMessage].map(msg => ({ role: msg.role, content: msg.content }))
      : [...messages, newUserMessage].map(msg => ({ role: msg.role, content: msg.content }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          episodeContext,
          idolPersona,
          language: 'en',
          currentBeat: nextBeat,
          currentTurn: nextTurn
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle 429 Rate Limit error
        if (response.status === 429) {
          toast.error('⏱️ 요청 한도 초과', {
            description: '잠시 후 다시 시도해주세요.',
            duration: 5000,
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Handle 400 Token Limit error
        if (response.status === 400 && errorData.errorType === 'TOKEN_LIMIT') {
          toast.error('💬 대화가 너무 길어졌습니다', {
            description: '새로운 대화를 시작해주세요.',
            duration: 6000,
            action: {
              label: '새 대화 시작',
              onClick: () => resetStory()
            }
          });
          throw new Error('Token limit exceeded');
        }
        
        // Handle 500 Server Error (service configuration issue)
        if (response.status === 500) {
          toast.error('⚙️ 서비스 일시 중단', {
            description: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
            duration: 6000,
          });
          throw new Error('Service temporarily unavailable');
        }
        
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let isHighlight = false;
      let streamDone = false;
      let wasTokenLimit = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) {
          streamDone = true;
          break;
        }

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              // Check for highlight marker
              if (assistantContent.includes('🎬 HIGHLIGHT:')) {
                isHighlight = true;
              }

              // Update the last assistant message
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant') {
                  return prev.map((msg, i) => 
                    i === prev.length - 1 
                      ? { ...msg, content: assistantContent, isHighlight }
                      : msg
                  );
                }
                return [
                  ...prev,
                  {
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date(),
                    isHighlight
                  }
                ];
              });
            }
          } catch (e) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final buffer flush for any remaining content
      if (textBuffer.trim()) {
        const remainingLines = textBuffer.split('\n');
        for (let raw of remainingLines) {
          if (!raw || raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              if (assistantContent.includes('🎬 HIGHLIGHT:')) {
                isHighlight = true;
              }
            }
          } catch { /* ignore partial leftovers */ }
        }
      }

      // Check if stream ended abnormally (likely token limit)
      if (!streamDone && assistantContent) {
        console.warn('Stream ended without [DONE] marker - possible token limit');
        wasTokenLimit = true;
      }

      // Update final message
      if (assistantContent.trim()) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return prev.map((msg, i) => 
              i === prev.length - 1 
                ? { ...msg, content: assistantContent, isHighlight }
                : msg
            );
          }
          return [
            ...prev,
            {
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
              isHighlight
            }
          ];
        });
      }

      // Show token limit warning if detected
      if (wasTokenLimit) {
        toast.error('💬 대화가 너무 길어졌습니다', {
          description: '새로운 대화를 시작해주세요.',
          duration: 6000,
          action: {
            label: '새 대화 시작',
            onClick: () => resetStory()
          }
        });
      }

      // If it's a highlight moment, generate image
      if (isHighlight && assistantContent) {
        const imageUrl = await generateSceneImage(assistantContent);
        if (imageUrl) {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === 'assistant') {
              return prev.map((msg, i) =>
                i === prev.length - 1
                  ? { ...msg, imageUrl }
                  : msg
              );
            }
            return prev;
          });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      console.error('Story chat error:', error);
      
      // Don't add error message to chat if it's a rate limit/service/token error (already shown via toast)
      if (!error.message.includes('Rate limit') && 
          !error.message.includes('Service temporarily unavailable') &&
          !error.message.includes('Token limit')) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `죄송합니다, 오류가 발생했습니다: ${error.message}`,
            timestamp: new Date()
          }
        ]);
        
        // Show retry option for general errors
        toast.error('오류가 발생했습니다', {
          description: '다시 시도해주세요.',
          duration: 5000,
          action: {
            label: '재시도',
            onClick: () => sendMessage(userMessage)
          }
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const resetStory = () => {
    setMessages([]);
    setCurrentTurn(0);
    setCurrentBeat('hook');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Save episode progress to database
  useEffect(() => {
    const saveProgress = async () => {
      if (!episodeContext.id || currentTurn === 0) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('episode_progress').upsert({
          user_id: user.id,
          episode_id: episodeContext.id,
          mission_id: episodeContext.id,
          branch_id: episodeContext.category,
          current_turn: currentTurn,
          current_beat: currentBeat,
          choices_made: messages.filter(m => m.role === 'user').map(m => m.content),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,episode_id,mission_id'
        });
      } catch (error) {
        console.error('Failed to save episode progress:', error);
      }
    };

    saveProgress();
  }, [currentTurn, currentBeat, episodeContext, messages]);

  return {
    messages,
    isLoading,
    isGeneratingImage,
    currentTurn,
    currentBeat,
    sendMessage,
    resetStory
  };
};
