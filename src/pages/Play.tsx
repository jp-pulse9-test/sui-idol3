import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Heart, Trophy, Clock, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRANCHES } from "@/data/branches";
import { getMissionsByBranch } from "@/data/salvationMissions";
import { branchService } from "@/services/branchService";
import type { Branch, SalvationMission, BranchProgress, VRI } from "@/types/branch";
import EpisodeGameModal from "@/components/EpisodeGameModal";
import { useLanguage } from '@/contexts/LanguageContext';
import { getScenesByMissionId } from '@/data/missionScenes';
import { AsciiProgress } from '@/components/AsciiProgress';
import { AsciiBox } from '@/components/AsciiBox';

const Play = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
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
  const [currentEpisode, setCurrentEpisode] = useState<any | null>(null);
  const [selectedIdolForStory, setSelectedIdolForStory] = useState<any | null>(null);

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
      toast.error(`${t('play.branch.unlock')} ${branch.requiredVRI} ${t('play.branch.totalVRI')}`);
      return;
    }
    setSelectedBranch(branch);
  };

  const handleMissionStart = (mission: SalvationMission) => {
    if (mission.isCompleted) {
      toast.info(t('play.mission.alreadyCompleted'));
      return;
    }

    // Convert SalvationMission to Episode format
    const episode = {
      id: mission.id,
      title: language === 'en' ? mission.titleEn : mission.title,
      description: language === 'en' ? mission.descriptionEn : mission.description,
      category: mission.valueType,
      difficulty: selectedBranch?.difficulty || 'Normal',
      turns: 8
    };

    // Create idol data for story
    const idol = {
      id: selectedIdol?.id || 1,
      name: selectedIdol?.name || 'Idol',
      personality: selectedIdol?.personality || 'friendly',
      image: selectedIdol?.profile_image || '/placeholder.svg',
      persona_prompt: selectedIdol?.persona_prompt || ''
    };

    setCurrentEpisode(episode);
    setSelectedIdolForStory(idol);
  };

  const handleSaveProgress = async () => {
    if (!userId) {
      toast.error(t('play.save.error'));
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
      
      toast.success(t('play.save.success'));
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('play.save.failed'));
    }
  };

  const getBranchProgressData = (branchId: string): BranchProgress | undefined => {
    return branchProgress.find(p => p.branchId === branchId);
  };

  // Language utility functions
  const getLocalizedBranchName = (branch: Branch) => 
    language === 'en' ? branch.nameEn : branch.name;

  const getLocalizedBranchDescription = (branch: Branch) => 
    language === 'en' ? branch.descriptionEn : branch.description;

  const getLocalizedMissionTitle = (mission: SalvationMission) => 
    language === 'en' ? mission.titleEn : mission.title;

  const getLocalizedMissionDescription = (mission: SalvationMission) => 
    language === 'en' ? mission.descriptionEn : mission.description;

  if (loading) {
    return (
      <div className="retro-terminal-page min-h-screen flex items-center justify-center">
        <p className="text-lime-400 font-mono animate-pulse">{t('play.loading')}...</p>
      </div>
    );
  }

  if (!selectedIdol) {
    return (
      <div className="retro-terminal-page min-h-screen flex items-center justify-center">
        <p className="text-lime-400 font-mono animate-pulse">LOADING SYSTEM...</p>
      </div>
    );
  }

  const availableBranches = BRANCHES.filter(b => 
    b.isUnlocked || (b.requiredVRI && userVRI.total >= b.requiredVRI)
  );

  return (
    <div className="retro-terminal-page min-h-screen pb-20">
      {/* 2028 Countdown Header */}
      <div className="relative p-6 border-b-2 border-lime-500/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-lime-400 mb-1 font-mono retro-glow ascii-text">
                {'>>>'} {t('play.salvation.title').toUpperCase()}
              </h1>
              <p className="text-sm text-lime-500/70 font-mono">
                {t('play.salvation.subtitle')}
              </p>
              {!userId && (
                <div className="mt-2 inline-block border border-lime-500/50 px-2 py-1 text-xs text-lime-400 font-mono">
                  [{t('play.guest.badge')}]
                </div>
              )}
            </div>
            <div className="text-right flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-xs text-lime-500/70 font-mono">⏰</span>
                  <span className="text-2xl font-bold text-red-500 font-mono retro-glow">
                    {daysUntil2028}
                  </span>
                  <span className="text-sm text-lime-400 font-mono">{t('play.countdown.days')}</span>
                </div>
                <p className="text-xs text-lime-500/50 font-mono">{t('play.countdown.until')}</p>
              </div>
              {!userId && (
                <button 
                  onClick={handleSaveProgress}
                  className="border-2 border-lime-500 bg-black/50 text-lime-400 px-3 py-1 text-xs font-mono hover:bg-lime-500/10 transition-colors"
                >
                  {t('play.guest.saveButton')}
                </button>
              )}
            </div>
          </div>

          {/* VRI Progress */}
          <AsciiBox title="VRI STATUS" className="mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lime-400">TOTAL VRI:</span>
                <span className="text-green-300 font-bold">{userVRI.total}</span>
              </div>
              <AsciiProgress value={userVRI.total} max={3000} width={30} />
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-lime-500/20">
                <div>
                  <div className="text-xs text-pink-400 mb-1">💖 {t('play.vri.love')}</div>
                  <div className="text-lime-300 font-bold">{userVRI.love}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-400 mb-1">✨ {t('play.vri.trust')}</div>
                  <div className="text-lime-300 font-bold">{userVRI.trust}</div>
                </div>
                <div>
                  <div className="text-xs text-orange-400 mb-1">🔥 {t('play.vri.empathy')}</div>
                  <div className="text-lime-300 font-bold">{userVRI.empathy}</div>
                </div>
              </div>
            </div>
          </AsciiBox>
        </div>
      </div>

      {/* Branch Selection */}
      {!selectedBranch ? (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-lime-400 mb-6 font-mono retro-glow">
            {'>>>'} {t('play.branch.choose').toUpperCase()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BRANCHES.map((branch) => {
              const progress = getBranchProgressData(branch.id);
              const isUnlocked = branch.isUnlocked || (branch.requiredVRI ? userVRI.total >= branch.requiredVRI : false);
              
              return (
                <div
                  key={branch.id}
                  className={`retro-terminal-box p-4 transition-all ${
                    isUnlocked
                      ? 'cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] hover:border-lime-400'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  onClick={() => isUnlocked && handleBranchSelect(branch)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="inline-block border border-lime-500/50 px-2 py-1 text-xs text-lime-400 font-mono">
                      [{branch.year}]
                    </div>
                    <div className="flex gap-2">
                      {!isUnlocked && <Lock className="w-4 h-4 text-red-500" />}
                      {progress?.isCleared && <Trophy className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </div>
                  
                  <h3 className="text-lg text-lime-300 font-mono mb-2 retro-glow">
                    {getLocalizedBranchName(branch)}
                  </h3>
                  <p className="text-xs text-lime-500/70 font-mono mb-4 leading-relaxed">
                    {getLocalizedBranchDescription(branch)}
                  </p>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-lime-500/70">{t('play.branch.difficulty')}:</span>
                      <span className={`${
                        branch.difficulty === 'normal' ? 'text-green-400' :
                        branch.difficulty === 'hard' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        [{branch.difficulty.toUpperCase()}]
                      </span>
                    </div>
                    
                    {progress && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lime-500/70">{t('play.branch.progress')}:</span>
                          <span className="text-lime-300">{progress.currentVRI}/{progress.maxVRI}</span>
                        </div>
                        <AsciiProgress value={progress.currentVRI} max={progress.maxVRI} width={15} />
                      </div>
                    )}
                    
                    {!isUnlocked && branch.requiredVRI && (
                      <p className="text-red-400 mt-2 border-t border-red-500/30 pt-2">
                        ! {t('play.branch.requires')} {branch.requiredVRI} VRI
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mission List for Selected Branch */
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setSelectedBranch(null)}
              className="mb-4 border-2 border-lime-500 bg-black/50 text-lime-400 px-4 py-2 text-sm font-mono hover:bg-lime-500/10 transition-colors"
            >
              {'<'} {t('play.branch.back')}
            </button>
            <h2 className="text-2xl font-bold text-lime-400 mb-2 font-mono retro-glow">
              {getLocalizedBranchName(selectedBranch)}
            </h2>
            <p className="text-lime-500/70 font-mono text-sm">{getLocalizedBranchDescription(selectedBranch)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMissionsByBranch(selectedBranch.id).map((mission) => {
              const isCompleted = getBranchProgressData(selectedBranch.id)?.completedMissions.includes(mission.id);
              
              return (
                <div
                  key={mission.id}
                  className={`retro-terminal-box p-4 transition-all ${
                    isCompleted
                      ? 'opacity-60 border-green-500/50'
                      : 'cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] hover:border-lime-400'
                  }`}
                  onClick={() => !isCompleted && handleMissionStart(mission)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base text-lime-300 font-mono retro-glow flex-1">
                      {getLocalizedMissionTitle(mission)}
                    </h3>
                    {isCompleted && <Trophy className="w-5 h-5 text-green-500 ml-2" />}
                  </div>
                  
                  <p className="text-sm text-lime-500/70 font-mono mb-4 leading-relaxed">
                    {getLocalizedMissionDescription(mission)}
                  </p>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-lime-500/70">{t('play.mission.vriReward')}:</span>
                      <span className="text-green-400 font-bold">+{mission.vriReward} VRI</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lime-500/70">{t('play.mission.valueType')}:</span>
                      <span className="text-cyan-400">[{mission.valueType}]</span>
                    </div>
                    {isCompleted && (
                      <div className="text-green-400 mt-2 border-t border-green-500/30 pt-2 text-center">
                        ✓ {t('play.mission.completed')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t-2 border-lime-500/30 p-4 z-10">
        <div className="max-w-6xl mx-auto flex gap-4">
          <button
            onClick={() => navigate('/pantheon')}
            className="flex-1 border-2 border-lime-500 bg-black/50 text-lime-400 px-4 py-3 font-mono hover:bg-lime-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            {t('play.nav.pantheon')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border-2 border-lime-500 bg-black/50 text-lime-400 px-4 py-3 font-mono hover:bg-lime-500/10 transition-colors"
          >
            {t('play.nav.home')}
          </button>
        </div>
      </div>

      {/* Episode Game Modal */}
      {currentEpisode && selectedIdolForStory && (
        <EpisodeGameModal
          episode={currentEpisode}
          idol={selectedIdolForStory}
          isOpen={true}
          onClose={() => {
            setCurrentEpisode(null);
            setSelectedIdolForStory(null);
          }}
          onComplete={(result) => {
            console.log('Episode completed!', result);
            
            // Update VRI
            const vriReward = result.vriReward || 50;
            const valueType = selectedMission?.valueType || 'love';
            
            // Update VRI in state
            const vriMap: { [key: string]: keyof VRI } = {
              'Love': 'love',
              'Trust': 'trust',
              'Empathy': 'empathy'
            };
            
            const vriKey = vriMap[valueType] || 'love';
            
            const newVRI = {
              ...userVRI,
              [vriKey]: (userVRI[vriKey] as number) + vriReward,
              total: userVRI.total + vriReward
            };
            
            setUserVRI(newVRI);
            
            // Update mission completion
            if (selectedMission && selectedBranch) {
              const currentProgress = getBranchProgressData(selectedBranch.id);
              const completedMissions = currentProgress?.completedMissions || [];
              
              if (!completedMissions.includes(selectedMission.id)) {
                const updatedProgress = branchProgress.map(p => 
                  p.branchId === selectedBranch.id
                    ? { ...p, completedMissions: [...p.completedMissions, selectedMission.id], currentVRI: p.currentVRI + vriReward }
                    : p
                );
                
                // If no existing progress for this branch, create it
                if (!currentProgress) {
                  updatedProgress.push({
                    branchId: selectedBranch.id,
                    currentVRI: vriReward,
                    maxVRI: selectedBranch.maxVRI || 1000,
                    completedMissions: [selectedMission.id],
                    isCleared: false,
                    lastPlayedAt: new Date()
                  });
                }
                
                setBranchProgress(updatedProgress);
                
                // Save to Supabase if logged in
                if (userId) {
                  supabase.from('user_vri').upsert({
                    user_id: userId,
                    total_vri: newVRI.total,
                    love_vri: newVRI.love,
                    trust_vri: newVRI.trust,
                    empathy_vri: newVRI.empathy
                  });
                  
                  supabase.from('branch_progress').upsert({
                    user_id: userId,
                    branch_id: selectedBranch.id,
                    current_vri: (currentProgress?.currentVRI || 0) + vriReward,
                    max_vri: selectedBranch.maxVRI || 1000,
                    completed_missions: [...completedMissions, selectedMission.id],
                    is_cleared: false,
                    last_played_at: new Date().toISOString()
                  });
                } else {
                  // Save to localStorage for guest mode
                  localStorage.setItem('guestProgress', JSON.stringify(updatedProgress));
                  localStorage.setItem('guestVRI', JSON.stringify(newVRI));
                }
              }
            }

            toast.success(`${language === 'en' ? 'Episode completed!' : '에피소드 완료!'} +${vriReward} VRI, ${result.memoryCards} ${language === 'en' ? 'memory cards!' : '메모리 카드!'}`);

            setCurrentEpisode(null);
            setSelectedIdolForStory(null);
            setSelectedMission(null);
          }}
        />
      )}
    </div>
  );
};

export default Play;
