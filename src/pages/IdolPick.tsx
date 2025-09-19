import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wallet } from "lucide-react";

interface Idol {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
}

const IdolPick = () => {
  const navigate = useNavigate();
  const [idols, setIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdol, setSelectedIdol] = useState<Idol | null>(null);
  const [minting, setMinting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    checkWalletConnection();
    fetchIdols();
  }, []);

  const checkWalletConnection = () => {
    const address = localStorage.getItem('walletAddress');
    if (!address) {
      toast.error("먼저 지갑을 연결해주세요!");
      navigate('/');
      return;
    }
    setWalletAddress(address);
  };

  const fetchIdols = async () => {
    try {
      const { data, error } = await supabase
        .from('idols')
        .select('*')
        .order('id');

      if (error) throw error;
      setIdols(data || []);
    } catch (error) {
      console.error('아이돌 데이터 로드 실패:', error);
      toast.error("아이돌 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleIdolSelect = async (idol: Idol) => {
    if (minting) return;
    
    setSelectedIdol(idol);
    setMinting(true);

    try {
      toast.loading("IdolCard를 민팅 중입니다...");

      // 1. 사용자 생성/확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(
          { wallet_address: walletAddress },
          { onConflict: 'wallet_address' }
        )
        .select()
        .single();

      if (userError) throw userError;

      // 2. Vault 생성/확인
      const { data: vaultData, error: vaultError } = await supabase
        .from('vaults')
        .upsert(
          { 
            user_id: userData.id, 
            idol_id: idol.id,
            level: 0,
            debut_done: false,
            rise_points: 0
          },
          { onConflict: 'user_id,idol_id' }
        )
        .select()
        .single();

      if (vaultError) throw vaultError;

      // 3. IdolCard 생성 (임시로 오프체인만)
      const { data: cardData, error: cardError } = await supabase
        .from('idol_cards')
        .insert({
          vault_id: vaultData.id,
          token_id: `idol_${idol.id}_${Date.now()}`, // 임시 토큰 ID
          tx_digest: `temp_${Date.now()}` // 임시 트랜잭션 해시
        })
        .select()
        .single();

      if (cardError) throw cardError;

      // 로컬 스토리지에 선택된 아이돌 정보 저장
      localStorage.setItem('selectedIdol', JSON.stringify(idol));
      localStorage.setItem('vaultId', vaultData.id);

      toast.dismiss();
      toast.success(`${idol.name}의 IdolCard가 발급되었습니다!`);
      
      setTimeout(() => {
        navigate('/vault');
      }, 1500);

    } catch (error) {
      console.error('IdolCard 민팅 실패:', error);
      toast.dismiss();
      toast.error("IdolCard 민팅에 실패했습니다. 다시 시도해주세요.");
      setSelectedIdol(null);
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">아이돌 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              연결된 지갑: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold gradient-text">
            아이돌 Pick
          </h1>
          <p className="text-xl text-muted-foreground">
            함께 성장할 아이돌을 선택하고 IdolCard를 받아보세요
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span>선택 시 IdolCard NFT가 즉시 발급됩니다</span>
          </div>
        </div>

        {/* 아이돌 카드들 */}
        <div className="grid md:grid-cols-3 gap-6">
          {idols.map((idol) => (
            <Card
              key={idol.id}
              className={`p-6 glass-dark border-white/10 card-hover group cursor-pointer relative overflow-hidden transition-all duration-300 ${
                selectedIdol?.id === idol.id 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : ''
              } ${minting ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => handleIdolSelect(idol)}
            >
              <div className="space-y-6">
                {/* 아이돌 이미지 */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 overflow-hidden">
                    {idol.profile_image.startsWith('/placeholder') ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{idol.name[0]}</span>
                      </div>
                    ) : (
                      <img 
                        src={idol.profile_image} 
                        alt={idol.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span class="text-2xl font-bold text-white">${idol.name[0]}</span>
                            </div>
                          `;
                        }}
                      />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold gradient-text">{idol.name}</h3>
                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary">
                    {idol.personality}
                  </Badge>
                </div>

                {/* 설명 */}
                <p className="text-muted-foreground text-center leading-relaxed text-sm">
                  {idol.description}
                </p>

                {/* 선택 버튼 */}
                <Button 
                  variant="hero"
                  size="lg"
                  className="w-full btn-modern py-3"
                  disabled={minting}
                >
                  {selectedIdol?.id === idol.id && minting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      민팅 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {idol.name} 선택하기
                    </>
                  )}
                </Button>
              </div>

              {/* 선택 효과 */}
              {selectedIdol?.id === idol.id && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-primary/90 text-white px-4 py-2 rounded-lg font-bold">
                    선택됨!
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="text-center space-y-4 pt-8">
          <div className="glass rounded-lg p-6 space-y-3">
            <h4 className="font-bold text-lg">📱 다음 단계</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. 아이돌 선택 → IdolCard NFT 발급</p>
              <p>2. Vault에서 일상 스토리 시작</p>
              <p>3. 스토리 클리어 → MemoryCard 획득</p>
              <p>4. 데뷔 에피소드 해금 → Rookie 승급</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IdolPick;