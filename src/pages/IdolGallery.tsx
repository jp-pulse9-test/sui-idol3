import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");

  useEffect(() => {
    loadIdols();
  }, []);

  const loadIdols = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_public_idol_data');

      if (error) throw error;

      setIdols(data || []);
    } catch (error) {
      console.error('Error loading idols:', error);
      toast.error('아이돌을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredIdols = idols.filter(idol => {
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
            <h1 className="text-2xl font-bold gradient-text">아이돌 갤러리</h1>
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
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={idol.profile_image}
                    alt={idol.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {idol.concept}
                      </Badge>
                      <p className="text-xs text-white/80">{idol.category}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-sm truncate">{idol.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    <span>대화 시작하기</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        {!loading && filteredIdols.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              총 {filteredIdols.length}명의 아이돌 · 클릭하여 대화 시작
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdolGallery;
