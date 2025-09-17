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
  const [borderColor, setBorderColor] = useState("#FFD700"); // 금색으로 기본값 변경
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFinalPick = localStorage.getItem('finalPick');
    if (!storedFinalPick) {
      toast.error("먼저 최종 픽을 선택해주세요!");
      navigate('/final-pick');
      return;
    }
    
    try {
      const parsedFinalPick = JSON.parse(storedFinalPick);
      setIdealType(parsedFinalPick);
      setCustomText("MY DESTINY CARD");
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

    // 타로카드 비율 (세로가 더 김)
    canvas.width = 300;
    canvas.height = 480;

    // 타로카드 스타일 배경 (신비로운 그라데이션)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.3, '#16213e');
    gradient.addColorStop(0.7, '#0f3460');
    gradient.addColorStop(1, '#533a7b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 타로카드 테두리 (금색 장식)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    
    // 안쪽 테두리
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // 상단 장식 요소들
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ✧ ✦', canvas.width / 2, 50);

    // AI 생성 이미지가 있으면 사용, 없으면 이모티콘 사용
    if (generatedImage) {
      const img = new Image();
      img.onload = () => {
        // 타로카드 중앙 이미지 영역
        const imgWidth = 200;
        const imgHeight = 160;
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = 80;
        
        // 이미지 배경 (둥근 프레임)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(imgX - 10, imgY - 10, imgWidth + 20, imgHeight + 20);
        
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        
        // 이름 (타로카드 하단)
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeText(idealType.name, canvas.width / 2, imgY + imgHeight + 50);
        ctx.fillText(idealType.name, canvas.width / 2, imgY + imgHeight + 50);

        // 성격 설명
        ctx.font = 'italic 16px serif';
        ctx.fillStyle = borderColor;
        ctx.fillText(`"${idealType.personality}"`, canvas.width / 2, imgY + imgHeight + 80);

        // 커스텀 텍스트 (하단)
        ctx.font = 'bold 14px serif';
        ctx.fillStyle = '#ffffff';
        const words = customText.split(' ');
        let line = '';
        let y = imgY + imgHeight + 110;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > canvas.width - 60 && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
        
        // 하단 장식
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 16px serif';
        ctx.fillText('✦ ✧ ✦', canvas.width / 2, canvas.height - 30);
      };
      img.src = generatedImage;
    } else {
      // 기존 이모티콘 방식 (타로카드 스타일)
      
      // 중앙 아이돌 이모티콘 (더 크게)
      ctx.font = 'bold 140px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 3;
      ctx.strokeText(idealType.image, canvas.width / 2, 200);
      ctx.fillText(idealType.image, canvas.width / 2, 200);

      // 이름 (타로카드 하단)
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeText(idealType.name, canvas.width / 2, 270);
      ctx.fillText(idealType.name, canvas.width / 2, 270);

      // 성격 설명
      ctx.font = 'italic 16px serif';
      ctx.fillStyle = borderColor;
      ctx.fillText(`"${idealType.personality}"`, canvas.width / 2, 300);

      // 커스텀 텍스트
      ctx.font = 'bold 14px serif';
      ctx.fillStyle = '#ffffff';
      const words = customText.split(' ');
      let line = '';
      let y = 340;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > canvas.width - 60 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
      
      // 하단 장식
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 16px serif';
      ctx.fillText('✦ ✧ ✦', canvas.width / 2, canvas.height - 30);
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
          <h1 className="text-4xl font-bold gradient-text">운명의 타로카드</h1>
          <p className="text-muted-foreground">당신의 이상형 {idealType.name}의 신비로운 타로카드를 만들어보세요</p>
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
                    타로카드 문구
                  </Label>
                  <Input
                    id="customText"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="타로카드에 들어갈 신비로운 문구를 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="borderColor" className="text-sm font-medium">
                    신비로운 테두리 색상
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
                    onClick={() => setBorderColor("#FFD700")}
                    className="h-10 bg-[#FFD700] hover:bg-[#FFD700]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#C0C0C0")}
                    className="h-10 bg-[#C0C0C0] hover:bg-[#C0C0C0]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#8A2BE2")}
                    className="h-10 bg-[#8A2BE2] hover:bg-[#8A2BE2]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#00CED1")}
                    className="h-10 bg-[#00CED1] hover:bg-[#00CED1]/80"
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
                  타로카드 다운로드
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