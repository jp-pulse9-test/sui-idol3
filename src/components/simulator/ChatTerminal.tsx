import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/simulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatTerminalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  suggestedQuestions?: string[];
}

export const ChatTerminal: React.FC<ChatTerminalProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  suggestedQuestions = []
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-3 bg-muted/20">
        <h3 className="text-xs font-orbitron tracking-widest text-primary uppercase">
          AIDOL101 Interface
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-xs font-orbitron ${
                msg.role === 'user' 
                  ? 'bg-primary/20 text-primary-foreground border border-primary/30' 
                  : 'bg-muted/50 text-foreground border border-border'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[9px] text-muted-foreground mt-1 opacity-60">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Suggested Queries</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(question)}
                disabled={isLoading}
                className="text-[10px] px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border rounded-md text-foreground hover:text-primary transition-colors font-orbitron"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your query..."
          disabled={isLoading}
          className="font-orbitron text-xs"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
