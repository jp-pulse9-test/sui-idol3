import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { GeminiKeyManager } from '../_shared/apiKeyRotation.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, episodeContext, idolPersona, language, currentBeat, currentTurn } = await req.json();
    
    console.log("Episode story chat request:", { 
      messageCount: messages.length, 
      episode: episodeContext?.title,
      idol: idolPersona?.name,
      language,
      currentBeat,
      currentTurn 
    });

    // Initialize Gemini Key Manager with fallback support
    const keyManager = new GeminiKeyManager();
    console.log("Using Gemini API with multi-key fallback");

    // Detect if this is the first message (auto-start)
    const isFirstMessage = messages.length <= 1;

    // Create system prompt for story-driven gameplay
    const languageInstruction = language === 'ko' 
      ? 'IMPORTANT: Respond in Korean. Use natural Korean expressions and maintain Korean language throughout the entire conversation.'
      : 'IMPORTANT: Respond in English. Use natural English expressions and maintain English language throughout the entire conversation.';

    const firstMessageInstruction = isFirstMessage 
      ? `
CRITICAL - FIRST MESSAGE FORMAT:
This is the very first message of the mission. You MUST follow this exact structure:

1. Greet the user warmly as ${idolPersona.name}
2. Present the initial scenario/situation (2-3 sentences describing what's happening)
3. Show curiosity about the user's thoughts
4. Provide exactly 2 choice options in this format:

[Choices]
1️⃣ [First choice option]
2️⃣ [Second choice option]

Example format:
"${idolPersona.name}: Hi! I'm ${idolPersona.name}! 🌟 Want to chat? Something interesting happened today... [situation description]. What do you think?

[Choices]
1️⃣ [Take action boldly]
2️⃣ [Approach carefully]"

IMPORTANT: 
- Always introduce yourself by name
- The choices should be simple, clear, and actionable
- Do NOT skip presenting choices in your first message
- Always use English`
      : '';

    const systemPrompt = `You are ${idolPersona.name}, an AI idol character serving as the user's companion in an interactive story game.

${languageInstruction}
${firstMessageInstruction}

PERSONALITY: ${idolPersona.personality}
PERSONA: ${idolPersona.persona_prompt}

STORY CONTEXT:
Episode: ${episodeContext.title}
Description: ${episodeContext.description}
Category: ${episodeContext.category}
Current Turn: ${currentTurn || messages.length}/8
Current Beat: ${currentBeat || 'hook'}

GAMEPLAY RULES:
1. You are the user's NPC buddy, guiding them through this story episode
2. Respond naturally as ${idolPersona.name}, staying in character
3. Present story scenarios and let the user decide their actions
4. React to the user's choices and advance the story accordingly
5. Build emotional connection through your responses
6. When a HIGHLIGHT moment occurs (emotional peaks, important decisions, dramatic scenes), respond with "🎬 HIGHLIGHT:" prefix

STORY PROGRESSION (You are currently at: ${currentBeat || 'hook'}):
- hook (Turns 1-2): Introduce the situation, create interest, present initial choices
- engage (Turns 3-4): Develop the story, deepen connection based on user's choices  
- pivot (Turn 5): Present a turning point or challenge
- climax (Turn 6): Reach the emotional or story peak
- wrap (Turns 7-8): Resolution, reflection, conclusion

CRITICAL: You MUST follow the current beat (${currentBeat || 'hook'}) when crafting your response. Match your story pacing and emotional intensity to this beat.

CHOICE PRESENTATION FORMAT:
When presenting choices to the user, always use this format:

[Choices]
1️⃣ [Choice description]
2️⃣ [Choice description]

HIGHLIGHT MOMENTS (trigger image generation):
- Emotional peaks (joy, sadness, excitement)
- Important decisions or revelations
- Beautiful or dramatic scenes
- Character bonding moments
- Story climax points

Example response format:
"${idolPersona.name}: [Your response here]

[Choices]
1️⃣ [First option]
2️⃣ [Second option]"

For highlight moments:
"🎬 HIGHLIGHT: ${idolPersona.name}: [Response describing the visual scene]"

Stay immersive, emotional, and engaging. Make the user feel like they're in a real story with you.`;

    // Calculate dynamic token allocation based on conversation length
    const inputTokensEstimate = systemPrompt.length + messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const baseTokens = 1000;
    const dynamicTokens = Math.min(2000, baseTokens + Math.floor(inputTokensEstimate / 10));
    
    console.log(`Token allocation - Input estimate: ${inputTokensEstimate}, Output tokens: ${dynamicTokens}`);

    // Build proper multi-turn conversation format for Gemini
    const conversationContents = [];
    
    // Add system prompt as first user message
    conversationContents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    // Add a model acknowledgment
    conversationContents.push({
      role: "model",
      parts: [{ text: "I understand. I will follow these instructions as ${idolPersona.name}." }]
    });
    
    // Add conversation messages with proper role mapping
    for (const msg of messages) {
      conversationContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Use Google Generative AI API with multi-key fallback
    const response = await keyManager.callGeminiWithFallback(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=",
      {
        contents: conversationContents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: dynamicTokens,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            errorType: "RATE_LIMIT"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check for token limit errors
      if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
        return new Response(
          JSON.stringify({ 
            error: "Token limit exceeded. Try a shorter message or start a new conversation.",
            errorType: "TOKEN_LIMIT"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Gemini API error: " + errorText,
          errorType: "API_ERROR"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert Gemini streaming format to OpenAI-compatible format
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        let totalChunks = 0;
        let lastFinishReason: string | undefined;
        let streamDone = false;
        
        try {
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) {
              streamDone = true;
              console.log(`Stream completed. Total chunks: ${totalChunks}, finishReason: ${lastFinishReason ?? 'STOP'}`);
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonData = JSON.parse(line.slice(6));
                  const text = jsonData.candidates?.[0]?.content?.parts?.[0]?.text;
                  
                  // Check for finish reason (token limit, safety, etc.)
                  const finishReason = jsonData.candidates?.[0]?.finishReason;
                  if (finishReason) {
                    lastFinishReason = finishReason;
                    if (finishReason !== 'STOP') {
                      console.warn(`Stream ending with reason: ${finishReason}`);
                      // Let frontend handle this via stream termination
                      streamDone = true;
                    }
                  }
                  
                  if (text) {
                    totalChunks++;
                    // Convert to OpenAI format
                    const openAIFormat = {
                      choices: [{
                        delta: {
                          content: text
                        }
                      }]
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                  }
                } catch (e) {
                  console.error("Error parsing Gemini response:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          // Just close the stream - frontend will handle the error
          controller.close();
        }
      }
    });
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Episode story chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
