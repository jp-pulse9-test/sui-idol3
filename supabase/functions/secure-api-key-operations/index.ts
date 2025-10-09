import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, user_wallet, api_key, service } = await req.json()

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    switch (action) {
      case 'get_for_service': {
        // SECURITY: This retrieves the API key for server-side use ONLY
        // This should ONLY be called by other edge functions, NEVER from client code
        
        // Use the secure RPC function instead of direct table access
        const { data: apiKey, error } = await supabaseClient
          .rpc('get_api_key_for_service', {
            user_wallet_param: user_wallet
          })

        if (error || !apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key not found or expired' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Only return the key for server-side operations
        // This should NEVER be exposed to frontend
        return new Response(
          JSON.stringify({ api_key: apiKey }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'rotate_key': {
        // Implement key rotation for security
        const newKey = crypto.randomUUID() // Generate new secure key
        
        const { error } = await supabaseClient
          .from('api_keys')
          .update({ 
            api_key: api_key || newKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_wallet', user_wallet)

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'API key rotated successfully',
            // Never return the actual key
            key_preview: `${newKey.substring(0, 8)}...` 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in secure-api-key-operations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})