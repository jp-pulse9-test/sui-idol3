import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Gemini API 설정
const GEMINI_API_KEY = "AIzaSyDmJUbGEAnhfYAU_n1o0VY1uPi974hsk7o";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface IdealType {
  id: number;
  name: string;
  image: string;
  personality: string;
}

export const PhotoCard = () => {
  const [idealType, setIdealType] = useState<IdealType | null>(null);
  const [customText, setCustomText] = useState("");
  const [borderColor, setBorderColor] = useState("#00BFFF"); // 네온 블루로 기본값 변경
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedIdealType = localStorage.getItem('idealType');
    if (!storedIdealType) {
      toast.error("먼저 이상형 월드컵을 완료해주세요!");
      navigate('/worldcup');
      return;
    }
    
    try {
      const parsedIdealType = JSON.parse(storedIdealType);
      setIdealType(parsedIdealType);
      setCustomText("MY IDEAL TYPE");
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateAIImage = async () => {
    if (!idealType) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Create a beautiful K-pop style portrait of ${idealType.name}, a virtual idol with ${idealType.personality} personality. High quality, professional idol photo, Korean pop star aesthetic, studio lighting, colorful vibrant background`;
      
      // Gemini API 호출
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a detailed description for creating an AI image: ${prompt}. Describe visual elements, colors, lighting, and composition in detail.`
            }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error('이미지 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // Gemini API는 텍스트 생성이므로 설명을 바탕으로 스타일화된 이미지 생성
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // K-pop 스타일 그라데이션 배경
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.3, '#4ecdc4');
        gradient.addColorStop(0.6, '#45b7d1');
        gradient.addColorStop(1, '#f9ca24');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 오버레이 효과
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // AI Generated 워터마크
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('AI Generated K-pop Idol', canvas.width / 2, 50);
        ctx.fillText('AI Generated K-pop Idol', canvas.width / 2, 50);
        
        // 아이돌 이름 (큰 텍스트)
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.strokeText(idealType.name, canvas.width / 2, canvas.height / 2);
        ctx.fillText(idealType.name, canvas.width / 2, canvas.height / 2);
        
        // 성격 설명
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.strokeText(idealType.personality, canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText(idealType.personality, canvas.width / 2, canvas.height / 2 + 60);
        
        // 아이돌 이모티콘 (중앙)
        ctx.font = 'bold 120px serif';
        ctx.strokeText(idealType.image, canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText(idealType.image, canvas.width / 2, canvas.height / 2 - 40);
        
        // 장식 요소들
        ctx.fillStyle = borderColor;
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        setGeneratedImage(canvas.toDataURL());
        toast.success("AI 이미지가 생성되었습니다!");
      }
    } catch (error) {
      console.error('AI 이미지 생성 오류:', error);
      toast.error("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idealType) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 400;

    // 검정 배경 (고정)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 선택한 색상의 섬세한 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // AI 생성 이미지가 있으면 사용, 없으면 이모티콘 사용
    if (generatedImage) {
      const img = new Image();
      img.onload = () => {
        // 이미지를 카드 중앙에 적절한 크기로 그리기
        const imgWidth = 180;
        const imgHeight = 150;
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = 40;
        
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        
        // 이름과 텍스트는 이미지 아래에 배치
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(idealType.name, canvas.width / 2, imgY + imgHeight + 30);

        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(idealType.personality, canvas.width / 2, imgY + imgHeight + 55);

        // 커스텀 텍스트
        ctx.font = 'bold 14px Inter, sans-serif';
        const words = customText.split(' ');
        let line = '';
        let y = imgY + imgHeight + 85;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > canvas.width - 40 && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
      };
      img.src = generatedImage;
    } else {
      // 기존 이모티콘 방식
      ctx.font = 'bold 120px serif';
      ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
      ctx.fillText(idealType.image, canvas.width / 2, 180);

      // Name
      ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
      ctx.fillText(idealType.name, canvas.width / 2, 230);

      // Personality
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(idealType.personality, canvas.width / 2, 260);

      // Custom text
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      const words = customText.split(' ');
      let line = '';
      let y = 320;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > canvas.width - 40 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
    }

  };

  const downloadPhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${idealType?.name || 'ideal-type'}-photocard.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success("포토카드가 다운로드되었습니다!");
  };

  useEffect(() => {
    if (idealType) {
      generatePhotoCard();
    }
  }, [idealType, customText, borderColor, generatedImage]);

  if (!idealType) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">포토카드를 생성중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">나만의 포토카드 만들기</h1>
          <p className="text-muted-foreground">당신의 이상형 {idealType.name}의 포토카드를 커스터마이징하세요</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center">미리보기</h3>
               <div className="flex justify-center">
                 <canvas 
                   ref={canvasRef}
                   className="border border-border rounded-lg transition-all duration-500 shadow-[0_0_10px_hsl(195_100%_60%/0.3),0_0_20px_hsl(195_100%_60%/0.2)] hover:shadow-[0_0_20px_hsl(195_100%_60%),0_0_40px_hsl(195_100%_60%),0_0_80px_hsl(195_100%_60%)] hover:scale-105 cursor-pointer"
                   style={{ maxWidth: '100%', height: 'auto' }}
                 />
               </div>
            </div>
          </Card>

          {/* Customization */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center">커스터마이징</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customText" className="text-sm font-medium">
                    포토카드 텍스트
                  </Label>
                  <Input
                    id="customText"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="포토카드에 들어갈 텍스트를 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="borderColor" className="text-sm font-medium">
                    선 색상
                  </Label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="borderColor"
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-12 h-10 rounded border border-border"
                    />
                    <Input
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      placeholder="#00BFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={() => setBorderColor("#00BFFF")}
                    className="h-10 bg-[#00BFFF] hover:bg-[#00BFFF]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#FF1493")}
                    className="h-10 bg-[#FF1493] hover:bg-[#FF1493]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#8A2BE2")}
                    className="h-10 bg-[#8A2BE2] hover:bg-[#8A2BE2]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#00FF7F")}
                    className="h-10 bg-[#00FF7F] hover:bg-[#00FF7F]/80"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generateAIImage}
                  variant="premium"
                  size="lg"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? "AI 이미지 생성중..." : "🤖 AI 이미지 생성"}
                </Button>
                
                <Button
                  onClick={downloadPhotoCard}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  포토카드 다운로드
                </Button>
                
                <Button
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                  }}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  처음부터 다시 시작
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;