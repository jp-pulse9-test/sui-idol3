import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, style, personImageBase64, materialImageBase64, idolName, personality } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // Construct the enhanced prompt for photocard generation
    let enhancedPrompt = `Create a high-quality K-pop idol photocard featuring ${idolName}. `
    enhancedPrompt += `Character personality: ${personality}. `
    enhancedPrompt += `Scene description: ${prompt}. `
    
    // Add style-specific instructions
    const styleInstructions = {
      photorealistic: "Ultra-realistic photography style with professional lighting and crisp details",
      cinematic: "Cinematic movie-like atmosphere with dramatic lighting and depth of field",
      fashion: "High-fashion magazine style with elegant poses and sophisticated lighting",
      vintage: "Retro vintage aesthetic with warm tones and classic photography feel",
      dreamy: "Soft dreamy atmosphere with ethereal lighting and gentle color grading",
      dramatic: "Bold dramatic lighting with strong contrasts and intense mood"
    }
    
    enhancedPrompt += `Style: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.photorealistic}. `
    enhancedPrompt += "High resolution, professional quality, detailed facial features, beautiful composition."

    // Prepare the request body for Gemini API
    const requestBody: any = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }]
    }

    // Add images if provided
    if (personImageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: personImageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      })
      requestBody.contents[0].parts[0].text += " Use the person in the uploaded image as reference for creating the photocard scene."
    }

    if (materialImageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg", 
          data: materialImageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      })
      requestBody.contents[0].parts[0].text += " Incorporate the style, texture, or elements from the material reference image."
    }

    // Call Gemini 2.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    // Extract the generated content
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const generatedContent = data.candidates[0].content.parts[0].text

    // For now, return the text description
    // In a full implementation, you would use an image generation service here
    // with the enhanced prompt from Gemini
    
    return new Response(
      JSON.stringify({ 
        success: true,
        enhancedPrompt: generatedContent,
        originalPrompt: prompt,
        style: style,
        idolName: idolName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-advanced-photocard function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while generating the advanced photocard',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})