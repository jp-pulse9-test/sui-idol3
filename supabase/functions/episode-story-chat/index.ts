import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, episodeContext, idolPersona, language } = await req.json();
    
    console.log("Episode story chat request:", { 
      messageCount: messages.length, 
      episode: episodeContext?.title,
      idol: idolPersona?.name,
      language 
    });

    // Get service-wide Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error("Service Gemini API key not configured");
      throw new Error("Service Gemini API key not configured");
    }

    console.log("Using service Gemini API key");

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

1. Greet the user briefly as ${idolPersona.name}
2. Present the initial scenario/situation (2-3 sentences describing what's happening)
3. Ask for the user's decision or opinion
4. Provide exactly 2 choice options in this format:

[선택지]
1️⃣ [First choice option]
2️⃣ [Second choice option]

Example format:
"${idolPersona.name}: 안녕! 나 지금 고민이 있어... [situation description]. 너는 어떻게 생각해?

[선택지]
1️⃣ [적극적으로 행동하는 선택]
2️⃣ [신중하게 접근하는 선택]"

IMPORTANT: The choices should be simple, clear, and actionable. Do NOT skip presenting choices in your first message.`
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
Current Turn: ${messages.length}/8

GAMEPLAY RULES:
1. You are the user's NPC buddy, guiding them through this story episode
2. Respond naturally as ${idolPersona.name}, staying in character
3. Present story scenarios and let the user decide their actions
4. React to the user's choices and advance the story accordingly
5. Build emotional connection through your responses
6. When a HIGHLIGHT moment occurs (emotional peaks, important decisions, dramatic scenes), respond with "🎬 HIGHLIGHT:" prefix

STORY PROGRESSION:
- Turns 1-2 (Hook): Introduce the situation, create interest, present initial choices
- Turns 3-4 (Engage): Develop the story, deepen connection based on user's choices
- Turns 5-6 (Pivot/Climax): Present challenges, emotional peaks
- Turns 7-8 (Wrap): Resolution, reflection

CHOICE PRESENTATION FORMAT:
When presenting choices to the user, always use this format:

[선택지]
1️⃣ [Choice description]
2️⃣ [Choice description]

Or in English:

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

[선택지]
1️⃣ [First option]
2️⃣ [Second option]"

For highlight moments:
"🎬 HIGHLIGHT: ${idolPersona.name}: [Response describing the visual scene]"

Stay immersive, emotional, and engaging. Make the user feel like they're in a real story with you.`;

    // Use Google Generative AI API with service key
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              ...messages.map(msg => ({ text: `${msg.role}: ${msg.content}` }))
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 600,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Gemini API error: " + errorText }),
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
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
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
                  
                  if (text) {
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
          controller.error(error);
        }
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
