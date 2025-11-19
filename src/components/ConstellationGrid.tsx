import { useEffect, useRef } from 'react';
import maleIdol1 from "@/assets/male-idol-1.jpg";
import maleIdol2 from "@/assets/male-idol-2.jpg";
import femaleIdol1 from "@/assets/female-idol-1.jpg";
import femaleIdol2 from "@/assets/female-idol-2.jpg";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  imageUrl?: string;
  image?: HTMLImageElement;
  pulseOffset: number;
}

export const ConstellationGrid = ({ side }: { side: 'left' | 'right' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const imagesLoadedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 256;
    canvas.height = window.innerHeight;

    // Image URLs based on side
    const imageUrls = side === 'left' 
      ? [maleIdol1, femaleIdol1, maleIdol2]
      : [femaleIdol2, maleIdol2, femaleIdol1];

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = [
        { x: 80, y: 150, size: 65, brightness: 1, pulseOffset: 0 },
        { x: 180, y: 300, size: 55, brightness: 0.9, pulseOffset: 1 },
        { x: 100, y: 480, size: 60, brightness: 0.95, pulseOffset: 2 },
        { x: 140, y: 650, size: 50, brightness: 0.85, pulseOffset: 3 },
        { x: 70, y: 820, size: 55, brightness: 0.9, pulseOffset: 4 },
      ];

      // Load images
      stars.forEach((star, index) => {
        if (index < imageUrls.length) {
          const img = new Image();
          img.src = imageUrls[index];
          img.onload = () => {
            star.image = img;
            if (index === imageUrls.length - 1) {
              imagesLoadedRef.current = true;
            }
          };
          star.imageUrl = imageUrls[index];
        }
      });

      return stars;
    };

    starsRef.current = initStars();
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.015;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const stars = starsRef.current;

      // 1. Draw constellation lines
      ctx.strokeStyle = 'rgba(176, 209, 42, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(176, 209, 42, 0.4)';
      ctx.shadowBlur = 8;
      
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (dist < 350) {
            // Animated line opacity
            const lineAlpha = 0.15 + Math.sin(time * 0.5 + i + j) * 0.08;
            ctx.strokeStyle = `rgba(176, 209, 42, ${lineAlpha})`;
            
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;

      // 2. Draw stars (idols)
      stars.forEach((star) => {
        // Pulsing effect
        const pulse = Math.sin(time * 1.5 + star.pulseOffset) * 0.15 + 0.85;
        const glowSize = star.size * 0.7;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowSize * pulse * 1.5
        );
        gradient.addColorStop(0, `rgba(176, 209, 42, ${star.brightness * pulse * 0.6})`);
        gradient.addColorStop(0.3, `rgba(176, 209, 42, ${star.brightness * 0.3 * pulse})`);
        gradient.addColorStop(0.7, `rgba(176, 209, 42, ${star.brightness * 0.1 * pulse})`);
        gradient.addColorStop(1, 'rgba(176, 209, 42, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize * pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 3. Draw idol image (circular clipping)
        if (star.image && imagesLoadedRef.current) {
          ctx.save();
          
          // Clip to circle
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw image
          ctx.drawImage(
            star.image,
            star.x - star.size / 2,
            star.y - star.size / 2,
            star.size,
            star.size
          );
          
          ctx.restore();
          
          // Neon green border with pulse
          ctx.strokeStyle = `rgba(176, 209, 42, ${pulse * 0.9})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = `rgba(176, 209, 42, ${pulse * 0.6})`;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size / 2 + 2, 0, Math.PI * 2);
          ctx.stroke();
          
          // Reset shadow
          ctx.shadowBlur = 0;
        } else {
          // Fallback: dark circle
          ctx.fillStyle = '#0a0a0a';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Border
          ctx.strokeStyle = `rgba(176, 209, 42, ${pulse})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size / 2 + 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Add sparkle effect
        if (Math.random() > 0.97) {
          const sparkleX = star.x + (Math.random() - 0.5) * star.size;
          const sparkleY = star.y + (Math.random() - 0.5) * star.size;
          ctx.fillStyle = `rgba(176, 209, 42, ${Math.random() * 0.8 + 0.2})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrame);
  }, [side]);

  return (
    <div className={`
      hidden md:block fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} 
      h-full w-64 overflow-hidden pointer-events-none z-0
    `}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: 0.4 }}
      />
    </div>
  );
};
