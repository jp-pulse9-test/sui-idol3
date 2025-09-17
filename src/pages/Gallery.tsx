import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, Search, Filter, Users, Star } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

// K-POP 아이돌 이미지들
import femaleIdol1 from "@/assets/female-idol-1.jpg";
import femaleIdol2 from "@/assets/female-idol-2.jpg";
import maleIdol1 from "@/assets/male-idol-1.jpg";
import maleIdol2 from "@/assets/male-idol-2.jpg";

interface Idol {
  id: number;
  name: string;
  group: string;
  position: string;
  birthYear: number;
  height: number;
  bloodType: string;
  mbtiType: string;
  personality: string;
  image: string;
  likes: number;
  isLiked: boolean;
  tags: string[];
  debut: number;
  agency: string;
  stats: {
    vocal: number;
    dance: number;
    rap: number;
    visual: number;
    performance: number;
    charisma: number;
    variety: number;
    leadership: number;
  };
}

// 아이돌 이미지 배열
const idolImages = [femaleIdol1, femaleIdol2, maleIdol1, maleIdol2];

// 202명의 아이돌 데이터 생성
const generateIdols = (): Idol[] => {
  const names = [
    "지수", "제니", "로제", "리사", "아이린", "슬기", "웬디", "조이", "예리", "태연", "써니", "티파니", "효연", "유리", "수영", "윤아", "서현", "제시카", "크리스탈",
    "나연", "정연", "모모", "사나", "지효", "미나", "다현", "채영", "쯔위", "아이유", "선미", "청하", "화사", "솔라", "문별", "휘인", "지민", "유나", "채령", "류진", "예지",
    "카리나", "윈터", "지젤", "닝닝", "미연", "민니", "소연", "우기", "슈화", "장원영", "안유진", "레이", "리즈", "가을", "이서", "유진", "민주", "지우", "채원", "사쿠라",
    "은채", "카즈하", "윤진", "김채원", "가은", "승희", "재이", "율", "수민", "시연", "아린", "신비", "엄지", "소원", "예린", "은하", "유주", "나라", "하영", "지연",
    "소진", "이든", "엘라", "앨리스", "베라", "클로이", "다나", "에바", "파이", "그레이스", "헤일리", "아이비", "재즈", "켈리", "라일라", "마야", "니나", "올리비아", "페이",
    "퀸", "레이나", "세라", "테일러", "어슐라", "비올렛", "윌로우", "자라", "지민", "지호", "우영", "도현", "태현", "연준", "범규", "태현", "휴닝카이", "정국", "지민", "뷔",
    "진", "슈가", "제이홉", "RM", "마크", "재현", "런쥔", "제노", "해찬", "재민", "천러", "지성", "도영", "유타", "태일", "윈윈", "쿤", "텐", "루카스", "샤오쥔", "헨드리",
    "양양", "찬", "필릭스", "리노", "창빈", "현진", "한", "승민", "아이엔", "성훈", "제이", "제이크", "니키", "선우", "희승", "정원", "혁", "엔", "레오", "켄", "라비", "홍빈",
    "성민", "조슈아", "정한", "호시", "원우", "우지", "디케이", "민규", "도겸", "승관", "버논", "디노", "쇼누", "민혁", "기현", "형원", "주헌", "아이엠", "강다니엘", "박지훈",
    "이대휘", "김재환", "옹성우", "박성우", "라이관린", "윤지성", "황민현", "배진영", "하성운", "김동한", "박우진", "임영민", "김상균", "노태현", "김동빈", "유선호", "김용국",
    "주학년", "김태동", "김세정", "전소미", "김나영", "최유정", "임나영", "정채연", "주결경", "김도연", "강미나", "민주", "왕이런", "장가은", "시오리", "하니", "민지", "다니엘",
    "해린", "혜인", "은서", "윤서", "소희", "혜인", "김민주", "박지원", "최예나", "안유진", "홍은채", "김채원", "미야와키 사쿠라", "야부키 나코", "조유리", "이채연", "이채연",
    "강혜원", "김민주", "야마다 나에", "이가은", "혼다 히토미", "권은비", "박민영", "김소혜", "최유진", "주결경", "김도연"
  ];

  const groups = [
    "BLACKPINK", "Red Velvet", "Girls' Generation", "TWICE", "IVE", "(G)I-DLE", "aespa", "LE SSERAFIM", "NewJeans", "ITZY", "MAMAMOO", "GFRIEND", "EVERGLOW", "STAYC",
    "BTS", "TXT", "NCT", "Stray Kids", "ENHYPEN", "VIXX", "SEVENTEEN", "MONSTA X", "Wanna One", "X1", "IZ*ONE", "fromis_9", "VIVIZ", "NMIXX", "IVE", "LOONA",
    "OH MY GIRL", "WJSN", "PENTAGON", "BTOB", "INFINITE", "SHINee", "EXO", "Super Junior", "2PM", "GOT7", "DAY6", "CNBLUE", "FT Island", "BIGBANG", "iKON",
    "WINNER", "BLACKPINK", "2NE1", "Girls' Generation", "f(x)", "Red Velvet", "EXID", "AOA", "Apink", "Girl's Day", "KARA", "Wonder Girls"
  ];

  const positions = ["메인보컬", "리드보컬", "서브보컬", "메인래퍼", "리드래퍼", "메인댄서", "리드댄서", "센터", "비주얼", "리더", "막내"];
  const bloodTypes = ["A", "B", "AB", "O"];
  const mbtiTypes = ["ENFP", "INFP", "ENFJ", "INFJ", "ENTP", "INTP", "ENTJ", "INTJ", "ESFP", "ISFP", "ESFJ", "ISFJ", "ESTP", "ISTP", "ESTJ", "ISTJ"];
  const personalities = ["밝고 긍정적", "카리스마틱", "신비로운", "에너지틱", "사랑스러운", "우아한", "상큼한"];
  const agencies = ["SM", "YG", "JYP", "HYBE", "Starship", "Cube", "RBW", "Source Music", "ADOR", "Pledis", "FNC", "IST", "WM", "High Up"];

  return Array.from({ length: 202 }, (_, i) => ({
    id: i + 1,
    name: names[Math.floor(Math.random() * names.length)],
    group: groups[Math.floor(Math.random() * groups.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    birthYear: 1990 + Math.floor(Math.random() * 15),
    height: 155 + Math.floor(Math.random() * 25),
    bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
    mbtiType: mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)],
    personality: personalities[Math.floor(Math.random() * personalities.length)],
    image: idolImages[Math.floor(Math.random() * idolImages.length)],
    likes: Math.floor(Math.random() * 10000),
    isLiked: false,
    tags: [
      positions[Math.floor(Math.random() * positions.length)],
      personalities[Math.floor(Math.random() * personalities.length)]
    ],
    debut: 2010 + Math.floor(Math.random() * 15),
    agency: agencies[Math.floor(Math.random() * agencies.length)],
    stats: {
      vocal: 60 + Math.floor(Math.random() * 40),
      dance: 60 + Math.floor(Math.random() * 40),
      rap: 40 + Math.floor(Math.random() * 60),
      visual: 70 + Math.floor(Math.random() * 30),
      performance: 50 + Math.floor(Math.random() * 50),
      charisma: 50 + Math.floor(Math.random() * 50),
      variety: 40 + Math.floor(Math.random() * 60),
      leadership: 40 + Math.floor(Math.random() * 60)
    }
  }));
};

export const Gallery = () => {
  const navigate = useNavigate();
  const [idols, setIdols] = useState<Idol[]>([]);
  const [filteredIdols, setFilteredIdols] = useState<Idol[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedIdol, setSelectedIdol] = useState<Idol | null>(null);

  useEffect(() => {
    const generatedIdols = generateIdols();
    setIdols(generatedIdols);
    setFilteredIdols(generatedIdols);
  }, []);

  useEffect(() => {
    let filtered = idols.filter(idol => {
      const matchesSearch = idol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           idol.group.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === "" || idol.group === selectedGroup;
      const matchesPersonality = selectedPersonality === "" || idol.personality === selectedPersonality;
      
      return matchesSearch && matchesGroup && matchesPersonality;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "likes": return b.likes - a.likes;
        case "debut": return b.debut - a.debut;
        case "group": return a.group.localeCompare(b.group);
        default: return 0;
      }
    });

    setFilteredIdols(filtered);
  }, [idols, searchTerm, selectedGroup, selectedPersonality, sortBy]);

  const handleLike = (id: number) => {
    setIdols(prev => prev.map(idol => 
      idol.id === id 
        ? { ...idol, isLiked: !idol.isLiked, likes: idol.isLiked ? idol.likes - 1 : idol.likes + 1 }
        : idol
    ));
    toast.success("좋아요가 반영되었습니다!");
  };

  const uniqueGroups = [...new Set(idols.map(idol => idol.group))].sort();
  const uniquePersonalities = [...new Set(idols.map(idol => idol.personality))].sort();

  // 스탯 데이터 변환 함수
  const transformStatsData = (stats: Idol['stats']) => [
    { stat: '보컬', value: stats.vocal, fullMark: 100 },
    { stat: '댄스', value: stats.dance, fullMark: 100 },
    { stat: '랩', value: stats.rap, fullMark: 100 },
    { stat: '비주얼', value: stats.visual, fullMark: 100 },
    { stat: '퍼포먼스', value: stats.performance, fullMark: 100 },
    { stat: '카리스마', value: stats.charisma, fullMark: 100 },
    { stat: '예능감', value: stats.variety, fullMark: 100 },
    { stat: '리더십', value: stats.leadership, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
              >
                ← 홈으로
              </Button>
              <h1 className="text-3xl font-bold gradient-text">아이돌 갤러리</h1>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {filteredIdols.length}명
              </Badge>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="아이돌 이름이나 그룹명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">모든 그룹</option>
              {uniqueGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select
              value={selectedPersonality}
              onChange={(e) => setSelectedPersonality(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">모든 성향</option>
              {uniquePersonalities.map(personality => (
                <option key={personality} value={personality}>{personality}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="name">이름순</option>
              <option value="likes">인기순</option>
              <option value="debut">데뷔순</option>
              <option value="group">그룹순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {filteredIdols.map((idol) => (
            <Card 
              key={idol.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/80 backdrop-blur-sm border-border overflow-hidden"
              onClick={() => setSelectedIdol(idol)}
            >
              <div className="relative">
                {/* 아이돌 이미지 */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={idol.image} 
                    alt={idol.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                
                {/* 좋아요 버튼 */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full ${
                    idol.isLiked 
                      ? "bg-red-500/80 text-white hover:bg-red-600/80" 
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(idol.id);
                  }}
                >
                  <Heart className={`h-4 w-4 ${idol.isLiked ? "fill-current" : ""}`} />
                </Button>

                {/* 그룹 배지 */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 text-xs bg-black/60 text-white border-none"
                >
                  {idol.group}
                </Badge>
              </div>

              {/* 카드 정보 */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm truncate">{idol.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{idol.likes.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{idol.position}</span>
                    <span>{idol.mbtiType}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {idol.personality}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>데뷔: {idol.debut}년</div>
                  <div>{idol.agency} • {idol.height}cm</div>
                </div>

                {/* 8각 스탯 다이어그램 */}
                <div className="h-24 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={transformStatsData(idol.stats)}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="stat" 
                        tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Stats"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredIdols.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedIdol && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIdol(null)}
        >
          <Card 
            className="w-full max-w-2xl bg-background p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                <img 
                  src={selectedIdol.image} 
                  alt={selectedIdol.name}
                  className="w-64 h-80 object-cover rounded-lg"
                />
              </div>

              {/* 상세 정보 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedIdol(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">그룹:</span>
                    <div className="font-medium">{selectedIdol.group}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">포지션:</span>
                    <div className="font-medium">{selectedIdol.position}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MBTI:</span>
                    <div className="font-medium">{selectedIdol.mbtiType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">성향:</span>
                    <div className="font-medium">{selectedIdol.personality}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">데뷔:</span>
                    <div className="font-medium">{selectedIdol.debut}년</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">소속사:</span>
                    <div className="font-medium">{selectedIdol.agency}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">키:</span>
                    <div className="font-medium">{selectedIdol.height}cm</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">혈액형:</span>
                    <div className="font-medium">{selectedIdol.bloodType}형</div>
                  </div>
                </div>

                {/* 8각 스탯 차트 */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">능력치</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={transformStatsData(selectedIdol.stats)}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="stat" 
                          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Radar
                          name="능력치"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Gallery;