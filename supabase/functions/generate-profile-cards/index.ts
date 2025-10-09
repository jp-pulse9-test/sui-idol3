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
    const { characterName, personality, description } = await req.json()

    if (!characterName || !personality) {
      return new Response(
        JSON.stringify({ error: 'Character name and personality are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 앞면 카드: K-pop 아이돌 프로필 포토
    const frontCardPrompt = `Create a high-quality K-pop idol profile photocard (vertical 9:16 ratio).
Character: ${characterName}
Personality: ${personality}
Description: ${description || 'A charismatic K-pop idol'}

Style requirements:
- Professional studio photography aesthetic
- K-pop idol styling (fashionable outfit, styled hair, makeup)
- Vibrant colors with soft studio lighting
- Clean, modern composition
- Character positioned prominently in center
- Background: Simple gradient or studio backdrop
- High quality, detailed portrait
- Instagram-worthy aesthetic

Ultra high resolution, professional K-pop photocard style.`

    // 뒷면 카드: 프로필 정보 디자인
    const backCardPrompt = `Create an elegant K-pop photocard back design (vertical 9:16 ratio).
For character: ${characterName} (${personality})

Design requirements:
- Clean, minimalist layout
- Premium trading card aesthetic
- Subtle ${personality}-themed colors and patterns
- Space for profile information
- Decorative borders or frames
- Modern, professional design
- Soft gradient background
- Abstract geometric patterns
- Logo placeholder area

Professional photocard back design, high quality, elegant.`

    const prompts = [frontCardPrompt, backCardPrompt]
    const images: string[] = []

    // 각 프롬프트에 대해 나노바나나로 이미지 생성
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      
      try {
        console.log(`Generating ${i === 0 ? 'front' : 'back'} card image with Nano Banana...`)
        
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
          console.error(`Nano Banana API error for ${i === 0 ? 'front' : 'back'} card:`, response.status, errorText)
          
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
          
          throw new Error(`Nano Banana API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log(`Nano Banana response received for ${i === 0 ? 'front' : 'back'} card`)

        // 이미지 URL 추출
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
        
        if (!imageUrl) {
          throw new Error('No image generated in response')
        }

        images.push(imageUrl)
        console.log(`✓ ${i === 0 ? 'Front' : 'Back'} card generated successfully`)
        
      } catch (error) {
        console.error(`Error generating ${i === 0 ? 'front' : 'back'} card:`, error)
        throw error // 에러를 상위로 전파
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        images,
        message: `Profile cards generated for ${characterName}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-profile-cards function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate profile cards', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})