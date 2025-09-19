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

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!GEMINI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 나노바나나 스타일의 인스타그램 이미지 프롬프트 생성
    const frontCardPrompt = `Create a vibrant, Instagram-style vertical image (9:16 aspect ratio) featuring ${characterName}, a ${personality} K-pop idol character. 
    The image should be in a cute, colorful "Nanobana" anime/manga art style with:
    - Bright, saturated colors and soft lighting
    - The character as the main focus, positioned prominently
    - Instagram-worthy composition with aesthetic appeal
    - K-pop idol styling (fashionable outfit, styled hair, accessories)
    - Background that complements the ${personality} personality
    - Professional photography feel but with anime/manga aesthetics
    - High quality, detailed artwork
    - ${description}
    
    Style: Nanobana-inspired, colorful, cute, Instagram aesthetic, K-pop idol photoshoot`

    const backCardPrompt = `Create a minimalist, elegant back design for a K-pop idol profile card featuring ${characterName}. 
    The design should include:
    - Clean, modern layout with plenty of white space
    - Subtle ${personality}-themed design elements
    - Space for text information
    - Professional, premium card back design
    - Soft color palette that matches the ${personality} personality
    - Abstract geometric patterns or subtle textures
    - Logo placeholder area
    - High-end trading card aesthetic
    
    Style: Minimalist, professional, trading card back design, premium quality`

    const prompts = [frontCardPrompt, backCardPrompt]
    const images: string[] = []

    // 각 프롬프트에 대해 이미지 생성
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      
      try {
        console.log(`Generating image ${i + 1} with prompt:`, prompt.substring(0, 100) + '...')
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a detailed image based on this description: ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              candidateCount: 1,
              maxOutputTokens: 1000,
            }
          })
        })

        if (!response.ok) {
          console.error(`Gemini API error for image ${i + 1}:`, response.status, response.statusText)
          const errorText = await response.text()
          console.error('Error details:', errorText)
          throw new Error(`Gemini API request failed: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Gemini response for image ${i + 1}:`, JSON.stringify(data, null, 2))

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.error(`Invalid response structure for image ${i + 1}:`, data)
          throw new Error('Invalid response from Gemini API')
        }

        // Gemini는 텍스트 모델이므로 이미지 생성 대신 placeholder 이미지 사용
        // 실제 구현에서는 DALL-E, Midjourney, 또는 Stable Diffusion API를 사용해야 함
        const placeholderImage = `data:image/svg+xml;base64,${btoa(`
          <svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white" font-weight="bold">${characterName}</text>
            <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">${personality} Idol</text>
            <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">${i === 0 ? 'Front Card' : 'Back Card'}</text>
          </svg>
        `)}`

        images.push(placeholderImage)
        
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error)
        // fallback placeholder 이미지
        const fallbackImage = `data:image/svg+xml;base64,${btoa(`
          <svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#666">Loading...</text>
          </svg>
        `)}`
        images.push(fallbackImage)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        images,
        prompts,
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