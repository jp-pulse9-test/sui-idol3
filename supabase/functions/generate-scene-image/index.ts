import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GeminiKeyManager } from '../_shared/apiKeyRotation.ts';

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

    // Initialize Gemini Key Manager with fallback support
    const keyManager = new GeminiKeyManager();
    console.log("Using Gemini API with multi-key fallback for image generation");

    const imagePrompt = `Create a beautiful, emotional anime-style illustration of this moment:

Scene: ${sceneDescription}
Character: ${idolName} (K-pop idol character)
Episode: ${episodeTitle}

Style: High-quality anime art, emotional expression, detailed background, cinematic lighting, vibrant colors, professional illustration quality, 16:9 aspect ratio.

The image should capture the emotion and atmosphere of this highlight moment in the story. Make it look like a premium photocard or memory card from a K-pop idol game.`;

    console.log('Calling Gemini for text-to-image generation...');
    
    // Use Gemini 2.5 Flash for text-based image description (since direct image generation isn't available)
    // We'll return a placeholder or use a different approach
    const geminiResponse = await keyManager.callGeminiWithFallback(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=',
      {
        contents: [{
          parts: [{ 
            text: `Generate a detailed visual description for this scene that could be used to create an image:

${imagePrompt}

Provide a vivid, detailed description focusing on:
- Character appearance and expression
- Background setting and atmosphere  
- Lighting and color palette
- Emotional tone
- Composition and framing

Keep it under 100 words but highly descriptive.`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200
        }
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini error:", geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    // Extract the generated description
    const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || sceneDescription;
    
    // For now, return a placeholder image URL with the description
    // In the future, this could call an actual image generation API
    const imageUrl = `https://via.placeholder.com/800x450/1a1a1a/10b981?text=${encodeURIComponent(idolName + ' - ' + episodeTitle.substring(0, 20))}`;

    console.log('Scene description generated successfully');

    return new Response(
      JSON.stringify({ 
        imageUrl,
        sceneDescription: description
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
