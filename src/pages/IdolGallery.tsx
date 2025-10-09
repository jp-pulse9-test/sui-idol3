import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateRandomStats } from "@/components/IdolStatsDisplay";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";

interface Idol {
  id: number;
  name: string;
  profile_image: string;
  gender: string;
  category: string;
  concept: string;
  created_at: string;
}

const IdolGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idols, setIdols] = useState<Idol[]>([]);
  const [displayedIdols, setDisplayedIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdol, setHoveredIdol] = useState<number | null>(null);

  useEffect(() => {
    loadIdols();
  }, []);

  const loadIdols = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_public_idol_data');

      if (error) throw error;

      const allIdols = data || [];
      setIdols(allIdols);
      
      // 랜덤하게 8명 선택
      const shuffled = [...allIdols].sort(() => Math.random() - 0.5);
      setDisplayedIdols(shuffled.slice(0, 8));
    } catch (error) {
      console.error('Error loading idols:', error);
      toast.error('아이돌을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (!user) {
      toast.error("검색하려면 로그인이 필요합니다");
      navigate('/auth');
    }
  };

  const handleIdolClick = (idol: Idol) => {
    // 아이돌과 바로 대화 시작
    navigate('/demo-chat', { 
      state: { 
        selectedIdol: idol,
        isDemoMode: true 
      } 
    });
  };

  const getIdolStats = (idol: Idol) => {
    const stats = generateRandomStats(idol.category);
    return [
      { stat: 'Vocal', current: stats.vocal.current, potential: stats.vocal.potential },
      { stat: 'Dance', current: stats.dance.current, potential: stats.dance.potential },
      { stat: 'Visual', current: stats.visual.current, potential: stats.visual.potential },
      { stat: 'Variety', current: stats.variety.current, potential: stats.variety.potential },
      { stat: 'Rap', current: stats.rap.current, potential: stats.rap.potential },
      { stat: 'Charisma', current: stats.charisma.current, potential: stats.charisma.potential },
      { stat: 'Acting', current: stats.acting.current, potential: stats.acting.potential },
      { stat: 'Leadership', current: stats.leadership.current, potential: stats.leadership.potential }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              홈으로
            </Button>
            <h1 className="text-2xl font-bold gradient-text">AIDOL 탐색하기</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          {/* Google-style Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="AIDOL 이름 검색..."
                onClick={handleSearchClick}
                readOnly
                className="pl-12 h-12 text-base rounded-full border-2 hover:shadow-lg transition-shadow cursor-pointer"
              />
            </div>
          </div>
          
          {/* 매칭 옵션 - 재디자인 */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card 
              className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/10 to-transparent border-2"
              onClick={() => navigate('/mbti')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI 빠른 매칭</h3>
                  <p className="text-sm text-muted-foreground">나와 딱 맞는 아이돌 찾기</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-accent/10 to-transparent border-2"
              onClick={() => navigate('/worldcup')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/20">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">이상형 월드컵</h3>
                  <p className="text-sm text-muted-foreground">선택으로 찾는 나의 이상형</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">아이돌을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedIdols.map((idol) => (
              <Card
                key={idol.id}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => handleIdolClick(idol)}
                onMouseEnter={() => setHoveredIdol(idol.id)}
                onMouseLeave={() => setHoveredIdol(null)}
              >
                <div className="aspect-square relative flex items-center justify-center p-4">
                  <img
                    src={idol.profile_image}
                    alt={idol.name}
                    className="w-32 h-32 object-cover rounded-full border-4 border-border shadow-lg"
                  />
                  
                  {/* 능력치 오버레이 */}
                  {hoveredIdol === idol.id && (
                    <div className="absolute inset-0 bg-black/95 flex items-center justify-center transition-all duration-300 p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getIdolStats(idol)}>
                          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                          <PolarAngleAxis 
                            dataKey="stat" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }}
                          />
                          <Radar
                            name="현재"
                            dataKey="current"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.5}
                          />
                          <Radar
                            name="잠재력"
                            dataKey="potential"
                            stroke="hsl(var(--accent))"
                            fill="hsl(var(--accent))"
                            fillOpacity={0.2}
                            strokeDasharray="3 3"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-bold text-sm truncate">{idol.name}</h3>
                  <Badge variant="outline" className="text-xs truncate w-full justify-center">
                    {idol.category}
                  </Badge>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2">
                    <Sparkles className="w-3 h-3" />
                    <span>대화 시작하기</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 로그인 안내 */}
        {!loading && (
          <div className="mt-8">
            <Card className="max-w-2xl mx-auto p-8 bg-card border-2 border-border text-center space-y-4">
              <h3 className="text-xl font-bold gradient-text">더 많은 AIDOL을 만나보세요!</h3>
              <p className="text-muted-foreground">
                전체 AIDOL을 검색하려면 로그인이 필요합니다.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="mt-2 bg-gradient-primary hover:bg-gradient-secondary"
              >
                지갑 연결로 로그인
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdolGallery;
