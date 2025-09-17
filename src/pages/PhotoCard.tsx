import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface IdealType {
  id: number;
  name: string;
  image: string;
  personality: string;
}

export const PhotoCard = () => {
  const [idealType, setIdealType] = useState<IdealType | null>(null);
  const [customText, setCustomText] = useState("");
  const [bgColor, setBgColor] = useState("#FF1493");
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
      setCustomText(`My Ideal Type: ${parsedIdealType.name}`);
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generatePhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idealType) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, bgColor + '80');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Idol emoji (large)
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

    // Decorative elements
    ctx.font = '20px serif';
    ctx.fillText('✨', 50, 60);
    ctx.fillText('💖', canvas.width - 50, 60);
    ctx.fillText('⭐', 50, canvas.height - 50);
    ctx.fillText('💫', canvas.width - 50, canvas.height - 50);
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
  }, [idealType, customText, bgColor]);

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
                  className="border border-border rounded-lg shadow-glow-primary"
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
                  <Label htmlFor="bgColor" className="text-sm font-medium">
                    배경 색상
                  </Label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 rounded border border-border"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#FF1493"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={() => setBgColor("#FF1493")}
                    className="h-10 bg-[#FF1493] hover:bg-[#FF1493]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBgColor("#8A2BE2")}
                    className="h-10 bg-[#8A2BE2] hover:bg-[#8A2BE2]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBgColor("#00BFFF")}
                    className="h-10 bg-[#00BFFF] hover:bg-[#00BFFF]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBgColor("#FF6B35")}
                    className="h-10 bg-[#FF6B35] hover:bg-[#FF6B35]/80"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
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