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
  const [stats, setStats] = useState<DatabaseStats>({ totalIdols: 0, recentIdols: [] });
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 통계를 로드
    loadStats();
  }, []);

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

  return (
    <div className="w-full">
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-6 h-6 text-primary" />
            슈퍼 어드민 도구
            <Badge variant="destructive" className="text-sm">ADMIN</Badge>
          </CardTitle>
          <CardDescription className="text-base">
            아이돌 데이터 관리 및 생성 도구 (권한 필요)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="generator" className="text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                개별 생성
              </TabsTrigger>
              <TabsTrigger value="batch" className="text-sm font-medium">
                <Database className="w-4 h-4 mr-2" />
                배치 작업
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                데이터 통계
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">개별 아이돌 생성</h4>
                  <p className="text-sm text-muted-foreground">
                    커스텀 설정으로 아이돌을 하나씩 생성합니다
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <IdolGenerator />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4 mt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2">배치 생성 및 관리</h4>
                  <p className="text-sm text-muted-foreground">
                    여러 아이돌을 한 번에 생성하거나 데이터를 관리합니다
                  </p>
                </div>
                
                {isGeneratingBatch && (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                    <Progress value={batchProgress} className="w-full h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      생성 진행 중... {Math.round(batchProgress)}%
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-3">빠른 배치 생성</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => generateBatchIdols(1)}
                        disabled={isGeneratingBatch}
                        className="h-12"
                      >
                        1명 생성
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generateBatchIdols(5)}
                        disabled={isGeneratingBatch}
                        className="h-12"
                      >
                        5명 생성
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generateBatchIdols(10)}
                        disabled={isGeneratingBatch}
                        className="h-12"
                      >
                        10명 생성
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generateBatchIdols(20)}
                        disabled={isGeneratingBatch}
                        className="h-12"
                      >
                        20명 생성
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h5 className="font-medium mb-3">데이터 관리</h5>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={exportData}
                        disabled={isGeneratingBatch}
                        className="w-full h-12"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        데이터 내보내기 (JSON)
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={clearAllIdols}
                        disabled={isGeneratingBatch}
                        className="w-full h-12"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        모든 데이터 삭제 (주의!)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">데이터베이스 현황</h4>
                    <p className="text-sm text-muted-foreground">실시간 아이돌 데이터 통계</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadStats}
                    disabled={isLoading}
                    className="h-10"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    새로고침
                  </Button>
                </div>

                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.totalIdols}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    전체 아이돌 수
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h5 className="font-semibold">최근 생성된 아이돌</h5>
                  {stats.recentIdols.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recentIdols.map((idol) => (
                        <div key={idol.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          <img
                            src={idol.profile_image}
                            alt={idol.name}
                            className="w-10 h-10 rounded-full border-2 border-primary/20"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{idol.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(idol.created_at).toLocaleString('ko-KR')}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {idol.personality.split(' • ')[0]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        아직 생성된 아이돌이 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};