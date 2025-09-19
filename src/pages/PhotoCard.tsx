import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [frontCardImage, setFrontCardImage] = useState<string>("");
  const [backCardImage, setBackCardImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
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
      
      // 성향별 테두리 색상 자동 설정
      const personalityColors: { [key: string]: string } = {
        "카리스마틱": "#FF4444",
        "밝고 긍정적": "#FFD700",
        "신비로운": "#9B59B6",
        "에너지틱": "#FF8C00",
        "사랑스러운": "#FF69B4",
        "우아한": "#E6E6FA",
        "상큼한": "#32CD32",
      };
      setBorderColor(personalityColors[parsedFinalPick.personality] || "#FFFFFF");
      
      // 사용자 MBTI 결과 가져오기
      const mbtiType = localStorage.getItem('mbtiResult');
      
      const getPersonalityAnalysis = (personality: string, mbti: string | null) => {
        const analysisMap: { [key: string]: string } = {
          "카리스마틱": `강렬한 매력의 ${mbti || 'UNKNOWN'} 타입! 무대를 지배하는 존재감이 매력적입니다.`,
          "밝고 긍정적": `에너지 넘치는 ${mbti || 'UNKNOWN'} 타입! 밝은 미소로 모든 이의 마음을 사로잡습니다.`,
          "신비로운": `신비롭고 깊은 ${mbti || 'UNKNOWN'} 타입! 예측할 수 없는 매력이 돋보입니다.`,
          "에너지틱": `활력 가득한 ${mbti || 'UNKNOWN'} 타입! 끝없는 에너지로 모든걸 해낼 수 있습니다.`,
          "사랑스러운": `사랑스러운 ${mbti || 'UNKNOWN'} 타입! 순수한 매력으로 모든 이를 행복하게 만듭니다.`,
          "우아한": `우아하고 품격있는 ${mbti || 'UNKNOWN'} 타입! 고급스러운 매력이 인상적입니다.`,
          "상큼한": `상큼하고 발랄한 ${mbti || 'UNKNOWN'} 타입! 청춘의 활기로 가득찬 매력을 가졌습니다.`
        };
        return analysisMap[personality] || `특별한 ${mbti || 'UNKNOWN'} 타입! 독특하고 매력적인 개성을 가지고 있습니다.`;
      };
      
      setCustomText(getPersonalityAnalysis(parsedFinalPick.personality, mbtiType));
      
      // 자동으로 프로필 카드 생성
      generateProfileCards(parsedFinalPick);
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateProfileCards = async (character: IdealType) => {
    setIsGenerating(true);
    
    try {
      toast.info(`${character.name}의 프로필 카드를 생성 중입니다...`);
      
      const { data, error } = await supabase.functions.invoke('generate-profile-cards', {
        body: {
          characterName: character.name,
          personality: character.personality,
          description: `A ${character.personality} K-pop idol character`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }

      if (!data.success || !data.images || data.images.length < 2) {
        throw new Error('프로필 카드 생성에 실패했습니다.');
      }

      setFrontCardImage(data.images[0]);
      setBackCardImage(data.images[1]);
      toast.success(`${character.name}의 프로필 카드가 생성되었습니다!`);
      
    } catch (error) {
      console.error('프로필 카드 생성 오류:', error);
      toast.error(`프로필 카드 생성에 실패했습니다: ${error.message}`);
      
      // 실패 시 기본 이미지로 대체
      setFrontCardImage(character.realImage || character.image);
      setBackCardImage(character.realImage || character.image);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idealType) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 앞면 카드 표시 (9:16 비율)
    if (!isCardFlipped && frontCardImage) {
      canvas.width = 360;
      canvas.height = 640;
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = frontCardImage;
    } 
    // 뒷면 카드 표시
    else if (isCardFlipped && backCardImage) {
      canvas.width = 360;
      canvas.height = 640;
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 뒷면에 캐릭터 정보 오버레이
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
        
        // 캐릭터 정보 텍스트
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(idealType.name, canvas.width / 2, canvas.height - 150);
        
        ctx.fillStyle = borderColor;
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(idealType.personality, canvas.width / 2, canvas.height - 120);
        
        // 사용자 메시지
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '14px Arial, sans-serif';
        ctx.textAlign = 'left';
        
        const maxWidth = canvas.width - 40;
        const lineHeight = 18;
        const words = customText.split(' ');
        let line = '';
        let y = canvas.height - 90;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 20, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 20, y);
      };
      img.src = backCardImage;
    } else {
      // 기본 프로필 카드 스타일
      canvas.width = 320;
      canvas.height = 480;
      
      // 모던한 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#334155');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 성향별 테두리
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // 내부 카드 영역
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

      // 캐릭터 이미지 (기본 프로필 이미지)
      const imageSource = idealType.realImage || idealType.image;
      if (imageSource) {
        const img = new Image();
        img.onload = () => {
          // 원형 프로필 사진
          const profileSize = 80;
          const profileX = (canvas.width - profileSize) / 2;
          const profileY = 60;
          
          // 원형 클리핑 마스크
          ctx.save();
          ctx.beginPath();
          ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
          ctx.clip();
          
          // 이미지가 짤리지 않도록 contain 방식으로 그리기
          const imgAspect = img.width / img.height;
          const containerAspect = 1; // 원형이므로 1:1
          
          let drawWidth = profileSize;
          let drawHeight = profileSize;
          let offsetX = 0;
          let offsetY = 0;
          
          if (imgAspect > containerAspect) {
            // 이미지가 더 넓은 경우
            drawWidth = profileSize;
            drawHeight = profileSize / imgAspect;
            offsetY = (profileSize - drawHeight) / 2;
          } else {
            // 이미지가 더 높은 경우
            drawWidth = profileSize * imgAspect;
            drawHeight = profileSize;
            offsetX = (profileSize - drawWidth) / 2;
          }
          
          ctx.drawImage(img, profileX + offsetX, profileY + offsetY, drawWidth, drawHeight);
          ctx.restore();

          // 이름
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(idealType.name, canvas.width / 2, 180);

          // 성격
          ctx.fillStyle = borderColor;
          ctx.font = '16px Arial, sans-serif';
          ctx.fillText(idealType.personality, canvas.width / 2, 210);

          // 사용자 메시지 (여러줄 처리)
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '14px Arial, sans-serif';
          ctx.textAlign = 'left';
          
          const maxWidth = canvas.width - 60;
          const lineHeight = 20;
          const words = customText.split(' ');
          let line = '';
          let y = 250;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, 40, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 40, y);

          // 푸터
          ctx.fillStyle = '#64748B';
          ctx.font = '12px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('AI Idol Profile Card', canvas.width / 2, canvas.height - 40);
          ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 20);
        };
        img.src = imageSource;
      }
    }
  };

  const saveToCollection = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("프로필카드를 먼저 생성해주세요!");
      return;
    }

    if (!idealType) {
      toast.error("캐릭터 정보가 없습니다!");
      return;
    }

    try {
      toast.loading("캐릭터를 보관함에 저장 중...");
      
      // localStorage에 카드 저장
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      const newCard = {
        id: crypto.randomUUID(),
        name: idealType.name,
        image: canvas.toDataURL(),
        personality: idealType.personality,
        customText: customText,
        borderColor: borderColor,
        createdAt: new Date().toISOString()
      };
      savedCards.push(newCard);
      localStorage.setItem('savedCards', JSON.stringify(savedCards));
      
      toast.dismiss();
      toast.success("캐릭터가 보관함에 저장되었습니다!");
    } catch (error) {
      toast.dismiss();
      console.error('저장 에러:', error);
      
      // 에러 유형별 메시지 제공
      if (error.code === '22P02') {
        toast.error("데이터 형식 오류가 발생했습니다. 다시 시도해주세요.");
      } else if (error.code === '23505') {
        toast.error("이미 저장된 캐릭터입니다.");
      } else if (error.message?.includes('JWT')) {
        toast.error("인증 오류가 발생했습니다. 페이지를 새로고침해주세요.");
      } else {
        toast.error("캐릭터 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const downloadPhotoCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${idealType?.name || 'my-pick'}-profile-card.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success("프로필카드가 다운로드되었습니다!");
  };

  const flipCard = () => {
    setIsCardFlipped(!isCardFlipped);
    toast.success(isCardFlipped ? "앞면이 표시됩니다!" : "뒷면이 표시됩니다!");
  };

  // 자동으로 카드 생성
  useEffect(() => {
    if (idealType && (frontCardImage || backCardImage)) {
      generatePhotoCard();
    }
  }, [idealType, customText, borderColor, frontCardImage, backCardImage, isCardFlipped]);

  if (!idealType) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">캐릭터 프로필 생성중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      {/* 상단 네비게이션 */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => navigate('/collection')}
          variant="secondary"
          size="sm"
          className="bg-card/80 backdrop-blur-sm border border-muted-foreground/30 hover:bg-card shadow-lg text-white"
        >
          👛 보관함
        </Button>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">내가 픽한 캐릭터</h1>
          <p className="text-muted-foreground">
            {idealType.name}의 프로필 카드가 자동으로 생성되었습니다
          </p>
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: borderColor }}
            />
            <span className="text-sm text-muted-foreground">
              {idealType.personality} 테마 색상 자동 적용됨
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 프로필 카드 표시 영역 */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">🎨 프로필 카드</h2>
                <p className="text-muted-foreground">
                  {isGenerating ? "프로필 카드 생성 중..." : "생성된 프로필 카드를 확인하세요"}
                </p>
              </div>

              {/* 프로필 카드 캔버스 */}
              <div className="flex justify-center">
                <div 
                  className={`transition-transform duration-500 ${isCardFlipped ? 'transform rotateY-180' : ''}`}
                >
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-auto rounded-lg shadow-2xl border-4 border-white/20"
                  />
                </div>
              </div>

              {/* 카드 액션 버튼들 */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={flipCard}
                  variant="outline"
                  size="lg"
                  className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
                >
                  🔄 카드 뒤집기
                </Button>
                <Button
                  onClick={saveToCollection}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  💾 보관함에 저장
                </Button>
                <Button
                  onClick={downloadPhotoCard}
                  variant="outline"
                  size="lg"
                  className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
                >
                  📥 다운로드
                </Button>
              </div>

              {/* 캐릭터 정보 */}
              <div className="text-center space-y-2 p-4 glass rounded-lg">
                <h3 className="text-xl font-bold">{idealType.name}</h3>
                <p className="text-muted-foreground">{idealType.personality}</p>
                <p className="text-sm text-muted-foreground italic">{customText}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/final-pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            다른 캐릭터 선택
          </Button>
          <Button
            onClick={() => navigate('/collection')}
            size="lg"
          >
            보관함 바로가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;