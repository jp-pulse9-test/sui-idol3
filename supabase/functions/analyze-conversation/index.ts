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
    const { messages, choices } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 대화 내용과 선택지 분석을 위한 프롬프트
    const analysisPrompt = `다음은 사용자와 AI 아이돌의 대화 기록과 사용자가 선택한 선택지들입니다.

대화 기록:
${messages.map((m: any) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`).join('\n')}

선택한 선택지:
${choices.join(', ')}

이 데이터를 바탕으로 사용자의 성향을 분석하고, 다음 형식으로 응답해주세요:

1. 성향 분석 (3-4줄의 간결한 요약)
2. 추천 남자 아이돌 (이름, 간단한 특징)
3. 추천 여자 아이돌 (이름, 간단한 특징)

사용자의 대화 패턴, 선택지를 통해 드러난 성격, 선호하는 대화 스타일 등을 종합적으로 분석해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "당신은 사용자의 대화 패턴과 선택지를 분석하여 성향을 파악하고, 적합한 아이돌을 추천하는 전문가입니다."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || "분석을 완료하지 못했습니다.";

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-conversation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});