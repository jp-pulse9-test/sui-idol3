import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { appearanceProfile, gender, type } = await req.json()
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    let prompt = ''
    
    // 타로카드 생성
    if (type === 'tarot') {
      prompt = `Create a mystical tarot card design with the title "DESTINY" (運命).
The card should have:
- Ornate golden borders with intricate patterns
- A central illustration featuring a shining star, heart symbol, and cosmic elements
- Purple and pink gradient background with mystical atmosphere
- Vintage tarot card aesthetic with sacred geometry
- Bottom text reading "DESTINY" in elegant font
- Art nouveau style decorative elements
- Magical sparkles and celestial symbols
- High quality, detailed illustration in traditional tarot card style
Professional tarot card illustration, mystical, ornate, golden details, cosmic theme.`
    } else {
      // 기존 아이돌 이미지 생성
      const genderText = gender === 'male' ? 'male' : 'female'
      prompt = `Create a high-quality K-pop idol portrait photo. 
Gender: ${genderText}
Hair style: ${appearanceProfile.hair}
Eye shape: ${appearanceProfile.eyes}
Body type: ${appearanceProfile.body}
Fashion style: ${appearanceProfile.style}
Expression: ${appearanceProfile.expression}
Overall concept: ${appearanceProfile.concept}

Professional studio photography, soft lighting, detailed facial features, beautiful composition, 8k quality, ultra realistic.`
    }

    console.log('Generating image with prompt:', prompt)

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
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw new Error(`AI gateway error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('AI response received')

    // 이미지 URL 추출
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
    
    if (!imageUrl) {
      throw new Error('No image generated in response')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-idol-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate idol image',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
