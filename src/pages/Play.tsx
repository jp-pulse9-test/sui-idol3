import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Heart, Trophy, Clock, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRANCHES } from "@/data/branches";
import { getMissionsByBranch } from "@/data/salvationMissions";
import { branchService } from "@/services/branchService";
import type { Branch, SalvationMission, BranchProgress, VRI } from "@/types/branch";
import StoryGameModalEnhanced from "@/components/StoryGameModalEnhanced";

const Play = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userVRI, setUserVRI] = useState<VRI>({
    total: 0,
    love: 0,
    trust: 0,
    empathy: 0,
    lastUpdated: new Date()
  });
  const [branchProgress, setBranchProgress] = useState<BranchProgress[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedMission, setSelectedMission] = useState<SalvationMission | null>(null);
  const [daysUntil2028, setDaysUntil2028] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('selectedIdol');
    if (stored) {
      setSelectedIdol(JSON.parse(stored));
    } else {
      toast.error("Please select your idol first");
      navigate('/pick');
      return;
    }

    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 게스트 모드: 로컬 저장소에서 데이터 로드
      if (!user) {
        const localVRI = localStorage.getItem('guestVRI');
        const localProgress = localStorage.getItem('guestProgress');
        
        if (localVRI) {
          setUserVRI(JSON.parse(localVRI));
        }
        
        if (localProgress) {
          setBranchProgress(JSON.parse(localProgress));
        }
        
        setDaysUntil2028(branchService.getDaysUntil2028());
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Load VRI
      const { data: vriData } = await supabase
        .from('user_vri')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vriData) {
        setUserVRI({
          total: vriData.total_vri,
          love: vriData.love_vri,
          trust: vriData.trust_vri,
          empathy: vriData.empathy_vri,
          lastUpdated: new Date(vriData.last_updated)
        });
      }

      // Load branch progress
      const { data: progressData } = await supabase
        .from('branch_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        const progress: BranchProgress[] = progressData.map(p => ({
          branchId: p.branch_id,
          currentVRI: p.current_vri,
          maxVRI: p.max_vri,
          completedMissions: p.completed_missions as string[],
          isCleared: p.is_cleared,
          firstClearedAt: p.first_cleared_at ? new Date(p.first_cleared_at) : undefined,
          lastPlayedAt: new Date(p.last_played_at)
        }));
        setBranchProgress(progress);
      }

      // Calculate days until 2028
      setDaysUntil2028(branchService.getDaysUntil2028());

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branch: Branch) => {
    if (!branch.isUnlocked && branch.requiredVRI && userVRI.total < branch.requiredVRI) {
      toast.error(`Unlock this branch with ${branch.requiredVRI} total VRI`);
      return;
    }
    setSelectedBranch(branch);
  };

  const handleMissionStart = (mission: SalvationMission) => {
    if (mission.isCompleted) {
      toast.info("You've already completed this mission");
      return;
    }
    setSelectedMission(mission);
  };

  const handleSaveProgress = async () => {
    if (!userId) {
      toast.error('지갑을 연결하여 진행 상황을 저장하세요');
      navigate('/auth');
      return;
    }
    
    try {
      // 로컬 데이터를 Supabase로 동기화
      const localVRI = localStorage.getItem('guestVRI');
      const localProgress = localStorage.getItem('guestProgress');
      
      if (localVRI) {
        const vriData = JSON.parse(localVRI);
        await supabase.from('user_vri').upsert({
          user_id: userId,
          total_vri: vriData.total,
          love_vri: vriData.love,
          trust_vri: vriData.trust,
          empathy_vri: vriData.empathy
        });
      }
      
      if (localProgress) {
        const progressData = JSON.parse(localProgress);
        for (const progress of progressData) {
          await supabase.from('branch_progress').upsert({
            user_id: userId,
            branch_id: progress.branchId,
            current_vri: progress.currentVRI,
            max_vri: progress.maxVRI,
            completed_missions: progress.completedMissions,
            is_cleared: progress.isCleared
          });
        }
      }
      
      toast.success('진행 상황이 블록체인에 저장되었습니다!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다');
    }
  };

  const getBranchProgressData = (branchId: string): BranchProgress | undefined => {
    return branchProgress.find(p => p.branchId === branchId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading salvation data...</p>
      </div>
    );
  }

  if (!selectedIdol) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const availableBranches = BRANCHES.filter(b => 
    b.isUnlocked || (b.requiredVRI && userVRI.total >= b.requiredVRI)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-destructive/5 pb-20">
      {/* 2028 Countdown Header */}
      <div className="relative bg-gradient-to-r from-destructive/20 via-destructive/10 to-background border-b border-destructive/30 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Salvation Missions
              </h1>
              <p className="text-sm text-muted-foreground">
                Restore lost values across the timelines
              </p>
              {!userId && (
                <Badge variant="outline" className="mt-2">
                  게스트 모드 (저장하려면 지갑 연결)
                </Badge>
              )}
            </div>
            <div className="text-right flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Clock className="w-5 h-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">
                    {daysUntil2028} days
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">until 2028 decay</p>
              </div>
              {!userId && (
                <Button onClick={handleSaveProgress} size="sm" variant="outline">
                  지갑 연결하여 저장
                </Button>
              )}
            </div>
          </div>

          {/* VRI Progress */}
          <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Total VRI (Value Restoration Index)
              </span>
              <span className="text-lg font-bold text-primary">
                {userVRI.total}
              </span>
            </div>
            <Progress value={(userVRI.total / 3000) * 100} className="h-2 mb-3" />
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500" />
                <span className="text-muted-foreground">Love: {userVRI.love}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="text-muted-foreground">Trust: {userVRI.trust}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-muted-foreground">Empathy: {userVRI.empathy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Selection */}
      {!selectedBranch ? (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Choose a Timeline Branch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BRANCHES.map((branch) => {
              const progress = getBranchProgressData(branch.id);
              const isUnlocked = branch.isUnlocked || (branch.requiredVRI ? userVRI.total >= branch.requiredVRI : false);
              
              return (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all ${
                    isUnlocked
                      ? 'hover:shadow-lg hover:border-primary/50'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    background: isUnlocked ? `linear-gradient(135deg, ${branch.theme.primary}10, transparent)` : undefined
                  }}
                  onClick={() => isUnlocked && handleBranchSelect(branch)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" style={{ borderColor: branch.theme.primary }}>
                        {branch.year}
                      </Badge>
                      {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      {progress?.isCleared && <Trophy className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {branch.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <Badge variant={
                          branch.difficulty === 'normal' ? 'secondary' :
                          branch.difficulty === 'hard' ? 'default' : 'destructive'
                        }>
                          {branch.difficulty}
                        </Badge>
                      </div>
                      {progress && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="font-medium">{progress.currentVRI} / {progress.maxVRI} VRI</span>
                          </div>
                          <Progress value={(progress.currentVRI / progress.maxVRI) * 100} className="h-1" />
                        </div>
                      )}
                      {!isUnlocked && branch.requiredVRI && (
                        <p className="text-xs text-destructive">
                          Requires {branch.requiredVRI} total VRI
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mission List for Selected Branch */
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedBranch(null)}
              className="mb-4"
            >
              ← Back to Branches
            </Button>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {selectedBranch.name}
            </h2>
            <p className="text-muted-foreground">{selectedBranch.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMissionsByBranch(selectedBranch.id).map((mission) => {
              const isCompleted = getBranchProgressData(selectedBranch.id)?.completedMissions.includes(mission.id);
              
              return (
                <Card
                  key={mission.id}
                  className={`cursor-pointer transition-all ${
                    isCompleted
                      ? 'opacity-60 border-green-500/50'
                      : 'hover:shadow-lg hover:border-primary/50'
                  }`}
                  onClick={() => handleMissionStart(mission)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-base">{mission.title}</CardTitle>
                      {isCompleted && <Trophy className="w-5 h-5 text-green-500" />}
                    </div>
                    <CardDescription className="text-sm">
                      {mission.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">VRI Reward:</span>
                        <span className="font-bold text-primary">+{mission.vriReward}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Value Type:</span>
                        <Badge variant="outline">{mission.valueType}</Badge>
                      </div>
                      {isCompleted && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Completed ✓
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/pantheon')}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Pantheon
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Home
          </Button>
        </div>
      </div>

      {/* Placeholder for Future Mission Modal */}
      {selectedMission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMission(null)}>
          <Card className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{selectedMission.title}</CardTitle>
              <CardDescription>{selectedMission.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Mission gameplay will be implemented here. For now, this is a placeholder.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setSelectedMission(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Play;
