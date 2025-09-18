# Supabase Setup Guide

## Environment Configuration

### Local Development
1. Copy `.env.local` and configure your environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the following variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://lylblbckiwabbnjasahu.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_ACCESS_TOKEN=your_access_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Secrets Management

#### For Supabase Edge Functions
Store sensitive keys as Supabase secrets:

```bash
# Set Gemini API key as a secret
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# List all secrets
npx supabase secrets list

# Access secrets in Edge Functions
const geminiKey = Deno.env.get('GEMINI_API_KEY');
```

#### For Frontend
Use Vite environment variables with `VITE_` prefix for public keys:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)

**Never expose service role keys or API keys in frontend code!**

## Project Structure

```
supabase/
├── config.toml          # Supabase project configuration
├── functions/           # Edge Functions
│   └── shared/         # Shared utilities
└── migrations/         # Database migrations
```

## Common Commands

```bash
# Start local development
npx supabase start

# Deploy functions
npx supabase functions deploy

# Apply migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Security Best Practices

1. **Never commit secrets** - Use `.env.local` for local development
2. **Use Supabase Vault** - Store API keys as Supabase secrets
3. **Rotate keys regularly** - Update API keys periodically
4. **Use RLS policies** - Enable Row Level Security on all tables
5. **Validate input** - Always validate and sanitize user input