import { useNavigate } from "react-router-dom";
import { IdolChatInterface } from "@/components/IdolChatInterface";

const DemoChat = () => {
  const navigate = useNavigate();
  
  const demoIdol = {
    id: 'demo-idol',
    name: '지우',
    gender: 'female' as const,
    personality: '메인보컬 | 감성파 | 팬들과의 소통을 최우선으로 생각하는 4세대 아이돌',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    level: 3,
    badges: ['신인', '체험판'],
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
