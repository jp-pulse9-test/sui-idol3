import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterName, personality, description } = await req.json();
    
    if (!characterName || !personality) {
      return new Response(
        JSON.stringify({ error: 'Character name and personality are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!googleApiKey) {
      console.error('Google AI API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 캐릭터별 키워드 맵핑
    const personalityKeywords: { [key: string]: string[] } = {
      "카리스마틱": ["강렬한", "리더십", "무대", "파워풀", "자신감"],
      "밝고 긍정적": ["햇살", "웃음", "에너지", "밝은", "활기찬"],
      "신비로운": ["몽환적", "달빛", "우아한", "신비", "환상적"],
      "에너지틱": ["역동적", "춤", "열정", "활발한", "생동감"],
      "사랑스러운": ["귀여운", "달콤한", "따뜻한", "포근한", "사랑스러운"],
      "우아한": ["고급스러운", "세련된", "품격", "우아함", "클래식"],
      "상큼한": ["시원한", "청량한", "생기발랄", "상쾌한", "싱그러운"]
    };

    const keywords = personalityKeywords[personality] || ["매력적인", "아름다운"];
    
    // 4장의 서로 다른 비하인드 포토 프롬프트 생성
    const prompts = [
      `A beautiful ${personality} K-pop idol named ${characterName}, behind-the-scenes candid photo, ${keywords[0]} atmosphere, natural lighting, photorealistic, high quality, 4K`,
      `${characterName}, a ${personality} idol, ${keywords[1]} backstage moment, ${keywords[2]} vibe, professional photography, soft lighting, detailed`,
      `Candid behind-the-scenes photo of ${characterName}, ${personality} K-pop star, ${keywords[3]} mood, ${keywords[4]} setting, studio photography, high resolution`,
      `${characterName} idol photoshoot, ${personality} concept, ${keywords.join(' ')} aesthetic, professional portrait, backstage atmosphere, cinematic lighting`
    ];

    const generatedImages: string[] = [];

    // 4장의 이미지를 순차적으로 생성
    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`Generating image ${i + 1}/4 with prompt:`, prompts[i]);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': googleApiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompts[i]
              }]
            }]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error for image ${i + 1}:`, response.status, errorText);
          throw new Error(`Gemini API error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log(`Gemini API result for image ${i + 1}:`, result);
        
        // Gemini API 응답에서 이미지 데이터 추출
        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          const content = result.candidates[0].content;
          if (content.parts && content.parts[0] && content.parts[0].inlineData) {
            const imageData = content.parts[0].inlineData.data;
            const mimeType = content.parts[0].inlineData.mimeType || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${imageData}`;
            generatedImages.push(dataUrl);
          } else {
            console.error(`No image data found in response for image ${i + 1}:`, content);
            // 실패한 경우 기본 이미지 추가
            generatedImages.push('');
          }
        } else {
          console.error(`Invalid response structure for image ${i + 1}:`, result);
          generatedImages.push('');
        }

        // API 호출 간 짧은 지연
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error);
        generatedImages.push('');
      }
    }

    console.log(`Generated ${generatedImages.filter(img => img).length} out of 4 images successfully`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        prompts: prompts,
        success: generatedImages.filter(img => img).length > 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-behind-photos function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate behind photos',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});