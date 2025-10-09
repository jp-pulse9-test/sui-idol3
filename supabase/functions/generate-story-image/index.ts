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
      'mystery-thriller': 'dark mysterious atmosphere, noir style, dramatic shadows',
      'apocalypse-survival': 'post-apocalyptic landscape, survival theme, gritty realistic',
      'highteen-romance': 'bright youthful atmosphere, school setting, soft warm colors',
      'bromance': 'strong friendship vibe, energetic atmosphere, dynamic composition',
      'girls-romance': 'romantic soft atmosphere, pastel colors, dreamy aesthetic',
      'historical-romance': 'historical korean setting, traditional costumes, elegant composition'
    };

    const styleGuide = genreStyles[genre as keyof typeof genreStyles] || 'cinematic, highly detailed';

    // 캐릭터 정보를 포함하여 주인공 시점으로 이미지 생성
    const characterDescription = characterName 
      ? `featuring ${characterName}, a ${characterGender === 'male' ? 'handsome young man' : 'beautiful young woman'} K-pop idol as the main protagonist` 
      : 'from first-person perspective';
    
    const imagePrompt = `Create a realistic scene from first-person POV: ${storyContext}. ${characterDescription}. The protagonist ${characterName || 'main character'} should be clearly visible and central to the scene. Style: ${styleGuide}, K-drama aesthetic, professional photography, 4K quality. IMPORTANT: NO TEXT, NO LETTERS, NO WORDS, NO SUBTITLES, NO WRITING of any kind in the image. Pure visual scene only.`;

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
    console.log('이미지 생성 성공');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('생성된 이미지를 찾을 수 없습니다');
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
