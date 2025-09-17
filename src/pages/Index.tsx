import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";

import idolFacesGrid from "@/assets/idol-faces-grid.jpg";
import maleIdolFaces from "@/assets/male-idol-faces.jpg";

// 배경 아이돌 그리드 컴포넌트
const IdolGrid = ({ side }: { side: 'left' | 'right' }) => {
  const backgroundImage = side === 'left' ? maleIdolFaces : idolFacesGrid;
  
  return (
    <div className={`
      fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-64
      overflow-hidden opacity-30
    `}>
      <div 
        className="w-full h-full bg-cover bg-center bg-repeat-y animate-pulse"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          filter: 'blur(1px) brightness(0.8)'
        }}
      />
      <div className={`absolute inset-0 ${side === 'left' ? 'bg-gradient-to-r from-purple-900/50 to-transparent' : 'bg-gradient-to-l from-background/50 to-transparent'}`}></div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">
      {/* 좌우 아이돌 그리드 배경 */}
      <IdolGrid side="left" />
      <IdolGrid side="right" />
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-12 glass-dark p-16 rounded-3xl border border-white/10 shadow-2xl animate-float">
            <div className="space-y-8">
              <h1 className="text-7xl md:text-9xl font-black font-blacksword tracking-tight text-foreground">
                Sui:AIdol³
              </h1>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  가상아이돌 이상형 찾기
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  아이돌 입덕 성향 분석을 통해 당신이 반하는 모먼트를 찾고,<br />
                  이상형 월드컵으로 최종 선택한 후 나만의 포토카드를 만들어보세요!
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center">
              <Button
                onClick={() => navigate('/mbti')}
                variant="neon"
                size="xl"
                className="btn-modern min-w-80 text-2xl py-6"
              >
                ⚡ 입덕 성향 분석 시작 ⚡
              </Button>
              <p className="text-lg text-muted-foreground">
                8개 질문으로 당신의 입덕 성향을 분석해보세요
              </p>
            </div>
            
            {/* 시즌 정보 */}
            <div className="mt-12 p-8 glass rounded-2xl border border-primary/20 glow-primary">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold gradient-text">AI심쿵챌린지 2025</h3>
                <p className="text-5xl font-black text-foreground">101</p>
                <p className="text-lg text-muted-foreground">SEASON 1</p>
                <p className="text-base text-muted-foreground">
                  당신의 이상형을 찾아가는 특별한 여정
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
              <h2 className="text-4xl font-bold gradient-text">3단계 유저 경험</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Create → Collect → Grow: 나만의 아이돌 여정을 시작하세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="CREATE"
                description="입덕 성향 분석과 이상형 월드컵을 통해 나만의 완벽한 아이돌을 생성하고 포토카드를 제작하세요."
                icon={mbtiIcon}
                onClick={() => navigate('/mbti')}
                gradient="bg-gradient-to-br from-primary/20 to-accent/20"
              />
              
              <FeatureCard
                title="COLLECT"
                description="다양한 포토카드를 수집하고 월렛에 연결하여 나만의 디지털 컬렉션을 구축하세요."
                icon={photocardIcon}
                onClick={() => navigate('/collection')}
                gradient="bg-gradient-to-br from-accent/20 to-secondary/20"
              />
              
              <FeatureCard
                title="GROW"
                description="커뮤니티와 함께 컬렉션을 성장시키고 특별한 보상과 이벤트에 참여하세요."
                icon={tournamentIcon}
                onClick={() => navigate('/growth')}
                gradient="bg-gradient-to-br from-secondary/20 to-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold neon-text">
                  3단계로 완성하는 아이돌 여정
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg glow-primary">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-primary">CREATE</h3>
                    <p className="text-foreground">성향 분석 → 월드컵 → 포토카드 생성</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-secondary flex items-center justify-center text-3xl font-bold text-white shadow-lg glow-secondary">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-accent">COLLECT</h3>
                    <p className="text-foreground">월렛 연결 → 마이 박스 → 컬렉션 관리</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg glow-accent">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-secondary">GROW</h3>
                    <p className="text-foreground">커뮤니티 → 트레이딩 → 특별 이벤트</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold neon-text">
                지금 바로 시작해보세요!
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                몇 분만 투자하면 당신만의 완벽한 가상아이돌 이상형을 찾을 수 있습니다.
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/mbti')}
              variant="premium"
              size="xl"
              className="min-w-64 text-xl py-4"
            >
              🌟 입덕 여정 시작하기 🌟
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center bg-card/30 backdrop-blur-sm rounded-t-xl border-t border-border">
          <p className="text-muted-foreground">
            © 2024 Sui:AIdol³. Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;