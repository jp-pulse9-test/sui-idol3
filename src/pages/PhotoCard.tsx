import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
        "카리스마틱": "#FF4444", // 강렬한 빨강
        "밝고 긍정적": "#FFD700", // 밝은 금색
        "신비로운": "#9B59B6", // 신비로운 보라
        "에너지틱": "#FF8C00", // 활력적인 주황
        "사랑스러운": "#FF69B4", // 귀여운 핑크
        "우아한": "#E6E6FA", // 우아한 라벤더
        "상큼한": "#32CD32", // 상큼한 초록
      };
      setBorderColor(personalityColors[parsedFinalPick.personality] || "#FFFFFF");
      
      // 사용자 MBTI 결과 가져오기
      const mbtiType = localStorage.getItem('mbtiResult');
      
      // 개인화된 텍스트 생성
      const getPersonalityAnalysis = (personality: string, mbtiType: string | null) => {
        const analyses = {
          "카리스마틱": {
            default: "⚡ 강렬한 카리스마와 리더십에 끌리는 당신,\n확신에 찬 모습에서 안정감을 느끼며\n함께 성장할 든든한 파트너를 원해요.",
            ENTJ: "👑 같은 리더형으로서 강한 카리스마에 공감하며,\n서로를 인정하고 함께 발전하는\n완벽한 파워 커플을 꿈꿉니다.",
            ESTJ: "🏆 체계적이고 결단력 있는 성향이 일치하여,\n서로의 리더십을 존중하고 신뢰하는\n든든한 관계를 원하시는군요."
          },
          "밝고 긍정적": {
            default: "☀️ 밝고 긍정적인 에너지를 추구하는 당신,\n함께 있으면 세상이 더 밝아지는\n따뜻한 관계를 꿈꿔요.",
            ESFP: "🎪 같은 외향형으로서 활발한 에너지에 끌리며,\n함께 즐거운 순간들을 만들어갈\n완벽한 파트너를 원하시는군요.",
            ENFP: "🌟 무한한 가능성과 긍정적 에너지에 공감하며,\n서로의 열정을 이해하고 응원하는\n영혼의 동반자를 찾고 있어요."
          },
          "신비로운": {
            default: "🌙 깊이 있고 신비로운 매력에 끌리는 당신,\n내면의 깊은 세계를 공유할 수 있는\n특별한 관계를 원해요.",
            INFJ: "🔮 같은 직관형으로서 신비로운 성향에 공감하며,\n서로의 숨겨진 면을 이해하고 공유하는\n운명적 만남을 찾고 있어요.",
            INFP: "🎭 내면의 예술적 감성이 반영되어,\n창조적 에너지를 가진 상대방에게서\n자신의 숨겨진 모습을 발견하고 싶어해요."
          },
          "에너지틱": {
            default: "🔥 끝없는 열정과 활력에 끌리는 당신,\n함께 있으면 무엇이든 할 수 있는\n역동적인 관계를 원해요.",
            ESTP: "🎯 같은 활동적인 성향으로 에너지에 끌리며,\n함께 모험을 즐기고 활발한 삶을 사는\n완벽한 동반자를 찾고 있어요.",
            ESFP: "🎉 밝고 활발한 에너지가 일치하여,\n함께 즐거운 순간들을 만들고\n활기찬 관계를 원하시는군요."
          },
          "사랑스러운": {
            default: "💕 순수하고 사랑스러운 매력에 끌리는 당신,\n서로를 소중히 여기고 보호하는\n달콤한 관계를 꿈꿔요.",
            ISFP: "🌸 섬세하고 따뜻한 성향이 반영되어,\n상대방의 순수한 매력을 통해\n자신의 온화한 면을 표현하고 싶어해요."
          },
          "우아한": {
            default: "✨ 세련되고 우아한 매력에 끌리는 당신,\n서로의 품위를 인정하고 존중하는\n고급스러운 관계를 추구해요.",
            ISFJ: "🤍 배려심 깊고 품격 있는 성향이 일치하여,\n서로를 아끼고 존중하는\n클래식하고 우아한 관계를 원해요."
          },
          "상큼한": {
            default: "🌸 밝고 발랄한 에너지에 끌리는 당신,\n함께 있으면 젊어지는 느낌과\n새로운 활력을 얻는 관계를 원해요.",
            ENFP: "🌺 같은 활발한 성향으로 상큼한 에너지에 공감하며,\n서로를 밝게 만들어줄 수 있는\n완벽한 파트너를 찾고 있어요."
          }
        };
        
        const personalityAnalysis = analyses[personality];
        if (!personalityAnalysis) return "✨ 당신만의 특별한 취향과 감성이\n이 선택에 고스란히 담겨있습니다.";
        
        if (mbtiType && personalityAnalysis[mbtiType]) {
          return personalityAnalysis[mbtiType];
        }
        
        return personalityAnalysis.default;
      }; 
      
      setCustomText(getPersonalityAnalysis(parsedFinalPick.personality, mbtiType));
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateBehindPhotos = async () => {
    if (!idealType) {
      toast.error("캐릭터 정보를 불러올 수 없습니다!");
      return;
    }
    
    setIsGenerating(true);
    const newImages: string[] = [];
    
    try {
      // 4가지 다른 비하인드 컨셉
      const behindScenes = [
        "연습실에서 춤 연습 중인 자연스러운 모습",
        "촬영장에서 쉬는 시간의 편안한 미소", 
        "무대 뒤에서 준비하는 집중된 표정",
        "일상복 차림으로 스튜디오에서 녹음하는 모습"
      ];
      
      for (let i = 0; i < 4; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 각기 다른 배경 색상
          const backgrounds = [
            ['#FF6B6B', '#4ECDC4'], // 산호색-민트색
            ['#A8E6CF', '#FFD93D'], // 연두색-노란색  
            ['#B8A9C9', '#F7DC6F'], // 라벤더-연노랑
            ['#85C1E9', '#F8C471']  // 하늘색-주황색
          ];
          
          const [color1, color2] = backgrounds[i];
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 반투명 오버레이
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 비하인드 프레임
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
          
          // 캐릭터 이미지 (중앙)
          if (idealType.realImage) {
            const img = new Image();
            img.onload = () => {
              const imgSize = 180;
              const imgX = (canvas.width - imgSize) / 2;
              const imgY = 80;
              
              // 원형 이미지
              ctx.save();
              ctx.beginPath();
              ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
              ctx.restore();
              
              // 비하인드 텍스트 스타일
              ctx.font = 'bold 20px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.lineWidth = 2;
              ctx.strokeText(idealType.name, canvas.width / 2, imgY + imgSize + 30);
              ctx.fillText(idealType.name, canvas.width / 2, imgY + imgSize + 30);
              
              // 비하인드 라벨
              ctx.font = '14px Inter, sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.strokeText(`Behind Scene ${i + 1}`, canvas.width / 2, imgY + imgSize + 55);
              ctx.fillText(`Behind Scene ${i + 1}`, canvas.width / 2, imgY + imgSize + 55);
              
              // 비하인드 설명 (여러 줄)
              ctx.font = '12px Inter, sans-serif';
              const description = behindScenes[i];
              const words = description.split(' ');
              let line = '';
              let y = imgY + imgSize + 80;
              
              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > canvas.width - 40 && n > 0) {
                  ctx.strokeText(line, canvas.width / 2, y);
                  ctx.fillText(line, canvas.width / 2, y);
                  line = words[n] + ' ';
                  y += 18;
                } else {
                  line = testLine;
                }
              }
              ctx.strokeText(line, canvas.width / 2, y);
              ctx.fillText(line, canvas.width / 2, y);
              
              newImages.push(canvas.toDataURL());
              if (newImages.length === 4) {
                setGeneratedImages(newImages);
                toast.success(`${idealType.name}의 비하인드 포토 4장이 생성되었습니다!`);
                setIsGenerating(false);
              }
            };
            img.crossOrigin = "anonymous";
            img.src = idealType.realImage;
          }
        }
      }
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

    // 캐릭터 이미지
    if (idealType.realImage) {
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
        
        // 프로필 이미지 그리기
        ctx.drawImage(img, profileX, profileY, profileSize, profileSize);
        ctx.restore();
        
        // 프로필 테두리
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // 캐릭터 이름
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(idealType.name, canvas.width / 2, profileY + profileSize + 40);

        // 성격 태그
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

        // 개인화된 텍스트
        ctx.font = 'italic 12px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        const lines = customText.split('\n');
        let y = canvas.height - 70;
        
        lines.forEach((line, index) => {
          if (line.trim()) {
            const lineY = y + (index * 16);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeText(line, canvas.width / 2, lineY);
            ctx.fillText(line, canvas.width / 2, lineY);
          }
        });
        
        // 하단 장식선
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 20);
        ctx.lineTo(canvas.width - 50, canvas.height - 20);
        ctx.stroke();
      };
      img.crossOrigin = "anonymous";
      img.src = idealType.realImage;
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
    
    toast.success("캐릭터 프로필이 저장되었습니다!");
  };

  const downloadBehindPhoto = (index: number) => {
    if (generatedImages[index]) {
      const link = document.createElement('a');
      link.download = `${idealType?.name}-behind-scene-${index + 1}.png`;
      link.href = generatedImages[index];
      link.click();
      toast.success("비하인드 포토가 다운로드되었습니다!");
    }
  };

  useEffect(() => {
    if (idealType) {
      generatePhotoCard();
    }
  }, [idealType, customText, borderColor]);

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
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-card shadow-lg"
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
                    <>
                      ✨ 비하인드 포토 4장 생성하기
                    </>
                  )}
                </Button>
              </div>

              {/* 생성된 비하인드 포토들 */}
              {generatedImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-center">생성된 비하인드 포토</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Behind Scene ${index + 1}`}
                          className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedImageIndex(index)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadBehindPhoto(index);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                          >
                            📥 저장
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 캐릭터 프로필 카드 */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">📇 캐릭터 프로필 카드</h2>
              
              <div className="flex justify-center">
                <div className="relative">
                  <canvas 
                    ref={canvasRef}
                    className="border border-border rounded-lg shadow-lg hover:scale-105 transition-transform"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={downloadPhotoCard}
                    size="lg"
                    className="w-full max-w-sm"
                  >
                    💾 프로필 카드 저장하기
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