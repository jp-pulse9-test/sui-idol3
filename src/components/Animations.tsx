import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = '',
  direction = 'fade'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    fade: 'opacity-0',
    up: 'opacity-0 translate-y-4',
    down: 'opacity-0 -translate-y-4',
    left: 'opacity-0 translate-x-4',
    right: 'opacity-0 -translate-x-4'
  };

  const visibleClasses = {
    fade: 'opacity-100',
    up: 'opacity-100 translate-y-0',
    down: 'opacity-100 translate-y-0',
    left: 'opacity-100 translate-x-0',
    right: 'opacity-100 translate-x-0'
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? visibleClasses[direction] : directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = '',
  direction = 'left'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    up: '-translate-y-full',
    down: 'translate-y-full'
  };

  const visibleClasses = {
    left: 'translate-x-0',
    right: 'translate-x-0',
    up: 'translate-y-0',
    down: 'translate-y-0'
  };

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        isVisible ? visibleClasses[direction] : directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  scale?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = '',
  scale = 0.8
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'scale-100 opacity-100' : `scale-${Math.round(scale * 100)} opacity-0`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const BounceIn: React.FC<BounceInProps> = ({
  children,
  delay = 0,
  duration = 600,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      {children}
    </div>
  );
};

interface RotateInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  angle?: number;
}

export const RotateIn: React.FC<RotateInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = '',
  angle = 180
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'rotate-0 opacity-100' : `rotate-${angle} opacity-0`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface StaggerProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  className = '',
  animation = 'fade',
  direction = 'up'
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => {
        const childDelay = delay + (index * staggerDelay);
        
        switch (animation) {
          case 'fade':
            return (
              <FadeIn key={index} delay={childDelay} direction={direction}>
                {child}
              </FadeIn>
            );
          case 'slide':
            return (
              <SlideIn key={index} delay={childDelay} direction={direction}>
                {child}
              </SlideIn>
            );
          case 'scale':
            return (
              <ScaleIn key={index} delay={childDelay}>
                {child}
              </ScaleIn>
            );
          case 'bounce':
            return (
              <BounceIn key={index} delay={childDelay}>
                {child}
              </BounceIn>
            );
          default:
            return (
              <FadeIn key={index} delay={childDelay} direction={direction}>
                {child}
              </FadeIn>
            );
        }
      })}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className = '',
  duration = 2000
}) => {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface ShakeProps {
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  className = '',
  trigger = false
}) => {
  return (
    <div
      className={cn(
        'transition-transform',
        trigger ? 'animate-shake' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

// CSS 애니메이션을 위한 스타일 (전역 CSS에 추가해야 함)
export const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;
