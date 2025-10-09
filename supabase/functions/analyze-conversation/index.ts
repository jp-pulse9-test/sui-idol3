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

다음 형식으로 **정확히** JSON 형식으로만 응답해주세요:

{
  "personality": "사용자의 핵심 성향을 2-3줄로 간결하게 요약",
  "traits": ["특징1", "특징2", "특징3"],
  "maleIdol": {
    "name": "이름",
    "mbti": "MBTI",
    "description": "한 줄 설명"
  },
  "femaleIdol": {
    "name": "이름",
    "mbti": "MBTI", 
    "description": "한 줄 설명"
  }
}

사용자의 대화 패턴과 선택지를 종합하여 분석하고, JSON만 반환하세요.`;

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
            content: "당신은 사용자의 대화 패턴과 선택지를 분석하여 성향을 파악하고, 적합한 아이돌을 추천하는 전문가입니다. 반드시 JSON 형식으로만 응답하세요."
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
    const analysisText = data.choices[0]?.message?.content || "{}";
    
    // JSON 파싱 시도
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // JSON 파싱 실패 시 기본값
      analysis = {
        personality: "분석을 완료하지 못했습니다.",
        traits: [],
        maleIdol: { name: "추천 불가", mbti: "", description: "" },
        femaleIdol: { name: "추천 불가", mbti: "", description: "" }
      };
    }

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