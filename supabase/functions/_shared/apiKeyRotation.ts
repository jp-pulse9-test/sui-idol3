// Multi-key fallback system for Gemini API
export class GeminiKeyManager {
  private keys: string[] = [];
  private currentKeyIndex = 0;
  
  constructor() {
    // Load all available keys from environment
    const primaryKey = Deno.env.get('GEMINI_API_KEY');
    const backup1 = Deno.env.get('GEMINI_API_KEY_BACKUP_1');
    const backup2 = Deno.env.get('GEMINI_API_KEY_BACKUP_2');
    const backup3 = Deno.env.get('GEMINI_API_KEY_BACKUP_3');
    
    if (primaryKey) this.keys.push(primaryKey);
    if (backup1) this.keys.push(backup1);
    if (backup2) this.keys.push(backup2);
    if (backup3) this.keys.push(backup3);
    
    console.log(`GeminiKeyManager initialized with ${this.keys.length} keys`);
  }
  
  getCurrentKey(): string {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }
    return this.keys[this.currentKeyIndex];
  }
  
  rotateToNextKey(): boolean {
    if (this.keys.length <= 1) return false;
    
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    console.log(`Rotated to key index: ${this.currentKeyIndex + 1}/${this.keys.length}`);
    return true;
  }
  
  async callGeminiWithFallback(
    endpoint: string,
    body: any,
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < Math.min(maxRetries, this.keys.length); attempt++) {
      const currentKey = this.getCurrentKey();
      
      try {
        const response = await fetch(endpoint + currentKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        // Success
        if (response.ok) {
          if (attempt > 0) {
            console.log(`✅ Success with backup key (attempt ${attempt + 1})`);
          }
          return response;
        }
        
        // Rate limit or quota error - try next key
        if (response.status === 429 || response.status === 403) {
          const errorText = await response.text();
          console.warn(`⚠️ Key ${this.currentKeyIndex + 1} rate limited/quota exceeded:`, errorText);
          
          // Rotate to next key if available
          if (!this.rotateToNextKey()) {
            throw new Error('All API keys exhausted');
          }
          
          lastError = new Error(`Rate limit on key ${this.currentKeyIndex}`);
          continue;
        }
        
        // Other error - return immediately
        return response;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Try next key
        if (!this.rotateToNextKey()) {
          break;
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }
}
