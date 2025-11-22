import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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

export const useEpisodeStory = (
  episodeContext: EpisodeContext,
  idolPersona: IdolPersona
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
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
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setCurrentTurn(prev => prev + 1);

    // Prepare messages for API
    const apiMessages = [...messages, newUserMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

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
          idolPersona
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let isHighlight = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

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
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const resetStory = () => {
    setMessages([]);
    setCurrentTurn(0);
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

  return {
    messages,
    isLoading,
    isGeneratingImage,
    currentTurn,
    sendMessage,
    resetStory
  };
};
