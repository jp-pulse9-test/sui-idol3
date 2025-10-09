import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateRandomStats } from "@/components/IdolStatsDisplay";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

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
  const [idols, setIdols] = useState<Idol[]>([]);
  const [displayedIdols, setDisplayedIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
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

  const filteredIdols = (searchTerm || selectedGender !== "all" ? idols : displayedIdols).filter(idol => {
    const matchesSearch = idol.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = selectedGender === "all" || idol.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="아이돌 이름 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedGender === "all" ? "default" : "outline"}
                onClick={() => setSelectedGender("all")}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={selectedGender === "male" ? "default" : "outline"}
                onClick={() => setSelectedGender("male")}
                size="sm"
              >
                남자
              </Button>
              <Button
                variant={selectedGender === "female" ? "default" : "outline"}
                onClick={() => setSelectedGender("female")}
                size="sm"
              >
                여자
              </Button>
            </div>
          </div>
          
          {/* 빠른 매칭 옵션 */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/mbti')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI 빠른 매칭
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/worldcup')}
              className="gap-2"
            >
              🏆 이상형 월드컵
            </Button>
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
        ) : filteredIdols.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-xl text-muted-foreground">검색 결과가 없습니다</p>
              <Button onClick={() => setSearchTerm("")} variant="outline">
                초기화
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredIdols.map((idol) => (
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
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-sm truncate">{idol.name}</h3>
                  <Badge variant="outline" className="text-xs truncate w-full justify-center">
                    {idol.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    <span>대화 시작하기</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 로그인 안내 */}
        {!loading && !searchTerm && selectedGender === "all" && (
          <div className="mt-8">
            <Card className="max-w-2xl mx-auto p-8 bg-card border-2 border-border text-center space-y-4">
              <h3 className="text-xl font-bold gradient-text">🎯 더 많은 아이돌을 만나보세요!</h3>
              <p className="text-muted-foreground">
                현재 랜덤으로 선별된 8명의 아이돌을 보여드리고 있습니다.
              </p>
              <p className="text-muted-foreground">
                전체 아이돌 프로필과 상세한 능력치, 더욱 깊은 대화를 경험하려면 로그인이 필요합니다.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="mt-2 bg-gradient-primary hover:bg-gradient-secondary"
              >
                로그인하고 전체 아이돌 탐색하기 →
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdolGallery;
