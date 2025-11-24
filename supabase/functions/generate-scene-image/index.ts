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
    const { sceneDescription, idolName, episodeTitle } = await req.json();
    
    console.log("Generating scene image:", { 
      idol: idolName, 
      episode: episodeTitle,
      scene: sceneDescription.substring(0, 100) 
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('Image generation service not configured');
    }

    console.log('Using Lovable AI Gateway for image generation');

    // Create a concise, focused prompt for image generation
    const imagePrompt = `Anime-style K-pop idol scene: ${idolName} from "${episodeTitle}". ${sceneDescription.substring(0, 250)}. 
High-quality anime art, emotional K-pop aesthetic, detailed expressive face, cinematic lighting, vibrant colors, 16:9 composition.`;

    console.log('Calling Lovable AI with google/gemini-2.5-flash-image-preview model...');
    
    // Use Lovable AI Gateway with Nano banana image generation model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: imagePrompt
        }],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI Gateway failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Image generation response received successfully');

    // Extract the generated image from the response
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error('No image data in response:', JSON.stringify(data));
      throw new Error('No image data returned from Lovable AI');
    }

    console.log('Scene image generated successfully');

    return new Response(
      JSON.stringify({ 
        imageUrl: imageData, // Base64 data URL
        sceneDescription
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scene image generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred during image generation" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
