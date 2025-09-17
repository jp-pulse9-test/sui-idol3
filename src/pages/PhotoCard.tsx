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
  realImage?: string;
  personality: string;
}

export const PhotoCard = () => {
  const [idealType, setIdealType] = useState<IdealType | null>(null);
  const [customText, setCustomText] = useState("");
  const [borderColor, setBorderColor] = useState("#FFFFFF");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [instagramPrompt, setInstagramPrompt] = useState("");
  const [aiInstagramImage, setAiInstagramImage] = useState<string | null>(null);
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
      // 성향별 은유적 문구 설정
      const personalityPoems = {
        "창의적이고 열정적": "🌟 별빛처럼 반짝이는\n창조의 불꽃을 지닌 영혼",
        "활발하고 사교적": "🌞 태양처럼 밝은 미소로\n모든 이를 환하게 비추는 존재",
        "차분하고 신중한": "🌙 달빛처럼 고요한 깊이 속에\n지혜가 흐르는 마음",
        "논리적이고 분석적": "💎 다이아몬드처럼 예리한 통찰로\n진리를 바라보는 눈",
        "감성적이고 따뜻한": "🌸 벚꽃처럼 부드러운 감성으로\n세상을 포용하는 마음"
      };
      setCustomText(personalityPoems[parsedFinalPick.personality] || "✨ 특별한 영혼의\n아름다운 여정");
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateInstagramImage = async () => {
    if (!idealType || !instagramPrompt.trim()) {
      toast.error("인스타그램 주제를 입력해주세요!");
      return;
    }
    
    setIsGenerating(true);
    try {
      // 인스타그램 스타일 이미지 생성
      const prompt = `Create an Instagram-style photo of ${idealType.name} (${idealType.personality} personality) in this scenario: ${instagramPrompt}. High quality, trendy, aesthetic, professional photography, Instagram-worthy composition, vibrant colors, good lighting`;
      
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // 인스타그램 스타일 배경
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(0.3, '#fecfef');
        gradient.addColorStop(0.6, '#fecfef');
        gradient.addColorStop(1, '#ff9a9e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 오버레이
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 인스타그램 스타일 프레임
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // 아이돌 이미지 (중앙)
        if (idealType.realImage) {
          const img = new Image();
          img.onload = () => {
            const imgSize = 200;
            const imgX = (canvas.width - imgSize) / 2;
            const imgY = 80;
            
            // 원형 이미지
            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();
            
            // 인스타그램 스타일 텍스트
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeText(idealType.name, canvas.width / 2, imgY + imgSize + 40);
            ctx.fillText(idealType.name, canvas.width / 2, imgY + imgSize + 40);
            
            // 주제 텍스트
            ctx.font = '18px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            const words = instagramPrompt.split(' ');
            let line = '';
            let y = imgY + imgSize + 80;
            
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > canvas.width - 60 && n > 0) {
                ctx.strokeText(line, canvas.width / 2, y);
                ctx.fillText(line, canvas.width / 2, y);
                line = words[n] + ' ';
                y += 25;
              } else {
                line = testLine;
              }
            }
            ctx.strokeText(line, canvas.width / 2, y);
            ctx.fillText(line, canvas.width / 2, y);
            
            setAiInstagramImage(canvas.toDataURL());
            toast.success("인스타그램 스타일 이미지가 생성되었습니다!");
          };
          img.crossOrigin = "anonymous";
          img.src = idealType.realImage;
        } else {
          // fallback
          ctx.font = 'bold 60px serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 3;
          ctx.strokeText(idealType.image, canvas.width / 2, canvas.height / 2);
          ctx.fillText(idealType.image, canvas.width / 2, canvas.height / 2);
          
          setAiInstagramImage(canvas.toDataURL());
          toast.success("인스타그램 스타일 이미지가 생성되었습니다!");
        }
      }
    } catch (error) {
      console.error('인스타그램 이미지 생성 오류:', error);
      toast.error("이미지 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idealType) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 카드 크기
    canvas.width = 320;
    canvas.height = 480;

    if (isFlipped && aiInstagramImage) {
      // 뒷면: AI 생성 인스타그램 이미지 전체 표시
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = aiInstagramImage;
      return;
    }

    // 앞면: 모던한 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#334155');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 모던한 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // 내부 카드 영역
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

    // 선택한 아이돌의 실제 이미지가 있으면 사용
    if (idealType.realImage) {
      const img = new Image();
      img.onload = () => {
        // 작은 원형 프로필 사진
        const profileSize = 80;
        const profileX = (canvas.width - profileSize) / 2;
        const profileY = 60;
        
        // 원형 클리핑 마스크
        ctx.save();
        ctx.beginPath();
        ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
        ctx.clip();
        
        // 프로필 이미지 그리기
        ctx.drawImage(img, profileX, profileY, profileSize, profileSize);
        ctx.restore();
        
        // 프로필 테두리
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // 아이돌 이름 (프로필 아래)
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(idealType.name, canvas.width / 2, profileY + profileSize + 40);

        // 성격 설명 (작은 태그 스타일)
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = borderColor;
        const tagWidth = ctx.measureText(idealType.personality).width + 20;
        const tagX = (canvas.width - tagWidth) / 2;
        const tagY = profileY + profileSize + 60;
        
        // 태그 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(tagX, tagY, tagWidth, 30);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(tagX, tagY, tagWidth, 30);
        
        // 태그 텍스트
        ctx.fillStyle = borderColor;
        ctx.fillText(idealType.personality, canvas.width / 2, tagY + 20);

        // 은유적 시 문구 (하단 중앙)
        ctx.font = 'italic 18px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        const lines = customText.split('\n');
        let y = canvas.height - 120;
        
        lines.forEach((line, index) => {
          if (line.trim()) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeText(line, canvas.width / 2, y + (index * 25));
            ctx.fillText(line, canvas.width / 2, y + (index * 25));
          }
        });
        
        // 하단 장식선
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(canvas.width - 50, canvas.height - 50);
        ctx.stroke();
      };
      img.crossOrigin = "anonymous";
      img.src = idealType.realImage;
    } else {
      // 실제 이미지가 없을 때 fallback
      // 작은 원형 이모티콘
      const profileSize = 80;
      const profileX = (canvas.width - profileSize) / 2;
      const profileY = 60;
      
      // 원형 배경
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // 이모티콘
      ctx.font = 'bold 40px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(idealType.image, profileX + profileSize/2, profileY + profileSize/2 + 15);
      
      // 프로필 테두리
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
      ctx.stroke();
      
      // 나머지 요소들도 동일하게 그리기
      // 아이돌 이름
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(idealType.name, canvas.width / 2, profileY + profileSize + 40);

      // 성격 태그
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = borderColor;
      const tagWidth = ctx.measureText(idealType.personality).width + 20;
      const tagX = (canvas.width - tagWidth) / 2;
      const tagY = profileY + profileSize + 60;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(tagX, tagY, tagWidth, 30);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(tagX, tagY, tagWidth, 30);
      
      ctx.fillStyle = borderColor;
      ctx.fillText(idealType.personality, canvas.width / 2, tagY + 20);

      // 은유적 시 문구 (하단 중앙)
      ctx.font = 'italic 18px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      const lines = customText.split('\n');
      let y = canvas.height - 120;
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeText(line, canvas.width / 2, y + (index * 25));
          ctx.fillText(line, canvas.width / 2, y + (index * 25));
        }
      });
      
      // 하단 장식선
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, canvas.height - 50);
      ctx.lineTo(canvas.width - 50, canvas.height - 50);
      ctx.stroke();
    }
  };

  const downloadPhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${idealType?.name || 'my-pick'}-profile-card.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    // 컬렉션에 추가
    const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
    const newCard = {
      id: Date.now(),
      name: idealType?.name || 'Unknown',
      image: canvas.toDataURL(),
      personality: idealType?.personality || '',
      customText: customText,
      borderColor: borderColor,
      createdAt: new Date().toISOString()
    };
    savedCards.push(newCard);
    localStorage.setItem('savedCards', JSON.stringify(savedCards));
    
    toast.success("프로필카드가 저장되었습니다!");
  };

  useEffect(() => {
    if (idealType) {
      generatePhotoCard();
    }
  }, [idealType, customText, borderColor, generatedImage, isFlipped, aiInstagramImage]);

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
          <h1 className="text-4xl font-bold gradient-text">내가 픽한 프로필카드</h1>
          <p className="text-muted-foreground">당신의 이상형 {idealType.name}의 프로필카드를 커스터마이징하세요</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center">미리보기</h3>
               <div className="flex justify-center">
                 <div 
                   className="relative perspective-1000"
                   style={{ transformStyle: 'preserve-3d' }}
                 >
                   <canvas 
                     ref={canvasRef}
                     onClick={() => aiInstagramImage && setIsFlipped(!isFlipped)}
                     className={`border border-border rounded-lg transition-all duration-700 shadow-[0_0_10px_hsl(195_100%_60%/0.3),0_0_20px_hsl(195_100%_60%/0.2)] hover:shadow-[0_0_20px_hsl(195_100%_60%),0_0_40px_hsl(195_100%_60%),0_0_80px_hsl(195_100%_60%)] hover:scale-105 ${aiInstagramImage ? 'cursor-pointer' : ''}`}
                     style={{ 
                       maxWidth: '100%', 
                       height: 'auto',
                       transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                       transformStyle: 'preserve-3d'
                     }}
                   />
                   {aiInstagramImage && (
                     <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                       클릭하여 뒤집기
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </Card>

          {/* Customization */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center">커스터마이징</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagramPrompt" className="text-sm font-medium">
                    인스타그램 컨셉 (뒷면 이미지)
                  </Label>
                  <Input
                    id="instagramPrompt"
                    value={instagramPrompt}
                    onChange={(e) => setInstagramPrompt(e.target.value)}
                    placeholder="예: 카페에서 커피 마시는 모습, 콘서트 무대 위에서, 공원에서 산책"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="borderColor" className="text-sm font-medium">
                    테두리 색상
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
                    onClick={() => setBorderColor("#FFFFFF")}
                    className="h-10 bg-[#FFFFFF] hover:bg-[#FFFFFF]/80 border border-border"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#00D4FF")}
                    className="h-10 bg-[#00D4FF] hover:bg-[#00D4FF]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#8A2BE2")}
                    className="h-10 bg-[#8A2BE2] hover:bg-[#8A2BE2]/80"
                    size="sm"
                  />
                  <Button
                    onClick={() => setBorderColor("#00FF88")}
                    className="h-10 bg-[#00FF88] hover:bg-[#00FF88]/80"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generateInstagramImage}
                  variant="premium"
                  size="lg"
                  className="w-full"
                  disabled={isGenerating || !instagramPrompt.trim()}
                >
                  {isGenerating ? "인스타 이미지 생성중..." : "📸 인스타그램 컨셉 생성"}
                </Button>
                
                <Button
                  onClick={downloadPhotoCard}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  프로필카드 저장
                </Button>
                
                <Button
                  onClick={() => navigate('/collection')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  📁 내 보관함 보기
                </Button>
                
                <Button
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                  }}
                  variant="ghost"
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