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
    const { photocardImageUrl, idolName, concept, prompt } = await req.json();
    
    console.log("Generating video for photocard:", { 
      idol: idolName, 
      concept: concept
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create a prompt for video generation based on the photocard
    const videoPrompt = prompt || `Create a cinematic 5-second video clip featuring K-pop idol ${idolName} with "${concept}" concept. 
    
Start from this photocard image and add:
- Subtle camera movements (slow zoom, pan, or tilt)
- Atmospheric effects (soft bokeh, light particles, gentle wind)
- Dynamic lighting changes (soft glow, color gradients)
- Professional K-pop idol aesthetic
- Smooth, elegant transitions
- High-quality cinematic look

The video should feel like a premium K-pop photocard coming to life, perfect for social media sharing.`;

    console.log('Calling Lovable AI video generation (Veo 3.1)...');
    
    // Use Lovable AI Gateway with Veo 3.1 for video generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-video-preview',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: videoPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: photocardImageUrl
              }
            }
          ]
        }],
        modalities: ['video', 'text'],
        video_duration: 5 // 5 seconds video
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Video generation error:", response.status, errorText);
      
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
      
      throw new Error(`Video generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video generation response received');

    // Extract the generated video from the response
    const videoData = data.choices?.[0]?.message?.videos?.[0]?.video_url?.url;
    
    if (!videoData) {
      throw new Error('No video data returned from API');
    }

    console.log('Photocard video generated successfully');

    return new Response(
      JSON.stringify({ 
        videoUrl: videoData, // This will be a base64 video data URL or HTTP URL
        idolName,
        concept
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Photocard video generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
