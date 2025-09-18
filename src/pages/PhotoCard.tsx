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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateBehindPhotos = () => {
    if (!idealType) {
      toast.error("캐릭터 정보를 불러올 수 없습니다!");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 기본 이미지들로 비하인드 포토 생성 (임시)
      const newImages = [
        idealType.realImage || idealType.image,
        idealType.realImage || idealType.image,
        idealType.realImage || idealType.image,
        idealType.realImage || idealType.image
      ];
      
      setGeneratedImages(newImages);
      toast.success(`${idealType.name}의 비하인드 포토 4장이 생성되었습니다!`);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('비하인드 포토 생성 오류:', error);
      toast.error("비하인드 포토 생성에 실패했습니다.");
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

    // 선택된 비하인드 포토가 있으면 포토카드 스타일로 표시
    if (generatedImages.length > 0 && selectedImageIndex >= 0) {
      const imageSource = generatedImages[selectedImageIndex];
      if (imageSource) {
        const img = new Image();
        img.onload = () => {
          // 전체 카드에 이미지 꽉차게 표시 (포토카드 스타일)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // 하단에 반투명 오버레이와 이름만 표시
          const overlayHeight = 80;
          const gradient = ctx.createLinearGradient(0, canvas.height - overlayHeight, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
          
          // 이름
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(idealType.name, canvas.width / 2, canvas.height - 30);
        };
        img.src = imageSource;
      }
    } else {
      // 기본 프로필 카드 스타일
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
      
      // Supabase에 캐릭터 프로필 저장
      const { data, error } = await supabase
        .from('character_profiles')
        .insert([
          {
            user_id: crypto.randomUUID(), // 임시 UUID 생성 (인증 구현 후 auth.uid()로 변경)
            name: idealType.name,
            image: canvas.toDataURL(),
            personality: idealType.personality,
            custom_text: customText,
            border_color: borderColor
          }
        ])
        .select();

      if (error) {
        console.error('Supabase 저장 에러:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('저장된 데이터를 받지 못했습니다.');
      }

      // localStorage에도 백업 저장
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      const newCard = {
        id: data[0].id,
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

  const selectBehindPhoto = (index: number) => {
    if (generatedImages[index]) {
      setSelectedImageIndex(index);
      // 카드 뒤집기 애니메이션 시작
      setIsCardFlipped(true);
      
      // 1초 후 이미지 변경하고 다시 뒤집기
      setTimeout(() => {
        // 새로운 이미지로 카드 재생성
        generatePhotoCard();
        setIsCardFlipped(false);
      }, 600);
      
      toast.success(`비하인드 포토 ${index + 1}이 프로필에 적용되었습니다!`);
    }
  };

  // 자동으로 카드 생성
  useEffect(() => {
    if (idealType) {
      generatePhotoCard();
    }
  }, [idealType, customText, borderColor, selectedImageIndex]);

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
            {idealType.name}의 비하인드 포토를 생성하고 캐릭터 프로필을 만들어보세요
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
          {/* 비하인드 포토 생성 영역 */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">🎬 비하인드 포토 생성</h2>
                <p className="text-muted-foreground">
                  {idealType.name}의 특별한 비하인드 순간들을 만들어보세요
                </p>
              </div>

              {/* 생성 버튼 */}
              <div className="text-center">
                <Button
                  onClick={generateBehindPhotos}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      비하인드 포토 생성 중...
                    </>
                  ) : (
                    '📸 비하인드 포토 4장 생성'
                  )}
                </Button>
              </div>

              {/* 생성된 이미지들 */}
              {generatedImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-center">생성된 비하인드 포토</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => selectBehindPhoto(index)}>
                        <img 
                          src={image} 
                          alt={`Behind photo ${index + 1}`}
                          className={`w-full h-60 object-contain rounded-lg border-2 transition-all duration-300 ${
                            selectedImageIndex === index 
                              ? 'border-primary shadow-lg shadow-primary/50' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectBehindPhoto(index);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                          >
                            {selectedImageIndex === index ? '✓ 선택됨' : '선택하기'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 프로필 카드 영역 */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">📇 캐릭터 프로필 카드</h2>
              
              <div className="flex justify-center">
                <div className="relative perspective-1000">
                  {/* 카드 뒤 글로우 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg blur-xl scale-110 opacity-60"></div>
                  
                  <div className={`relative transition-transform duration-600 transform-style-preserve-3d ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                    <canvas 
                      ref={canvasRef}
                      className="border border-border rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 relative z-10"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center space-x-2">
                  <Button
                    onClick={saveToCollection}
                    variant="default"
                    size="lg"
                  >
                    📥 보관함에 저장
                  </Button>
                  <Button
                    onClick={downloadPhotoCard}
                    variant="outline"
                    size="lg"
                  >
                    💾 다운로드
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <Button
                    onClick={() => navigate('/final-pick')}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    다른 캐릭터 선택하기
                  </Button>
                  <Button
                    onClick={() => navigate('/collection')}
                    variant="outline"
                    className="ml-4"
                  >
                    보관함으로 이동
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;