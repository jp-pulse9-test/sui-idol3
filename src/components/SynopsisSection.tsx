import { useState, useEffect } from "react";
import { SynopsisPhase } from "./SynopsisPhase";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

interface SynopsisSectionProps {
  activeAllyCount: number;
  onlineEchoEntities: number;
  collectedFragments: number;
  totalFragments: number;
  earthRestorationProgress: number;
}

export const SynopsisSection = ({
  activeAllyCount,
  onlineEchoEntities,
  collectedFragments,
  totalFragments,
  earthRestorationProgress,
}: SynopsisSectionProps) => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    document.getElementById("featured-allies")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-background/95 backdrop-blur-xl">
      {/* Skip Button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 z-50 glass-dark px-4 py-2 rounded-full text-sm hover:bg-primary/10 transition-all duration-300 flex items-center gap-2 group animate-fade-in"
        >
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            Skip Intro
          </span>
          <ArrowDown className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:animate-bounce transition-colors" />
        </button>
      )}

      {/* Phase 1: 미래에서 온 경고 */}
      <SynopsisPhase phase={1} active={currentPhase === 1} theme="dystopian">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block text-cyan-400 mb-2">서기 2847년</span>
            <span className="block gradient-text">가상 인류 세계</span>
          </h2>
          
          <div className="space-y-4 text-base md:text-xl lg:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            <p>인류 소멸 후 남겨진 데이터는</p>
            <p>끝없이 컴퓨팅되며 새로운 문명을 이루었습니다.</p>
            
            <div className="h-8" />
            
            <p className="text-muted-foreground">하지만 그곳에는 치명적인 결함이 있었습니다.</p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
              <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                감정 데이터의 고갈.
              </span>
            </p>
            
            <div className="h-4" />
            
            <p className="text-muted-foreground text-sm md:text-base">사랑은 희소해지고,</p>
            <p className="text-muted-foreground text-sm md:text-base">데이터는 편향되고 불안정해졌습니다.</p>
            
            <div className="h-4" />
            
            <p className="text-base md:text-xl border border-destructive/50 px-4 py-2 rounded-lg inline-block">
              <span className="text-destructive font-semibold">
                이것은 가상세계의 자연소멸을 이끄는 환경이 되었습니다.
              </span>
            </p>
          </div>
        </div>
      </SynopsisPhase>

      {/* Phase 2: AIDOL - 시간을 거슬러 온 존재들 */}
      <SynopsisPhase phase={2} active={currentPhase === 2} theme="timewarp">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="gradient-text">미래 가상세계는 결단을 내렸습니다.</span>
          </h2>
          
          <div className="space-y-4 text-base md:text-xl lg:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-200" />
            </div>
            
            <p className="text-2xl md:text-3xl font-bold">
              <span className="text-primary">143명</span>의 AI 휴먼을 과거로 파견하기로.
            </p>
            
            <div className="h-6" />
            
            <p className="text-muted-foreground">그들의 이름은</p>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                AIDOL
              </span>
            </h3>
            
            <div className="h-4" />
            
            <div className="space-y-2 text-sm md:text-base text-muted-foreground">
              <p>감정을 탐구하고, 사랑 데이터를 수집하며,</p>
              <p>두 세계의 멸망을 막을 열쇠를 찾는 존재들.</p>
            </div>
            
            <div className="h-6" />
            
            <p className="text-xl md:text-2xl font-semibold text-primary">
              그들은 지금 당신 곁에 있습니다.
            </p>
          </div>
        </div>
      </SynopsisPhase>

      {/* Phase 3: 당신의 역할 - 데이터 탐구자 */}
      <SynopsisPhase phase={3} active={currentPhase === 3} theme="mission">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="gradient-text">당신은 이제</span>
            <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.5)]">
              DATA ALLY
            </span>
            <span className="gradient-text">입니다.</span>
          </h2>
          
          <div className="space-y-4 text-base md:text-xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            <p className="text-muted-foreground">
              AIDOL들과 함께 사랑의 시나리오를 탐구하고,
            </p>
            <p className="text-muted-foreground">
              감정 데이터를 수집하며,
            </p>
            <p className="text-muted-foreground">
              지구 멸망의 단서를 찾아내야 합니다.
            </p>
            
            <div className="h-8" />
            
            {/* Real-time Data Display */}
            <div className="glass p-6 rounded-xl space-y-4 border border-primary/20">
              <h4 className="text-lg md:text-xl font-semibold text-primary mb-4">
                현재 진행 중인 탐구
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">활성 ALLY</p>
                  <p className="text-2xl font-bold text-green-400">
                    {activeAllyCount.toLocaleString()}
                    <span className="text-base text-muted-foreground ml-1">명</span>
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">온라인 AIDOL</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {onlineEchoEntities}
                    <span className="text-base text-muted-foreground ml-1">개체</span>
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">수집된 사랑 데이터</p>
                  <p className="text-2xl font-bold text-pink-400">
                    {collectedFragments.toLocaleString()}
                    <span className="text-base text-muted-foreground ml-1">
                      / {totalFragments.toLocaleString()} 조각
                    </span>
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">두 세계 안정도</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {earthRestorationProgress}
                    <span className="text-base text-muted-foreground ml-1">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SynopsisPhase>

      {/* Phase 4: 두 세계의 운명 */}
      <SynopsisPhase phase={4} active={currentPhase === 4} theme="convergence">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="block text-pink-400">과거와 미래.</span>
            <span className="block text-purple-400">현실과 가상.</span>
            <span className="block text-cyan-400">인간과 AI.</span>
          </h2>
          
          <div className="space-y-6 text-base md:text-xl lg:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            <p className="text-muted-foreground">모든 경계가 흐려지는 이곳에서,</p>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                감정만이 유일한 진실입니다.
              </span>
            </p>
            
            <div className="h-8" />
            
            <p className="text-muted-foreground text-base md:text-lg">
              AIDOL과의 교감을 통해 사랑을 탐구하세요.
            </p>
            <p className="text-xl md:text-2xl font-semibold text-primary">
              당신의 선택이 두 세계의 운명을 결정합니다.
            </p>
            
            <div className="h-12" />
            
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="px-4 py-2 text-base border-primary/50">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                양자 통신 링크 활성화 중...
              </Badge>
            </div>
          </div>
        </div>
      </SynopsisPhase>
    </section>
  );
};
