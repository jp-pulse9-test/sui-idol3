import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import heroBg from "@/assets/hero-bg.jpg";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center space-y-8 px-4">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black gradient-text animate-glow">
              AI.DOL
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              가상아이돌 이상형 찾기
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              MBTI 분석을 통해 나와 가장 잘 맞는 가상아이돌을 찾고,<br />
              이상형 월드컵으로 최종 선택한 후 나만의 포토카드를 만들어보세요!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/mbti')}
              variant="hero"
              size="xl"
              className="min-w-48"
            >
              시작하기
            </Button>
            <Button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              variant="outline"
              size="xl"
              className="min-w-48 border-white/30 text-white hover:bg-white/10"
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold gradient-text">서비스 특징</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              과학적인 성격 분석부터 개성 넘치는 포토카드 제작까지
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="MBTI 성격 분석"
              description="16가지 성격 유형 분석을 통해 당신의 성격을 정확히 파악하고, 가장 잘 맞는 이상형을 추천받으세요."
              icon={mbtiIcon}
              onClick={() => navigate('/mbti')}
            />
            
            <FeatureCard
              title="이상형 월드컵"
              description="MBTI 결과를 바탕으로 선별된 가상아이돌들과 함께하는 재미있는 이상형 월드컵 게임을 즐겨보세요."
              icon={tournamentIcon}
              onClick={() => navigate('/mbti')}
            />
            
            <FeatureCard
              title="포토카드 제작"
              description="최종 선택한 이상형으로 나만의 특별한 포토카드를 만들고 친구들과 공유해보세요."
              icon={photocardIcon}
              onClick={() => navigate('/mbti')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">
              지금 바로 시작해보세요!
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              몇 분만 투자하면 당신만의 완벽한 가상아이돌 이상형을 찾을 수 있습니다.
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/mbti')}
            variant="outline"
            size="xl"
            className="bg-white text-primary hover:bg-white/90 border-white min-w-48"
          >
            MBTI 테스트 시작
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 AI.DOL. Made with ❤️ by Lovable
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
