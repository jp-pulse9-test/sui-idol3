import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.9,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
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
