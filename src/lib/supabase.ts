import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lylblbckiwabbnjasahu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bGJsYmNraXdhYmJuamFzYWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxODQ4NjEsImV4cCI6MjA3Mzc2MDg2MX0.hSTyH2FESEF7ZkeFMQjTw11D6Tw5BsZ9f57Y_erRAx0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export interface ApiKey {
  id: string;
  user_wallet: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}