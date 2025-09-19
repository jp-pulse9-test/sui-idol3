import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface IdolData {
  name: string
  personality: string
  description: string
  profile_image: string
  persona_prompt: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { customName, customPersonality, customConcept } = await req.json()

    console.log('Generating single idol with custom parameters:', { customName, customPersonality, customConcept })
    
    // 한국 K-pop 스타일 이름들
    const koreanNames = [
      "지민", "태형", "정국", "석진", "호석", "남준", "윤기",
      "민지", "하니", "다니엘", "해린", "혜인",
      "카리나", "윈터", "닝닝", "지젤",
      "사쿠라", "채원", "윤진", "카즈하", "은채",
      "미연", "민니", "소연", "우기", "슈화"
    ]

    const personalities = [
      "밝고 에너지 넘치는", "차분하고 신중한", "유머러스하고 장난기 많은",
      "따뜻하고 배려심 깊은", "카리스마 있고 강인한", "순수하고 천진난만한",
      "지적이고 사려깊은", "자신감 넘치고 당당한", "섬세하고 감성적인"
    ]

    const concepts = [
      "청순", "섹시", "카리스마", "큐트", "엘레간트", "스포티", "레트로", "미니멀",
      "로맨틱", "펑키", "클래식", "모던", "빈티지", "어반"
    ]

    // 커스텀 파라미터 또는 랜덤 선택
    const finalName = customName || koreanNames[Math.floor(Math.random() * koreanNames.length)]
    const finalPersonality = customPersonality || personalities[Math.floor(Math.random() * personalities.length)]
    const finalConcept = customConcept || concepts[Math.floor(Math.random() * concepts.length)]
    
    // 유니크한 이름 생성
    const timestamp = Date.now().toString().slice(-4)
    const uniqueName = `${finalName}${timestamp}`
    
    console.log(`Generating idol: ${uniqueName} with ${finalPersonality} personality and ${finalConcept} concept`)
    
    // Gemini를 사용해서 상세한 성격과 페르소나 생성
    const personaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `한국 K-pop 아이돌 "${uniqueName}"의 상세한 캐릭터를 만들어주세요.
            기본 성향: ${finalPersonality}
            컨셉: ${finalConcept}
            
            다음 형식으로 응답해주세요:
            성격설명: (3-4문장으로 구체적인 성격 특징)
            페르소나: (팬들과 대화할 때 사용할 말투와 캐릭터 설정, 200자 내외)`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 400
        }
      })
    })

    const personaData = await personaResponse.json()
    const personaText = personaData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // 텍스트에서 성격설명과 페르소나 추출
    const personalityMatch = personaText.match(/성격설명:\s*(.+?)(?=\n페르소나:|$)/s)
    const personaMatch = personaText.match(/페르소나:\s*(.+)/s)
    
    const description = personalityMatch ? personalityMatch[1].trim() : `${finalPersonality} 성격의 매력적인 K-pop 아이돌입니다.`
    const personaPrompt = personaMatch ? personaMatch[1].trim() : `안녕하세요! 저는 ${uniqueName}이에요. ${finalPersonality} 성격으로 팬 여러분과 즐겁게 대화하고 싶어요!`
    
    // Gemini 2.5 Image Flash로 실제 K-pop 아이돌 이미지 생성
    const imagePrompt = `Professional portrait of a beautiful Korean K-pop idol with ${finalPersonality} personality and ${finalConcept} concept. Studio lighting, perfect makeup, stylish modern outfit, photorealistic, high fashion photography style, ultra detailed, beautiful face`
    
    console.log(`Generating image with Gemini 2.5 Flash for ${uniqueName}`)
    
    const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-img:generateImage?key=${googleApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: imagePrompt,
        generationConfig: {
          aspectRatio: "PORTRAIT"
        }
      })
    })
    
    let profileImage = `https://api.dicebear.com/7.x/personas/svg?seed=${uniqueName}&backgroundColor=b6e3f4,c0aede,d1d4f9&scale=80` // fallback
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json()
      if (imageData.image) {
        profileImage = `data:image/png;base64,${imageData.image}`
        console.log(`Successfully generated AI image for ${uniqueName}`)
      } else {
        console.log(`No image data received, using fallback for ${uniqueName}`)
      }
    } else {
      const errorText = await imageResponse.text()
      console.error(`Image generation failed for ${uniqueName}:`, errorText)
    }
    
    const idolData: IdolData = {
      name: uniqueName,
      personality: `${finalPersonality} • ${finalConcept}`,
      description: description,
      profile_image: profileImage,
      persona_prompt: personaPrompt
    }
    
    console.log(`Generated idol data for ${uniqueName}`)
    
    // 데이터베이스에 삽입
    const { data, error } = await supabase
      .from('idols')
      .insert([idolData])
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting idol:', error)
      throw error
    }
    
    console.log(`Successfully inserted idol ${uniqueName} with ID ${data.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated idol: ${uniqueName}`,
        idol: data,
        imagePrompt: imagePrompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-single-idol function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate idol', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})