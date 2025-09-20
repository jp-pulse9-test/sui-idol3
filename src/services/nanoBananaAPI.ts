// NanoBanana API 서비스
export interface GenerateImageRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number;
  model?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  data?: {
    image_url: string;
    seed: number;
    prompt: string;
  };
  error?: string;
}

class NanoBananaAPI {
  private baseUrl = 'https://api.nanobanana.com';
  private apiKey: string | null = null;

  constructor() {
    // API 키는 환경변수에서 가져오거나 로컬스토리지에서 가져올 수 있습니다
    this.apiKey = import.meta.env.VITE_NANO_BANANA_API_KEY || localStorage.getItem('nanoBananaApiKey');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('nanoBananaApiKey', apiKey);
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'NanoBanana API 키가 설정되지 않았습니다.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negative_prompt || 'blurry, low quality, distorted, ugly, bad anatomy',
          width: request.width || 512,
          height: request.height || 768,
          steps: request.steps || 20,
          guidance_scale: request.guidance_scale || 7.5,
          seed: request.seed || Math.floor(Math.random() * 1000000),
          model: request.model || 'stable-diffusion-v1-5'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          image_url: data.image_url || data.url || data.data?.image_url,
          seed: data.seed || request.seed || 0,
          prompt: request.prompt
        }
      };
    } catch (error) {
      console.error('NanoBanana API 에러:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  // 포토카드 생성을 위한 특화된 메서드
  async generatePhotocard(
    idolName: string,
    concept: string,
    additionalDetails: string,
    persona: string
  ): Promise<GenerateImageResponse> {
    const prompt = this.buildPhotocardPrompt(idolName, concept, additionalDetails, persona);

    return this.generateImage({
      prompt,
      negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, deformed, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, duplicate, mutated, mutilated',
      width: 512,
      height: 768,
      steps: 25,
      guidance_scale: 8.0,
      model: 'gemini-2.5-flash-image-preview'
    });
  }

  private buildPhotocardPrompt(
    idolName: string,
    concept: string,
    additionalDetails: string,
    persona: string
  ): string {
    let prompt = `professional K-pop idol photocard, ${concept}, high quality portrait`;

    // 인물 특성 추가
    if (persona) {
      prompt += `, ${persona}`;
    }

    // 추가 디테일 추가
    if (additionalDetails) {
      prompt += `, ${additionalDetails}`;
    }

    // 품질 향상 키워드 추가
    prompt += ', masterpiece, best quality, ultra-detailed, perfect lighting, professional photography, 8k resolution, sharp focus, vibrant colors, studio lighting';

    return prompt;
  }

  // API 키 유효성 검사
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/v1/user/info`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const nanoBananaAPI = new NanoBananaAPI();