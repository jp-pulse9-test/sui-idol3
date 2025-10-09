import { useNavigate, useLocation } from "react-router-dom";
import { IdolChatInterface } from "@/components/IdolChatInterface";

const DemoChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get idol from navigation state, or use default demo idol
  const selectedIdol = location.state?.selectedIdol;
  
  const demoIdol = selectedIdol ? {
    id: selectedIdol.id?.toString() || 'demo-idol',
    name: selectedIdol.name || '지우',
    gender: (selectedIdol.gender || 'female') as 'male' | 'female',
    personality: selectedIdol.category || '메인보컬 | 감성파 | 팬들과의 소통을 최우선으로 생각하는 4세대 아이돌',
    image: selectedIdol.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    voiceId: 'xi3rF0t7dg7uN2M0WUhr'
  } : {
    id: 'demo-idol',
    name: '지우',
    gender: 'female' as const,
    personality: '메인보컬 | 감성파 | 팬들과의 소통을 최우선으로 생각하는 4세대 아이돌',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    voiceId: 'xi3rF0t7dg7uN2M0WUhr'
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <IdolChatInterface 
        idol={demoIdol}
        isOpen={true}
        onClose={() => navigate('/')}
      />
    </div>
  );
};

export default DemoChat;
