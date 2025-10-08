export interface IdolPreset {
  id: number;
  name: string;
  personality?: string; // Optional for security
  description?: string; // Optional for security
  profile_image: string;
  persona_prompt?: string; // Optional for security
  gender?: string;
  category?: string;
  concept?: string;
  voice_id?: string; // ElevenLabs voice ID
}

export interface PublicIdolData {
  id: number;
  name: string;
  gender: string;
  category: string;
  concept: string;
  profile_image: string;
  created_at: string;
}