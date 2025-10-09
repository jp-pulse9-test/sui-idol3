import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyContext, genre, characterName, characterGender } = await req.json();
    console.log('이미지 생성 요청:', { storyContext, genre, characterName, characterGender });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY가 설정되지 않았습니다');
    }

    // 장르별 이미지 스타일
    const genreStyles = {
      'mystery-thriller': 'dark mysterious cinematic atmosphere, film noir lighting, dramatic shadows, moody color grading',
      'apocalypse-survival': 'post-apocalyptic cinematic landscape, survival theme, gritty realistic cinematography, desaturated colors',
      'highteen-romance': 'bright youthful cinematic atmosphere, school setting, soft warm cinematic colors, romantic lighting',
      'bromance': 'strong friendship vibe, energetic cinematic atmosphere, dynamic composition, vibrant colors',
      'girls-romance': 'romantic soft cinematic atmosphere, pastel colors, dreamy aesthetic, golden hour lighting',
      'historical-romance': 'historical korean cinematic setting, traditional costumes, elegant composition, period drama cinematography'
    };

    const styleGuide = genreStyles[genre as keyof typeof genreStyles] || 'cinematic, highly detailed';

    // 캐릭터 정보를 포함하여 주인공 시점으로 이미지 생성
    const genderDesc = characterGender === 'male' 
      ? 'handsome young Korean man with stylish hair' 
      : 'beautiful young Korean woman with elegant features';
    
    const characterDescription = characterName 
      ? `The main protagonist is ${characterName}, a ${genderDesc}, K-pop idol. Show ${characterName} clearly in the scene as the main focus.` 
      : 'Show the scene from first-person perspective';
    
    const imagePrompt = `Create a CINEMATIC PHOTOREALISTIC 16:9 widescreen scene like a film still: ${storyContext}. ${characterDescription}. ASPECT RATIO: 16:9 horizontal widescreen format, cinematic letterbox composition. Cinematic composition with depth of field, professional color grading, film-quality lighting, anamorphic widescreen feel, ${styleGuide}. Shot on ARRI Alexa, anamorphic lens, shallow depth of field, bokeh background, professional film production quality. CRITICAL: The protagonist MUST be ${characterGender === 'male' ? 'MALE' : 'FEMALE'}. NO TEXT, NO LETTERS, NO WORDS, NO SUBTITLES, NO WRITING of any kind in the image.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI 에러:', response.status, errorText);
      throw new Error(`이미지 생성 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('이미지 생성 응답:', JSON.stringify(data).substring(0, 200));

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('이미지 URL 찾기 실패. 전체 응답:', JSON.stringify(data));
      // 폴백: 빈 이미지 대신 null 반환하여 클라이언트가 재시도하도록
      return new Response(JSON.stringify({ imageUrl: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('이미지 생성 에러:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      imageUrl: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
