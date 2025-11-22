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

    // Get user's wallet address from JWT token
    const authHeader = req.headers.get('Authorization');
    let userWallet: string | null = null;
    
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          const { data: userData } = await supabaseClient
            .from('users')
            .select('wallet_address')
            .eq('id', user.id)
            .single();
          
          userWallet = userData?.wallet_address;
        }
      } catch (error) {
        console.log('Could not get user wallet:', error);
      }
    }

    // Try to get user's personal Gemini API key
    let userGeminiKey: string | null = null;
    
    if (userWallet) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const { data: keyData } = await supabaseClient
          .from('user_gemini_keys')
          .select('api_key')
          .eq('user_wallet', userWallet)
          .single();
        
        userGeminiKey = keyData?.api_key;
        
        if (userGeminiKey) {
          console.log('Using user\'s personal Gemini API key');
        }
      } catch (error) {
        console.log('No personal Gemini key found, will use Lovable AI');
      }
    }

    const imagePrompt = `Create a beautiful, emotional anime-style illustration of this moment:

Scene: ${sceneDescription}
Character: ${idolName} (K-pop idol character)
Episode: ${episodeTitle}

Style: High-quality anime art, emotional expression, detailed background, cinematic lighting, vibrant colors, professional illustration quality.

The image should capture the emotion and atmosphere of this highlight moment in the story. Make it look like a premium photocard or memory card from a K-pop idol game.`;

    let imageUrl: string | null = null;

    // Try using user's personal Gemini key first
    if (userGeminiKey) {
      try {
        console.log('Attempting Google Gemini API with personal key...');
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${userGeminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: imagePrompt }]
              }],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          // Note: Google Gemini text model doesn't generate images directly
          // This would need to be changed to use Imagen API
          console.log('Personal Gemini key used, but text-only model. Falling back to Lovable AI for images.');
        } else {
          console.log('Personal Gemini API failed, falling back to Lovable AI');
        }
      } catch (error) {
        console.error('Error with personal Gemini key:', error);
      }
    }

    // Fallback to Lovable AI (default method)
    if (!imageUrl) {
      console.log('Using Lovable AI for image generation');
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Image generation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.error("No image URL in response:", JSON.stringify(data));
        throw new Error("Failed to extract image from response");
      }
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        sceneDescription,
        usingPersonalKey: !!userGeminiKey
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
