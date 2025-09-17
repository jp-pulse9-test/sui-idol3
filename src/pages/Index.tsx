import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";

import idolFacesGrid from "@/assets/idol-faces-grid.jpg";

// 배경 아이돌 그리드 컴포넌트
const IdolGrid = ({ side }: { side: 'left' | 'right' }) => {
  return (
    <div className={`
      fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-64
      overflow-hidden opacity-30
    `}>
      <div 
        className="w-full h-full bg-cover bg-center bg-repeat-y animate-pulse"
        style={{ 
          backgroundImage: `url(${idolFacesGrid})`,
          backgroundSize: 'cover',
          filter: 'blur(1px) brightness(0.8)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent"></div>
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
          <div className="text-center space-y-8 bg-card/80 backdrop-blur-sm p-12 rounded-2xl border border-border shadow-glow-primary">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black neon-text animate-neon-flicker font-dancing">
                AI.DOL
              </h1>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  가상아이돌 이상형 찾기
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  아이돌 입덕 성향 분석을 통해 당신이 반하는 모먼트를 찾고,<br />
                  이상형 월드컵으로 최종 선택한 후 나만의 포토카드를 만들어보세요!
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <Button
                onClick={() => navigate('/mbti')}
                variant="neon"
                size="xl"
                className="min-w-64 text-xl py-4 animate-glow"
              >
                ⚡ 입덕 성향 분석 시작 ⚡
              </Button>
              <p className="text-sm text-muted-foreground">
                8개 질문으로 당신의 입덕 성향을 분석해보세요
              </p>
            </div>
            
            {/* 시즌 정보 */}
            <div className="mt-8 p-4 bg-gradient-primary/10 rounded-lg border border-primary/30">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-primary">AI.DOL CHALLENGE</h3>
                <p className="text-3xl font-black text-foreground">101</p>
                <p className="text-sm text-muted-foreground">SEASON 1</p>
                <p className="text-xs text-muted-foreground">
                  101명의 소년, 101명의 소녀와 함께하는 특별한 만남
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
              <h2 className="text-4xl font-bold gradient-text">서비스 특징</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                과학적인 입덕 분석부터 개성 넘치는 포토카드 제작까지
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="입덕 성향 분석"
                description="아이돌에게 반하는 8가지 모먼트 분석을 통해 당신의 입덕 성향을 정확히 파악하세요."
                icon={mbtiIcon}
                onClick={() => navigate('/mbti')}
              />
              
              <FeatureCard
                title="이상형 월드컵"
                description="입덕 성향 분석 결과를 바탕으로 선별된 202명의 가상아이돌과 함께하는 월드컵을 즐겨보세요."
                icon={tournamentIcon}
                onClick={() => navigate('/mbti')}
              />
              
              <FeatureCard
                title="포토카드 제작"
                description="최종 선택한 이상형으로 나만의 특별한 네온 스타일 포토카드를 만들고 친구들과 공유해보세요."
                icon={photocardIcon}
                onClick={() => navigate('/mbti')}
              />
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
            © 2024 AI.DOL. Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;