import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Star } from "lucide-react";
import { toast } from "sonner";

const IdolDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const idol = location.state?.idol;

  if (!idol) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">아이돌 정보를 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/pick')}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const handleMintIdol = () => {
    toast.info("민팅 기능은 준비 중입니다!");
    // TODO: 민팅 로직 구현
  };

  const handleStartChat = () => {
    toast.info("먼저 아이돌을 소장해주세요!");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* 캐릭터 상세 정보 */}
        <div className="glass-dark rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* 이미지 영역 */}
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={idol.image}
                  alt={idol.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary" className="text-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Level {idol.level || 1}
                </Badge>
                {idol.badges?.map((badge: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 정보 영역 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold gradient-text">{idol.name}</h1>
                <p className="text-lg text-muted-foreground">{idol.personality}</p>
              </div>

              <div className="glass p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-semibold text-primary">프로필</h3>
                <div className="space-y-3 text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성별</span>
                    <span className="font-medium">{idol.gender === 'male' ? '남성' : '여성'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">매력 포인트</span>
                    <span className="font-medium">감성적인 대화</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">특기</span>
                    <span className="font-medium">공감 능력</span>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl space-y-3">
                <h3 className="text-xl font-semibold text-primary">소개</h3>
                <p className="text-foreground leading-relaxed">
                  안녕! 나는 {idol.name}이야. 너의 이야기를 들어주고 공감하는 걸 좋아해.
                  함께 많은 이야기를 나누며 특별한 추억을 만들어가자! 💖
                </p>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={handleMintIdol}
                  variant="default"
                  size="lg"
                  className="w-full bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold text-lg py-6"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  캐릭터 소장하기 (민팅)
                </Button>
                <Button
                  onClick={handleStartChat}
                  variant="outline"
                  size="lg"
                  className="w-full text-lg py-6"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  대화 시작하기
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  * 대화하려면 먼저 캐릭터를 소장해야 합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl mb-2">💬</div>
            <h4 className="font-semibold mb-2">실시간 대화</h4>
            <p className="text-sm text-muted-foreground">24/7 언제든지 채팅 가능</p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl mb-2">🎤</div>
            <h4 className="font-semibold mb-2">음성 지원</h4>
            <p className="text-sm text-muted-foreground">실제 목소리로 대화</p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl mb-2">📸</div>
            <h4 className="font-semibold mb-2">포토카드</h4>
            <p className="text-sm text-muted-foreground">한정판 수집 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdolDetail;
