import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Get service-wide Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error("Service Gemini API key not configured");
      throw new Error("Service Gemini API key not configured");
    }

    console.log("Using service Gemini API key for image generation");

    const imagePrompt = `Create a beautiful, emotional anime-style illustration of this moment:

Scene: ${sceneDescription}
Character: ${idolName} (K-pop idol character)
Episode: ${episodeTitle}

Style: High-quality anime art, emotional expression, detailed background, cinematic lighting, vibrant colors, professional illustration quality, 16:9 aspect ratio.

The image should capture the emotion and atmosphere of this highlight moment in the story. Make it look like a premium photocard or memory card from a K-pop idol game.`;

    console.log('Calling Gemini Imagen 3.0...');
    
    // Use Gemini Imagen 3.0 for image generation
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetySetting: "block_some",
            personGeneration: "allow_adult"
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini Imagen error:", geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini Imagen failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini Imagen response received');

    // Extract image from response (Imagen returns base64 encoded images)
    const imageBase64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
    
    if (!imageBase64) {
      console.error("No image data in response");
      throw new Error("No image generated");
    }

    // Convert to data URL
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return new Response(
      JSON.stringify({ 
        imageUrl,
        sceneDescription
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scene image generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
