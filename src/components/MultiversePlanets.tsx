import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Planet {
  x: number;
  y: number;
  radius: number;
  baseColor: string;
  glowColor: string;
  rotation: number;
  rotationSpeed: number;
}

interface BranchNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  parentPlanet: 'left' | 'right';
  angle: number;
  distance: number;
  pulsePhase: number;
  destination?: string;
  label?: string;
}

interface EnergyParticle {
  progress: number;
  pathIndex: number;
  speed: number;
  size: number;
}

interface MultiversePlanetsProps {
  className?: string;
}

export const MultiversePlanets = ({ className = "" }: MultiversePlanetsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<BranchNode | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    // Planet configuration
    const isMobile = window.innerWidth < 768;
    const planetRadius = isMobile ? 60 : 120;
    const planetDistance = isMobile ? canvas.height / 4 : canvas.width / 3;

    const leftPlanet: Planet = {
      x: canvas.width / (2 * window.devicePixelRatio) - planetDistance / 2,
      y: canvas.height / (2 * window.devicePixelRatio),
      radius: planetRadius,
      baseColor: 'hsl(217, 91%, 60%)', // primary blue
      glowColor: 'hsl(217, 91%, 70%)',
      rotation: 0,
      rotationSpeed: 0.001,
    };

    const rightPlanet: Planet = {
      x: canvas.width / (2 * window.devicePixelRatio) + planetDistance / 2,
      y: canvas.height / (2 * window.devicePixelRatio),
      radius: planetRadius,
      baseColor: 'hsl(280, 89%, 66%)', // purple
      glowColor: 'hsl(280, 89%, 76%)',
      rotation: 0,
      rotationSpeed: 0.0008,
    };

    // Branch nodes
    const branchNodes: BranchNode[] = [];
    const branchCount = isMobile ? 30 : 80;
    
    // Left planet branches (past/reality)
    const leftBranches = [
      { label: 'Trust 2017', destination: '/play' },
      { label: 'Empathy 2024', destination: '/play' },
      { label: 'Love 2026', destination: '/play' },
    ];

    // Right planet branches (future/digital)
    const rightBranches = [
      { label: 'Awaken', destination: '/pick' },
      { label: 'Mission', destination: '/play' },
      { label: 'Ascend', destination: '/pantheon' },
    ];

    // Create branch nodes for left planet
    for (let i = 0; i < branchCount / 2; i++) {
      const angle = (Math.PI * 2 * i) / (branchCount / 2);
      const distance = planetRadius * 1.5 + Math.random() * planetRadius * 2;
      const x = leftPlanet.x + Math.cos(angle) * distance;
      const y = leftPlanet.y + Math.sin(angle) * distance;
      
      const isMainBranch = i % Math.floor(branchCount / 6) === 0 && leftBranches[Math.floor(i / Math.floor(branchCount / 6))];
      
      branchNodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: isMainBranch ? 6 : 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.4,
        parentPlanet: 'left',
        angle,
        distance,
        pulsePhase: Math.random() * Math.PI * 2,
        ...(isMainBranch ? leftBranches[Math.floor(i / Math.floor(branchCount / 6))] : {}),
      });
    }

    // Create branch nodes for right planet
    for (let i = 0; i < branchCount / 2; i++) {
      const angle = (Math.PI * 2 * i) / (branchCount / 2);
      const distance = planetRadius * 1.5 + Math.random() * planetRadius * 2;
      const x = rightPlanet.x + Math.cos(angle) * distance;
      const y = rightPlanet.y + Math.sin(angle) * distance;
      
      const isMainBranch = i % Math.floor(branchCount / 6) === 0 && rightBranches[Math.floor(i / Math.floor(branchCount / 6))];
      
      branchNodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: isMainBranch ? 6 : 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.4,
        parentPlanet: 'right',
        angle,
        distance,
        pulsePhase: Math.random() * Math.PI * 2,
        ...(isMainBranch ? rightBranches[Math.floor(i / Math.floor(branchCount / 6))] : {}),
      });
    }

    // Energy particles
    const particles: EnergyParticle[] = [];
    const particleCount = isMobile ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        progress: Math.random(),
        pathIndex: Math.floor(Math.random() * 3),
        speed: 0.001 + Math.random() * 0.002,
        size: 1 + Math.random() * 2,
      });
    }

    // Draw functions
    const drawPlanet = (planet: Planet) => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        planet.x, planet.y, planet.radius * 0.5,
        planet.x, planet.y, planet.radius * 2
      );
      glowGradient.addColorStop(0, planet.glowColor.replace(')', ', 0.3)').replace('hsl', 'hsla'));
      glowGradient.addColorStop(0.5, planet.glowColor.replace(')', ', 0.1)').replace('hsl', 'hsla'));
      glowGradient.addColorStop(1, planet.glowColor.replace(')', ', 0)').replace('hsl', 'hsla'));
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Planet sphere
      const gradient = ctx.createRadialGradient(
        planet.x - planet.radius * 0.3,
        planet.y - planet.radius * 0.3,
        planet.radius * 0.1,
        planet.x,
        planet.y,
        planet.radius
      );
      gradient.addColorStop(0, planet.glowColor);
      gradient.addColorStop(0.7, planet.baseColor);
      gradient.addColorStop(1, planet.baseColor.replace('60%', '40%'));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Surface details (rotating)
      ctx.save();
      ctx.translate(planet.x, planet.y);
      ctx.rotate(planet.rotation);
      
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const x = Math.cos(angle) * planet.radius * 0.5;
        const y = Math.sin(angle) * planet.radius * 0.5;
        
        ctx.fillStyle = planet.baseColor.replace('60%', '50%').replace(')', ', 0.3)').replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(x, y, planet.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };

    const drawEnergyConnections = () => {
      const paths = [
        { curve: 0.3, offset: -30 },
        { curve: 0.5, offset: 0 },
        { curve: 0.3, offset: 30 },
      ];

      paths.forEach((path, idx) => {
        const cpY = (leftPlanet.y + rightPlanet.y) / 2 + path.offset;
        const cpX = (leftPlanet.x + rightPlanet.x) / 2;
        const curveY = cpY - (rightPlanet.x - leftPlanet.x) * path.curve;

        // Energy line
        ctx.strokeStyle = 'hsla(217, 91%, 60%, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftPlanet.x + leftPlanet.radius, leftPlanet.y);
        ctx.quadraticCurveTo(cpX, curveY, rightPlanet.x - rightPlanet.radius, rightPlanet.y);
        ctx.stroke();

        // Particles along the path
        particles.filter(p => p.pathIndex === idx).forEach(particle => {
          const t = particle.progress;
          const x = (1 - t) * (1 - t) * (leftPlanet.x + leftPlanet.radius) +
                   2 * (1 - t) * t * cpX +
                   t * t * (rightPlanet.x - rightPlanet.radius);
          const y = (1 - t) * (1 - t) * leftPlanet.y +
                   2 * (1 - t) * t * curveY +
                   t * t * rightPlanet.y;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
          gradient.addColorStop(0, 'hsla(45, 93%, 58%, 0.8)'); // amber
          gradient.addColorStop(1, 'hsla(45, 93%, 58%, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    };

    const drawBranchNodes = () => {
      // Draw connections between nearby nodes
      ctx.strokeStyle = 'hsla(217, 91%, 60%, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < branchNodes.length; i++) {
        const node1 = branchNodes[i];
        for (let j = i + 1; j < branchNodes.length; j++) {
          const node2 = branchNodes[j];
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100 && node1.parentPlanet === node2.parentPlanet) {
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      branchNodes.forEach(node => {
        const pulseOpacity = node.opacity + Math.sin(Date.now() * 0.002 + node.pulsePhase) * 0.2;
        const isHovered = hoveredNode === node;
        const size = isHovered ? node.size * 1.5 : node.size;

        // Glow effect
        if (node.label || isHovered) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 4);
          gradient.addColorStop(0, `hsla(142, 76%, 36%, ${pulseOpacity * 0.6})`); // green
          gradient.addColorStop(1, 'hsla(142, 76%, 36%, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node
        ctx.fillStyle = node.label 
          ? `hsla(142, 76%, 36%, ${pulseOpacity})` 
          : `hsla(215, 16%, 47%, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (node.label && (isHovered || size > 4)) {
          ctx.fillStyle = 'hsl(0, 0%, 98%)';
          ctx.font = '12px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - size - 10);
        }
      });
    };

    // Animation loop
    const animate = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Update planets
      leftPlanet.rotation += leftPlanet.rotationSpeed;
      rightPlanet.rotation += rightPlanet.rotationSpeed;

      // Update particles
      particles.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
      });

      // Update branch nodes with parallax
      const parallaxStrength = 0.02;
      const centerX = width / 2;
      const centerY = height / 2;
      
      branchNodes.forEach(node => {
        const offsetX = (mousePos.current.x - centerX) * parallaxStrength;
        const offsetY = (mousePos.current.y - centerY) * parallaxStrength;
        node.x = node.baseX + offsetX;
        node.y = node.baseY + offsetY;
      });

      // Draw everything
      drawEnergyConnections();
      drawPlanet(leftPlanet);
      drawPlanet(rightPlanet);
      drawBranchNodes();

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Check for node hover
      const hoveredNodeFound = branchNodes.find(node => {
        const dx = mousePos.current.x - node.x;
        const dy = mousePos.current.y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size * 3;
      });

      setHoveredNode(hoveredNodeFound || null);
      canvas.style.cursor = hoveredNodeFound?.destination ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clickedNode = branchNodes.find(node => {
        const dx = clickX - node.x;
        const dy = clickY - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size * 3 && node.destination;
      });

      if (clickedNode?.destination) {
        navigate(clickedNode.destination);
      }
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [navigate]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
