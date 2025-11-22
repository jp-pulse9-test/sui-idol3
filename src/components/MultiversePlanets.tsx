import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
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
      color: '#2a2a2a',
      rotation: 0,
      rotationSpeed: 0.001,
    };

    const rightPlanet: Planet = {
      x: canvas.width / (2 * window.devicePixelRatio) + planetDistance / 2,
      y: canvas.height / (2 * window.devicePixelRatio),
      radius: planetRadius,
      color: '#2a2a2a',
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
      // Subtle outer stroke
      ctx.strokeStyle = 'rgba(96, 96, 96, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius + 5, 0, Math.PI * 2);
      ctx.stroke();

      // Solid planet body
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet border
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Grid pattern surface detail
      ctx.save();
      ctx.translate(planet.x, planet.y);
      ctx.rotate(planet.rotation);
      
      ctx.strokeStyle = 'rgba(64, 64, 64, 0.4)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * planet.radius * 0.8,
          Math.sin(angle) * planet.radius * 0.8
        );
        ctx.stroke();
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

        // Delicate energy line
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftPlanet.x + leftPlanet.radius, leftPlanet.y);
        ctx.quadraticCurveTo(cpX, curveY, rightPlanet.x - rightPlanet.radius, rightPlanet.y);
        ctx.stroke();

        // Solid particles along the path
        particles.filter(p => p.pathIndex === idx).forEach(particle => {
          const t = particle.progress;
          const x = (1 - t) * (1 - t) * (leftPlanet.x + leftPlanet.radius) +
                   2 * (1 - t) * t * cpX +
                   t * t * (rightPlanet.x - rightPlanet.radius);
          const y = (1 - t) * (1 - t) * leftPlanet.y +
                   2 * (1 - t) * t * curveY +
                   t * t * rightPlanet.y;
          
          ctx.fillStyle = 'rgba(128, 128, 128, 0.9)';
          ctx.beginPath();
          ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    };

    const drawBranchNodes = () => {
      // Draw delicate connections
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.3)';
      ctx.lineWidth = 0.8;
      
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

        // Hover outline only
        if (isHovered) {
          ctx.strokeStyle = `rgba(176, 176, 176, ${pulseOpacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Solid node
        ctx.fillStyle = node.label 
          ? `rgba(144, 144, 144, ${pulseOpacity})` 
          : `rgba(96, 96, 96, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (node.label && (isHovered || size > 4)) {
          ctx.fillStyle = '#e0e0e0';
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
