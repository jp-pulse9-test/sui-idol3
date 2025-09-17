import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Growth = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(1);
  const [experience, setExperience] = useState(150);
  const maxExp = 1000;

  const communityFeatures = [
    {
      title: "컬렉터 랭킹",
      description: "포토카드 수집량과 희귀도에 따른 랭킹 시스템",
      status: "active",
      reward: "특별 배지"
    },
    {
      title: "트레이딩 센터",
      description: "다른 컬렉터들과 포토카드 교환",
      status: "coming-soon",
      reward: "거래 수수료 할인"
    },
    {
      title: "이벤트 참여",
      description: "한정판 포토카드 획득 기회",
      status: "active",
      reward: "희귀 포토카드"
    },
    {
      title: "커뮤니티 투표",
      description: "새로운 아이돌 컨셉 투표 참여",
      status: "coming-soon",
      reward: "투표권 NFT"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Growth Hub</h1>
          <p className="text-muted-foreground">커뮤니티와 함께 성장하세요</p>
        </div>

        {/* User Stats */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">컬렉터 레벨</h3>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Level {userLevel}
                  </Badge>
                  <span className="text-muted-foreground">
                    {experience} / {maxExp} EXP
                  </span>
                </div>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
            <Progress value={(experience / maxExp) * 100} className="h-3" />
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">보유 포토카드</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">7</div>
                <div className="text-sm text-muted-foreground">희귀 포토카드</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-secondary">156</div>
                <div className="text-sm text-muted-foreground">커뮤니티 랭킹</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Community Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">커뮤니티 기능</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {communityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 bg-card/60 backdrop-blur-sm border-border card-hover">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <Badge 
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className={feature.status === 'active' ? 'bg-primary' : ''}
                    >
                      {feature.status === 'active' ? '이용 가능' : '출시 예정'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">보상: {feature.reward}</span>
                    <Button 
                      variant={feature.status === 'active' ? 'hero' : 'outline'}
                      size="sm"
                      disabled={feature.status !== 'active'}
                    >
                      {feature.status === 'active' ? '참여하기' : '준비중'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Events */}
        <Card className="p-6 bg-gradient-primary/20 backdrop-blur-sm border-primary/30">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">🎉 특별 이벤트</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">홀로그램 포토카드 이벤트</h4>
                  <p className="text-sm text-muted-foreground">3월 31일까지 • 한정 100장</p>
                </div>
                <Button variant="neon" size="sm">
                  참여하기
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">컬렉터 대전 시즌 1</h4>
                  <p className="text-sm text-muted-foreground">4월 1일 시작 • 우승 상금 1000 SUI</p>
                </div>
                <Button variant="outline" size="sm">
                  사전 등록
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Back Button */}
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

export default Growth;