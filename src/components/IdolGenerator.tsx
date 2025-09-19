import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, User, Palette, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IdolData {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

const personalities = [
  "밝고 에너지 넘치는", "차분하고 신중한", "유머러스하고 장난기 많은",
  "따뜻하고 배려심 깊은", "카리스마 있고 강인한", "순수하고 천진난만한",
  "지적이고 사려깊은", "자신감 넘치고 당당한", "섬세하고 감성적인"
];

const concepts = [
  "청순", "섹시", "카리스마", "큐트", "엘레간트", "스포티", "레트로", "미니멀",
  "로맨틱", "펑키", "클래식", "모던", "빈티지", "어반"
];

export const IdolGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdol, setGeneratedIdol] = useState<IdolData | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  
  // 프로그래스 상태
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [sessionId, setSessionId] = useState('');

  const { toast } = useToast();

  // 실시간 진행상황 구독
  useEffect(() => {
    if (!sessionId || !isGenerating) return;

    const channel = supabase
      .channel(`idol-generation-${sessionId}`)
      .on('broadcast', { event: 'progress_update' }, (payload) => {
        const data = payload.payload;
        setProgress(data.percentage);
        setCurrentStage(data.stage === 'girls' ? '소녀 생성 중...' : '소년 생성 중...');
        setCurrentName(data.currentName);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isGenerating]);

  const generateSingleIdol = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-single-idol', {
        body: {
          customName: customName || undefined,
          customPersonality: selectedPersonality || undefined,
          customConcept: selectedConcept || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedIdol(data.idol);
        toast({
          title: "성공!",
          description: `${data.idol.name} 아이돌이 생성되었습니다! ✨`,
        });
        
        // 폼 리셋
        setCustomName('');
        setSelectedPersonality('');
        setSelectedConcept('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating idol:', error);
      toast({
        title: "오류",
        description: "아이돌 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomIdol = async () => {
    // 모든 필드를 비우고 랜덤 생성
    setCustomName('');
    setSelectedPersonality('');
    setSelectedConcept('');
    await generateSingleIdol();
  };

  const generateBatchIdols = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStage('');
    setCurrentName('');
    
    // 고유 세션 ID 생성
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    try {
      toast({
        title: "대량 생성 시작",
        description: "소녀 101명, 소년 101명 생성을 시작합니다... (약 5-10분 소요)",
      });

      const { data, error } = await supabase.functions.invoke('generate-batch-idols', {
        body: { sessionId: newSessionId }
      });

      if (error) throw error;

      if (data.success) {
        setProgress(100);
        setCurrentStage('완료!');
        setCurrentName('');
        toast({
          title: "🎉 대량 생성 완료!",
          description: `총 ${data.generated_count}명의 아이돌이 생성되었습니다!\n👧 소녀: ${data.girls_count}명 👦 소년: ${data.boys_count}명`,
        });
        setGeneratedIdol(null); // 이전 결과 클리어
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating batch idols:', error);
      toast({
        title: "오류",
        description: "대량 아이돌 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setSessionId('');
      setProgress(0);
      setCurrentStage('');
      setCurrentName('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            아이돌 생성기
          </CardTitle>
          <CardDescription>
            커스텀 설정으로 새로운 K-pop 아이돌을 생성하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="w-4 h-4" />
                이름 (선택사항)
              </label>
              <Input
                placeholder="예: 지민, 하니, 카리나..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Heart className="w-4 h-4" />
                성격 (선택사항)
              </label>
              <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
                <SelectTrigger disabled={isGenerating}>
                  <SelectValue placeholder="성격 선택..." />
                </SelectTrigger>
                <SelectContent>
                  {personalities.map((personality) => (
                    <SelectItem key={personality} value={personality}>
                      {personality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Palette className="w-4 h-4" />
                컨셉 (선택사항)
              </label>
              <Select value={selectedConcept} onValueChange={setSelectedConcept}>
                <SelectTrigger disabled={isGenerating}>
                  <SelectValue placeholder="컨셉 선택..." />
                </SelectTrigger>
                <SelectContent>
                  {concepts.map((concept) => (
                    <SelectItem key={concept} value={concept}>
                      {concept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={generateSingleIdol}
              disabled={isGenerating}
              className="flex items-center gap-2"
              variant="default"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              커스텀 생성
            </Button>
            
            <Button
              onClick={generateRandomIdol}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              랜덤 생성
            </Button>

            <Button
              onClick={generateBatchIdols}
              disabled={isGenerating}
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              👧101명 👦101명 대량생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 프로그래스바 */}
      {isGenerating && sessionId && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              아이돌 대량 생성 중...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{currentStage}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              {currentName && (
                <p className="text-center text-sm text-blue-600">
                  현재 생성 중: <span className="font-medium">{currentName}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedIdol && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-center text-green-700">
              ✨ 새로운 아이돌이 탄생했습니다!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img
                  src={generatedIdol.profile_image}
                  alt={generatedIdol.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h3 className="text-2xl font-bold text-primary">
                  {generatedIdol.name}
                </h3>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {generatedIdol.personality.split(' • ').map((trait, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {trait}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {generatedIdol.description}
                </p>
                
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700 italic">
                    "{generatedIdol.persona_prompt}"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};