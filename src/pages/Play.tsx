import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayChatInterface } from '@/components/PlayChatInterface';

export default function Play() {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<any>(null);

  useEffect(() => {
    const idol = localStorage.getItem('selectedIdol');
    if (!idol) {
      navigate('/pick');
      return;
    }
    setSelectedIdol(JSON.parse(idol));
  }, [navigate]);

  if (!selectedIdol) {
    return (
      <div className="retro-terminal-page min-h-screen flex items-center justify-center">
        <div className="retro-terminal-box">
          <p className="text-lime-400 font-mono text-sm">
            <span className="text-green-500">SYSTEM:</span> Loading...
          </p>
        </div>
      </div>
    );
  }

  return <PlayChatInterface />;
}
