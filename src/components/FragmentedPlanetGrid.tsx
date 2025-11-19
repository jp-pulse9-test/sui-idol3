import { useEffect, useRef } from 'react';

interface Fragment {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: 'rust' | 'cyan' | 'purple';
  speedX: number;
  speedY: number;
}

interface FragmentedPlanetGridProps {
  side: 'left' | 'right';
}

export const FragmentedPlanetGrid = ({ side }: FragmentedPlanetGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 256;
    canvas.height = window.innerHeight;

    // Initialize fragments
    const fragments: Fragment[] = [
      { x: 50, y: 100, size: 80, rotation: 15, opacity: 0.7, color: 'rust', speedX: 0.1, speedY: 0.05 },
      { x: 120, y: 250, size: 60, rotation: -20, opacity: 0.8, color: 'cyan', speedX: -0.08, speedY: 0.06 },
      { x: 80, y: 420, size: 70, rotation: 45, opacity: 0.6, color: 'purple', speedX: 0.12, speedY: -0.04 },
      { x: 140, y: 600, size: 55, rotation: -35, opacity: 0.75, color: 'rust', speedX: -0.09, speedY: 0.07 },
      { x: 90, y: 750, size: 65, rotation: 60, opacity: 0.65, color: 'cyan', speedX: 0.11, speedY: -0.05 },
    ];

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
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, frag.size);
        gradient.addColorStop(0, color1 + (frag.opacity * pulse) + ')');
        gradient.addColorStop(0.5, color2 + (frag.opacity * 0.5 * pulse) + ')');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw irregular polygon (fragment shape)
        const sides = 6;
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
        ctx.fill();
        
        // Add border glow
        ctx.strokeStyle = color1 + (frag.opacity * pulse * 0.8) + ')';
        ctx.lineWidth = 2;
        ctx.shadowColor = color1 + (frag.opacity * pulse) + ')';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        ctx.restore();
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className={`hidden md:block fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-64 overflow-hidden pointer-events-none`}
      style={{ zIndex: 0 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-60"
      />
    </div>
  );
};
