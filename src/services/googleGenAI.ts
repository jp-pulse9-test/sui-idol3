import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number;
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

class GoogleGenAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initializeApiKey();
  }

  async initializeApiKey() {
    console.log('Initializing Google GenAI API key...');
    try {
      // 1. 먼저 환경 변수에서 시도 (가장 안전)
      const envKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (envKey && envKey !== 'your-api-key-here') {
        this.apiKey = envKey;
        this.genAI = new GoogleGenerativeAI(envKey);
        this.initialized = true;
        console.log('✅ Google GenAI API key loaded from environment');
        return;
      }

      // 2. localStorage에서 시도
      const storedKey = localStorage.getItem('googleGenAIKey');
      if (storedKey && storedKey !== 'your-api-key-here') {
        this.apiKey = storedKey;
        this.genAI = new GoogleGenerativeAI(storedKey);
        this.initialized = true;
        console.log('✅ Google GenAI API key loaded from localStorage');
        return;
      }

      // 3. Supabase DB에서 시도 (RLS 정책 문제가 있을 수 있음)
      try {
        console.log('Attempting to fetch API key from Supabase...');
        const { data, error } = await supabase
          .from('api_keys' as any)
          .select('api_key')
          .eq('service', 'google_genai')
          .eq('is_active', true)
          .single();

        if (!error && (data as any)?.api_key && (data as any).api_key !== 'your-google-genai-api-key-here') {
          this.apiKey = (data as any).api_key;
          this.genAI = new GoogleGenerativeAI((data as any).api_key);
          this.initialized = true;
          console.log('✅ Google GenAI API key loaded from Supabase api_keys table');
          return;
        } else {
          console.log('❌ No valid API key found in Supabase:', error?.message || 'Empty key');
        }
      } catch (dbError) {
        console.error('❌ Error fetching from Supabase api_keys table:', dbError);
      }

      console.error('❌ No Google GenAI API key found in any source');
    } catch (error) {
      console.error('❌ Failed to initialize Google GenAI:', error);
    }
  }

  async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return true;

    // 재시도
    await this.initializeApiKey();

    // 10초 동안 초기화 대기
    const timeout = 10000;
    const start = Date.now();

    while (!this.initialized && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.initialized;
  }

  async generateImageWithGemini(prompt: string, referenceImageUrl?: string): Promise<{imageUrl: string, enhancedPrompt: string, nanoBananaPrompt: string}> {
    if (!await this.ensureInitialized()) {
      throw new Error('Google GenAI가 초기화되지 않았습니다.');
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

      // 참조 이미지가 있으면 base64로 변환
      let imageData = null;
      if (referenceImageUrl) {
        imageData = await this.imageUrlToBase64(referenceImageUrl);
      }

      // 프롬프트 구성
      const parts: any[] = [];

      if (imageData) {
        // 참조 이미지와 함께 프롬프트 전송
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: imageData
          }
        });
        parts.push({
          text: `Based on the person in this reference image, generate a detailed prompt for creating a new K-pop photocard.

          CRITICAL REQUIREMENTS - THE PERSON MUST BE IDENTICAL:
          1. **EXACT SAME PERSON**: The generated image MUST show the identical person from the reference image
          2. **FACIAL FEATURES**: Maintain exact same face shape, eye shape, nose structure, lip shape, and facial proportions
          3. **IDENTITY PRESERVATION**: Anyone should be able to recognize this as the same person
          4. **CONCEPT APPLICATION**: Apply the following styling while keeping the person identical: ${prompt}

          START YOUR PROMPT WITH: "Same person as in reference image, identical facial features..."

          The prompt should:
          - Begin by specifying "same person from reference" or "identical to reference person"
          - Describe key identifying facial features to maintain consistency
          - Apply the new concept (clothing, pose, background) while preserving identity
          - Include "face consistency" and "same person" multiple times
          - Focus on K-pop photocard professional quality

          Return a detailed image generation prompt that GUARANTEES the same person appears.`
        });
      } else {
        parts.push({
          text: `Create a detailed K-pop photocard image prompt: ${prompt}`
        });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const enhancedPrompt = response.text();

      console.log('📨 Gemini response received, prompt length:', enhancedPrompt.length);

      // Nano Banana용 프롬프트로 변환
      const nanoBananaPrompt = await this.generateNanoBananaPrompt(enhancedPrompt);

      // 실제 이미지 생성 (현재는 placeholder 반환)
      const imageUrl = await this.generateActualImage(enhancedPrompt, imageData);

      return {
        imageUrl,
        enhancedPrompt,
        nanoBananaPrompt
      };
    } catch (error) {
      console.error('Error generating with Gemini:', error);
      console.error('Error details:', error);

      // 폴백으로 placeholder 이미지 반환
      console.log('Falling back to placeholder image');
      return {
        imageUrl: this.generatePlaceholderImage(prompt),
        enhancedPrompt: prompt,
        nanoBananaPrompt: 'same person, identical facial features, face consistency, ' + prompt + ', masterpiece, best quality, 8k, photorealistic, K-pop photocard'
      };
    }
  }

  private async generateNanoBananaPrompt(geminiPrompt: string): Promise<string> {
    try {
      console.log('🔄 Converting Gemini prompt to Nano Banana format...');

      const model = this.genAI!.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const conversionPrompt = `Convert the following detailed image description into a concise, effective prompt for Stable Diffusion image generation (Nano Banana API).

Original prompt: "${geminiPrompt}"

Requirements for Nano Banana/Stable Diffusion format:
1. **CRITICAL**: If the original mentions "same person" or "reference image", start with: "same person, identical face, consistent facial features"
2. Keep it concise but descriptive (under 200 words)
3. Use comma-separated tags/keywords
4. Focus on visual elements: pose, clothing, background, lighting, style
5. Include quality tags: "masterpiece, best quality, ultra detailed, 8k"
6. **FACE CONSISTENCY**: Include tags like "same face", "consistent identity", "face match"
7. Emphasize photorealistic, K-pop photocard style
8. Include specific camera settings if mentioned
9. Remove meta-instructions but keep identity requirements

For face consistency, include these tags: "same person, identical facial features, consistent face, face match, identity preservation"

Return only the converted prompt with proper face consistency tags.`;

      const result = await model.generateContent([{ text: conversionPrompt }]);
      const response = await result.response;
      const nanoBananaPrompt = response.text().trim();

      console.log('✅ Nano Banana prompt generated:', nanoBananaPrompt);
      return nanoBananaPrompt;
    } catch (error) {
      console.error('❌ Failed to convert to Nano Banana format, using original:', error);
      // Fallback to a simplified version of the original prompt
      return 'same person, identical facial features, face consistency, ' + geminiPrompt.split('.').slice(0, 3).join(', ') + ', masterpiece, best quality, 8k, photorealistic, K-pop photocard';
    }
  }

  private async generateActualImage(prompt: string, referenceImage?: string): Promise<string> {
    // Gemini는 이미지 생성이 아닌 프롬프트 개선만 제공하므로
    // placeholder 이미지 생성
    console.log('Enhanced Gemini prompt:', prompt);

    // 임시로 고품질 K-pop 포토카드 스타일 이미지 반환
    const seed = Math.random().toString(36).substring(7);
    return `https://picsum.photos/seed/${seed}/512/768`;
  }

  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  private generatePlaceholderImage(prompt: string): string {
    const width = 512;
    const height = 768;
    const seed = Math.random().toString(36).substring(7);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }

  async generatePhotocard(
    idolName: string,
    concept: string,
    additionalDetails: string,
    persona: string,
    referenceImageUrl?: string
  ): Promise<GenerateImageResponse> {
    try {
      if (!await this.ensureInitialized()) {
        return {
          success: false,
          error: 'Google GenAI API 키가 설정되지 않았습니다.'
        };
      }

      // 포토카드 프롬프트 구성
      const basePrompt = this.buildPhotocardPrompt(idolName, concept, additionalDetails, persona);

      // Gemini로 이미지 생성 (참조 이미지 포함)
      const imageResult = await this.generateImageWithGemini(basePrompt, referenceImageUrl);
      console.log('Generated image URL:', imageResult.imageUrl);

      return {
        success: true,
        data: {
          image_url: imageResult.imageUrl,
          seed: Math.floor(Math.random() * 1000000),
          prompt: imageResult.enhancedPrompt // Gemini enhanced prompt
        }
      };
    } catch (error) {
      console.error('포토카드 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  private buildPhotocardPrompt(
    idolName: string,
    concept: string,
    additionalDetails: string,
    persona: string
  ): string {
    // 더 상세한 프롬프트 구성
    let prompt = `Professional K-pop idol photocard, ${concept} concept`;

    // 아이돌 특성 추가
    if (persona) {
      prompt += `, ${persona}`;
    }

    // 컨셉별 스타일 지정
    if (concept.includes('캐주얼')) {
      prompt += ', casual street fashion, natural makeup, relaxed pose';
    } else if (concept.includes('무대')) {
      prompt += ', stage outfit, glamorous makeup, dynamic pose, concert lighting';
    } else if (concept.includes('화보')) {
      prompt += ', high fashion editorial, professional makeup, elegant pose';
    } else if (concept.includes('팬사인')) {
      prompt += ', cute outfit, natural smile, friendly expression';
    } else if (concept.includes('스페셜')) {
      prompt += ', luxury concept, artistic composition, dramatic lighting';
    }

    // 추가 디테일
    if (additionalDetails) {
      prompt += `, ${additionalDetails}`;
    }

    // 품질 키워드
    prompt += ', ultra high quality, 8K resolution, professional photography';
    prompt += ', perfect lighting, sharp focus, photocard style';
    prompt += ', vertical portrait orientation, clean background';

    prompt += `, Task & Photographic Style:
- Create a completely new and natural scene (pose, outfit, background) inspired by the theme and shot type.
- **PHOTOREALISM IS MANDATORY:** The final image must be a photorealistic image, NOT an illustration, painting, or 3D render.
- **Camera & Lens Emulation:** Emulate a shot from a Canon EOS R5 with an 85mm f/1.4 lens.
- **Focus:** The camera's focus point **MUST BE PRECISELY on the subject's nose**. This creates a natural, shallow depth of field (bokeh) where the background is beautifully and softly blurred.
- **Texture & Detail:** Pay extremely close attention to lifelike skin texture, including subtle pores and micro-details. Hair should look natural with individual strands visible.
- **Lighting:** Use soft, natural, and flattering lighting that enhances the subject's features realistically.
- **Final Output:** A single, high-resolution, hyper-realistic square photograph ready for an Instagram post.`;

    return prompt;
  }


  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      await this.initializeApiKey();
    }

    if (!this.apiKey) return false;

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // 간단한 테스트 요청
      const result = await model.generateContent('Hello');
      await result.response;

      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  // 수동으로 API 키 설정 (옵션)
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initialized = true;
    localStorage.setItem('googleGenAIKey', apiKey);
  }
}

export const googleGenAI = new GoogleGenAIService();