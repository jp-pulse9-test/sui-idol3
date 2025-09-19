import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Sparkles, 
  Users, 
  Loader2, 
  RefreshCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { IdolGenerator } from './IdolGenerator';

interface DatabaseStats {
  totalIdols: number;
  recentIdols: any[];
}

export const DevTools: React.FC = () => {
  const { user } = useAuth();
  const SUPER_ADMIN_WALLET = "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc";
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DatabaseStats>({ totalIdols: 0, recentIdols: [] });
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 슈퍼 어드민 권한 체크
    const isSuperAdmin = user?.wallet_address === SUPER_ADMIN_WALLET;
    const urlParams = new URLSearchParams(window.location.search);
    const devModeRequested = urlParams.get('dev') === 'true';
    
    // 슈퍼 어드민이면서 dev=true 파라미터가 있을 때만 표시
    setIsVisible(isSuperAdmin && devModeRequested);
    
    if (isSuperAdmin && devModeRequested) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const { data: idols, error } = await supabase
        .from('idols')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const { count } = await supabase
        .from('idols')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalIdols: count || 0,
        recentIdols: idols || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('통계를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBatchIdols = async (count: number) => {
    setIsGeneratingBatch(true);
    setBatchProgress(0);
    
    try {
      for (let i = 0; i < count; i++) {
        const { data, error } = await supabase.functions.invoke('generate-single-idol', {
          body: {}
        });

        if (error) throw error;
        
        setBatchProgress(((i + 1) / count) * 100);
        
        if (data.success) {
          toast.success(`${i + 1}/${count}: ${data.idol.name} 생성 완료`);
        }
        
        // API 요청 제한을 위한 딜레이
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success(`🎉 ${count}명의 아이돌 생성이 완료되었습니다!`);
      await loadStats();
    } catch (error) {
      console.error('Error generating batch:', error);
      toast.error('배치 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgress(0);
    }
  };

  const clearAllIdols = async () => {
    if (!window.confirm('정말로 모든 아이돌 데이터를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('idols')
        .delete()
        .neq('id', 0); // 모든 레코드 삭제

      if (error) throw error;
      
      toast.success('모든 아이돌 데이터가 삭제되었습니다.');
      await loadStats();
    } catch (error) {
      console.error('Error clearing idols:', error);
      toast.error('데이터 삭제에 실패했습니다.');
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('idols')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `idols-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('데이터가 내보내기 되었습니다.');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-primary" />
            슈퍼 어드민 도구
            <Badge variant="destructive" className="text-xs">ADMIN</Badge>
          </CardTitle>
          <CardDescription>
            아이돌 데이터 관리 및 생성 도구 (권한 필요)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                생성기
              </TabsTrigger>
              <TabsTrigger value="batch" className="text-xs">
                <Database className="w-3 h-3 mr-1" />
                배치
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                통계
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-3 mt-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">개별 아이돌 생성</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  커스텀 설정으로 아이돌을 하나씩 생성합니다
                </p>
                <IdolGenerator />
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-3 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium text-center">배치 생성</h4>
                
                {isGeneratingBatch && (
                  <div className="space-y-2">
                    <Progress value={batchProgress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">
                      생성 중... {Math.round(batchProgress)}%
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateBatchIdols(1)}
                    disabled={isGeneratingBatch}
                    className="text-xs"
                  >
                    1명
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateBatchIdols(5)}
                    disabled={isGeneratingBatch}
                    className="text-xs"
                  >
                    5명
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateBatchIdols(10)}
                    disabled={isGeneratingBatch}
                    className="text-xs"
                  >
                    10명
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateBatchIdols(20)}
                    disabled={isGeneratingBatch}
                    className="text-xs"
                  >
                    20명
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportData}
                    disabled={isGeneratingBatch}
                    className="w-full text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    데이터 내보내기
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={clearAllIdols}
                    disabled={isGeneratingBatch}
                    className="w-full text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    모든 데이터 삭제
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">데이터베이스 현황</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadStats}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalIdols}
                </div>
                <div className="text-xs text-muted-foreground">
                  전체 아이돌 수
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h5 className="text-sm font-medium">최근 생성된 아이돌</h5>
                {stats.recentIdols.length > 0 ? (
                  <div className="space-y-1">
                    {stats.recentIdols.map((idol) => (
                      <div key={idol.id} className="flex items-center gap-2 text-xs">
                        <img
                          src={idol.profile_image}
                          alt={idol.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium">{idol.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {idol.personality.split(' • ')[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    아직 생성된 아이돌이 없습니다
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};