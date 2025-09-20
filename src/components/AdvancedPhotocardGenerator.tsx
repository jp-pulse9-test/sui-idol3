import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Upload, ImageIcon, User, Palette, Sparkles, Zap } from "lucide-react";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt?: string;
}

interface AdvancedPhotocardGeneratorProps {
  selectedIdol: SelectedIdol;
  userCoins: number;
  fanHearts: number;
  onCostDeduction: (suiCost: number, heartCost: number) => void;
}

export const AdvancedPhotocardGenerator = ({ 
  selectedIdol, 
  userCoins, 
  fanHearts, 
  onCostDeduction 
}: AdvancedPhotocardGeneratorProps) => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [materialImage, setMaterialImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const personFileRef = useRef<HTMLInputElement>(null);
  const materialFileRef = useRef<HTMLInputElement>(null);

  const advancedCost = { sui: 0.3, hearts: 50 };

  const styles = [
    { id: "photorealistic", name: "포토리얼리스틱", description: "실제 사진같은 고품질" },
    { id: "cinematic", name: "시네마틱", description: "영화같은 분위기" },
    { id: "fashion", name: "패션", description: "고급 패션 화보 스타일" },
    { id: "vintage", name: "빈티지", description: "레트로 감성" },
    { id: "dreamy", name: "드리미", description: "꿈같은 몽환적 분위기" },
    { id: "dramatic", name: "드라마틱", description: "강렬한 대비와 조명" }
  ];

  const handleImageUpload = (type: 'person' | 'material', file: File) => {
    if (file.size > 7 * 1024 * 1024) {
      toast.error('이미지 크기는 7MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (type === 'person') {
      setPersonImage(file);
    } else {
      setMaterialImage(file);
    }
  };

  const handleGenerateAdvanced = async () => {
    if (!prompt.trim()) {
      toast.error('프롬프트를 입력해주세요!');
      return;
    }

    if (userCoins < advancedCost.sui) {
      toast.error('SUI 코인이 부족합니다!');
      return;
    }

    if (fanHearts < advancedCost.hearts) {
      toast.error('팬 하트가 부족합니다!');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare image data
      let personImageBase64 = null;
      let materialImageBase64 = null;

      if (personImage) {
        personImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(personImage);
        });
      }

      if (materialImage) {
        materialImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(materialImage);
        });
      }

      // Call Supabase Edge Function
      const response = await fetch('/api/generate-advanced-photocard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          personImageBase64,
          materialImageBase64,
          idolName: selectedIdol.name,
          personality: selectedIdol.personality
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate advanced photocard');
      }

      const result = await response.json();
      
      // For demo purposes, use the idol image
      // In production, this would be the generated image from the API
      setGeneratedImage(selectedIdol.image);
      
      onCostDeduction(advancedCost.sui, advancedCost.hearts);
      toast.success('🎉 고급 포토카드가 생성되었습니다!');
    } catch (error) {
      console.error('고급 포토카드 생성 실패:', error);
      toast.error('고급 포토카드 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canAfford = () => {
    return userCoins >= advancedCost.sui && fanHearts >= advancedCost.hearts;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" />
          고급 포토카드 생성
        </h3>
        <p className="text-muted-foreground">
          AI로 더욱 창의적이고 전문적인 포토카드를 만들어보세요
        </p>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Gemini 2.5 Flash 고급 AI 생성
        </Badge>
      </div>

      {/* Cost Info */}
      <Card className="p-4 glass-dark border-yellow-400/30 bg-yellow-400/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-yellow-400">고급 생성 비용</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              💰 {advancedCost.sui} SUI
            </Badge>
            <Badge variant="outline" className="text-pink-400 border-pink-400">
              ❤️ {advancedCost.hearts} Hearts
            </Badge>
          </div>
        </div>
      </Card>

      {/* Image Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Person Image Upload */}
        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              인물 이미지 (선택사항)
            </Label>
            <div
              className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => personFileRef.current?.click()}
            >
              {personImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(personImage)} 
                    alt="Person upload" 
                    className="w-20 h-20 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-green-400">{personImage.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <User className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    아이돌과 다른 사람이 함께 찍은 사진
                  </p>
                  <p className="text-xs text-muted-foreground">
                    클릭하여 업로드 (최대 7MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={personFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload('person', e.target.files[0])}
              className="hidden"
            />
          </div>
        </Card>

        {/* Material Image Upload */}
        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              재질/사물 이미지 (선택사항)
            </Label>
            <div
              className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => materialFileRef.current?.click()}
            >
              {materialImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(materialImage)} 
                    alt="Material upload" 
                    className="w-20 h-20 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-green-400">{materialImage.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    텍스처, 의상, 배경 등의 참고 이미지
                  </p>
                  <p className="text-xs text-muted-foreground">
                    클릭하여 업로드 (최대 7MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={materialFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload('material', e.target.files[0])}
              className="hidden"
            />
          </div>
        </Card>
      </div>

      {/* Prompt Input */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="space-y-4">
          <Label htmlFor="prompt">생성 프롬프트</Label>
          <Textarea
            id="prompt"
            placeholder="생성하고 싶은 포토카드의 상세한 설명을 입력하세요... 예: '햇살이 비치는 카페에서 따뜻한 미소를 짓고 있는 모습, 자연스러운 조명, 부드러운 분위기'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 bg-card/50"
          />
        </div>
      </Card>

      {/* Style Selection */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="space-y-4">
          <Label>스타일 선택</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-card/50">
              <SelectValue placeholder="스타일을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((styleOption) => (
                <SelectItem key={styleOption.id} value={styleOption.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{styleOption.name}</span>
                    <span className="text-xs text-muted-foreground">{styleOption.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Generate Button */}
      <Card className="p-4 glass-dark border-white/10">
        <Button
          onClick={handleGenerateAdvanced}
          disabled={!prompt.trim() || isGenerating || !canAfford()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin">✨</div>
              고급 포토카드 생성 중...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              고급 포토카드 생성하기
            </div>
          )}
        </Button>
      </Card>

      {/* Generated Image */}
      {generatedImage && (
        <Card className="p-4 glass-dark border-green-400/30 bg-green-400/5">
          <div className="space-y-4">
            <h4 className="font-semibold text-green-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              생성된 고급 포토카드
            </h4>
            <div className="text-center">
              <img 
                src={generatedImage} 
                alt="Generated photocard" 
                className="max-w-full h-auto rounded-lg mx-auto max-h-96"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                다운로드
              </Button>
              <Button variant="outline" className="flex-1">
                <ImageIcon className="w-4 h-4 mr-2" />
                컬렉션에 저장
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 glass-dark border-accent/20 bg-accent/5">
        <div className="space-y-2">
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            고급 생성 가이드
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 업로드한 이미지는 AI가 참고하여 더 정교한 포토카드 생성</li>
            <li>• 인물 이미지: 아이돌과 다른 사람이 함께 있는 사진 활용</li>
            <li>• 재질 이미지: 의상, 텍스처, 배경 등을 참고하여 스타일 적용</li>
            <li>• 상세한 프롬프트일수록 더 정확한 결과 생성</li>
            <li>• Gemini 2.5 Flash로 최고품질의 하이퍼 리얼리스틱 포토카드</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};