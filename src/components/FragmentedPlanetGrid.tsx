import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface IdolData {
  id: number;
  name: string;
  profile_image: string;
  gender?: string;
  category?: string;
}

interface Fragment {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: 'rust' | 'cyan' | 'purple';
  speedX: number;
  speedY: number;
  idolData?: IdolData;
  image?: HTMLImageElement;
}

interface FragmentedPlanetGridProps {
  side: 'left' | 'right';
  idols?: IdolData[];
}

export const FragmentedPlanetGrid = ({ side, idols = [] }: FragmentedPlanetGridProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 256;
    canvas.height = window.innerHeight;

    // Initialize fragments with idol data
    const fragmentsData: Omit<Fragment, 'idolData' | 'image'>[] = [
      { x: 50, y: 100, size: 80, rotation: 15, opacity: 0.7, color: 'rust', speedX: 0.1, speedY: 0.05 },
      { x: 120, y: 250, size: 60, rotation: -20, opacity: 0.8, color: 'cyan', speedX: -0.08, speedY: 0.06 },
      { x: 80, y: 420, size: 70, rotation: 45, opacity: 0.6, color: 'purple', speedX: 0.12, speedY: -0.04 },
      { x: 140, y: 600, size: 55, rotation: -35, opacity: 0.75, color: 'rust', speedX: -0.09, speedY: 0.07 },
      { x: 90, y: 750, size: 65, rotation: 60, opacity: 0.65, color: 'cyan', speedX: 0.11, speedY: -0.05 },
    ];

    // Assign idols to some fragments (not all)
    const fragments: Fragment[] = fragmentsData.map((frag, index) => {
      const fragment: Fragment = { ...frag };
      
      // Assign idol to first 3-4 fragments if available
      if (index < Math.min(4, idols.length) && idols[index]) {
        const idolIndex = side === 'left' ? index : index + 4;
        const idol = idols[idolIndex % idols.length];
        
        fragment.idolData = idol;
        
        // Load image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = idol.profile_image;
        img.onload = () => {
          fragment.image = img;
        };
      }
      
      return fragment;
    });

    let time = 0;
    let animationFrame: number;

    const colors = {
      rust: ['rgba(255, 140, 66, ', 'rgba(216, 106, 47, '],
      cyan: ['rgba(0, 180, 216, ', 'rgba(0, 150, 199, '],
      purple: ['rgba(157, 78, 221, ', 'rgba(114, 9, 183, ']
    };

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connection lines (Fragment Links)
      ctx.strokeStyle = 'rgba(255, 140, 66, 0.1)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(0, 180, 216, 0.3)';
      ctx.shadowBlur = 10;
      
      fragments.forEach((frag1, i) => {
        fragments.forEach((frag2, j) => {
          if (i < j) {
            const dist = Math.hypot(frag1.x - frag2.x, frag1.y - frag2.y);
            if (dist < 350) {
              const pulse = Math.sin(time * 3 + i + j) * 0.3 + 0.7;
              ctx.globalAlpha = (1 - dist/350) * 0.3 * pulse;
              ctx.beginPath();
              ctx.moveTo(frag1.x, frag1.y);
              ctx.lineTo(frag2.x, frag2.y);
              ctx.stroke();
            }
          }
        });
      });
      
      ctx.shadowBlur = 0;
      
      // Update and draw fragments
      fragments.forEach((frag, index) => {
        // Update position with slow drift
        frag.x += frag.speedX;
        frag.y += frag.speedY;
        
        // Wrap around edges
        if (frag.x < -frag.size) frag.x = canvas.width + frag.size;
        if (frag.x > canvas.width + frag.size) frag.x = -frag.size;
        if (frag.y < -frag.size) frag.y = canvas.height + frag.size;
        if (frag.y > canvas.height + frag.size) frag.y = -frag.size;
        
        const pulse = Math.sin(time * 2 + index) * 0.15 + 0.85;
        const wobble = Math.sin(time + index) * 5;
        
        ctx.save();
        ctx.translate(frag.x, frag.y + wobble);
        ctx.rotate((frag.rotation + time * 10) * Math.PI / 180);
        
        // Get colors for this fragment
        const [color1, color2] = colors[frag.color];
        
        // Draw irregular polygon (fragment shape) as clip path
        const sides = 6;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const randomness = 0.8 + Math.sin(time * 2 + i + index) * 0.2;
          const radius = frag.size * randomness * pulse;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // If fragment has idol image, draw it
        if (frag.image && frag.idolData) {
          ctx.save();
          ctx.clip();
          
          // Draw image with slight opacity
          ctx.globalAlpha = 0.85 * pulse;
          const imgSize = frag.size * 1.8;
          ctx.drawImage(
            frag.image,
            -imgSize / 2,
            -imgSize / 2,
            imgSize,
            imgSize
          );
          
          // Draw subtle overlay gradient
          const overlayGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, frag.size);
          overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          overlayGradient.addColorStop(0.6, color1 + '0.2)');
          overlayGradient.addColorStop(1, color2 + '0.4)');
          ctx.fillStyle = overlayGradient;
          ctx.fill();
          
          ctx.restore();
          
          // Draw border glow
          ctx.strokeStyle = color1 + (frag.opacity * pulse * 0.8) + ')';
          ctx.lineWidth = 2;
          ctx.shadowColor = color1 + '0.6)';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Draw gradient fill for non-idol fragments
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, frag.size);
          gradient.addColorStop(0, color1 + (frag.opacity * pulse) + ')');
          gradient.addColorStop(0.5, color2 + (frag.opacity * 0.5 * pulse) + ')');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add border glow
          ctx.strokeStyle = color1 + (frag.opacity * pulse * 0.8) + ')';
          ctx.lineWidth = 2;
          ctx.shadowColor = color1 + (frag.opacity * pulse) + ')';
          ctx.shadowBlur = 15;
          ctx.stroke();
        }
        
        ctx.restore();
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle click events
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      // Check if click is within any fragment with idol
      fragments.forEach((frag) => {
        if (!frag.idolData) return;
        
        const dx = clickX - frag.x;
        const dy = clickY - frag.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < frag.size) {
          navigate(`/demo-chat?idol=${frag.idolData.id}`);
        }
      });
    };

    // Handle window resize
    const handleResize = () => {
      canvas.height = window.innerHeight;
    };
    
    canvas.addEventListener('click', handleClick);
    canvas.style.cursor = 'pointer';
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [side, idols, navigate]);

  return (
    <div 
      className={`hidden md:block fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-64 overflow-hidden pointer-events-auto`}
      style={{ zIndex: 0 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-60"
      />
    </div>
  );
};
