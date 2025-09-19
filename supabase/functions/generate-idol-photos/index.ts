import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdolRecord {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all idols from database
    const { data: idols, error: fetchError } = await supabase
      .from('idols')
      .select('*')
      .order('id')

    if (fetchError) {
      throw new Error(`Failed to fetch idols: ${fetchError.message}`)
    }

    if (!idols || idols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No idols found in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const updatedIdols = []

    // Generate photos for each idol
    for (const idol of idols as IdolRecord[]) {
      try {
        console.log(`Generating photo for ${idol.name}...`)
        
        // Create detailed prompt for idol photo
        const prompt = `Professional K-pop idol portrait photo of a ${idol.personality} person. ${idol.description}. High quality studio lighting, soft background, fashionable styling, warm and appealing expression, professional photography, 8K resolution, detailed facial features, modern Korean idol aesthetic`

        // Generate image using OpenAI
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt,
            size: '1024x1024',
            quality: 'high',
            output_format: 'jpeg',
            n: 1
          })
        })

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text()
          console.error(`OpenAI API error for ${idol.name}:`, errorText)
          continue
        }

        const imageData = await imageResponse.json()
        const base64Image = imageData.data[0].b64_json

        // Convert base64 to data URL
        const imageUrl = `data:image/jpeg;base64,${base64Image}`

        // Update idol record with new photo
        const { error: updateError } = await supabase
          .from('idols')
          .update({ profile_image: imageUrl })
          .eq('id', idol.id)

        if (updateError) {
          console.error(`Failed to update idol ${idol.name}:`, updateError)
          continue
        }

        updatedIdols.push({
          id: idol.id,
          name: idol.name,
          success: true
        })

        console.log(`Successfully updated photo for ${idol.name}`)
        
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error processing idol ${idol.name}:`, error)
        updatedIdols.push({
          id: idol.id,
          name: idol.name,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${idols.length} idols`,
        results: updatedIdols,
        successful: updatedIdols.filter(r => r.success).length,
        failed: updatedIdols.filter(r => !r.success).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})