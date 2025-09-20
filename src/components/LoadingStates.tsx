import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from './Animations';
import { cn } from '@/lib/utils';

interface LoadingCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true
}) => {
  return (
    <Card className={cn('glass-dark border-white/10', className)}>
      <CardContent className="p-4 space-y-4">
        {showImage && (
          <Skeleton className="w-full h-48 rounded-lg" />
        )}
        
        {showTitle && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        
        {showDescription && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
        
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface LoadingGridProps {
  count?: number;
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  count = 6,
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard
          key={index}
          showImage={showImage}
          showTitle={showTitle}
          showDescription={showDescription}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

interface LoadingListProps {
  count?: number;
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showActions?: boolean;
}

export const LoadingList: React.FC<LoadingListProps> = ({
  count = 5,
  className = '',
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showActions = true
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="glass-dark border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {showAvatar && (
                <Skeleton className="w-12 h-12 rounded-full" />
              )}
              
              <div className="flex-1 space-y-2">
                {showTitle && (
                  <Skeleton className="h-5 w-1/3" />
                )}
                {showSubtitle && (
                  <Skeleton className="h-4 w-1/2" />
                )}
              </div>
              
              {showActions && (
                <Skeleton className="h-8 w-16" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '로딩 중...',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <Card className="p-6 glass-dark border-white/10">
        <CardContent className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-foreground font-medium">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = '로딩 중...',
  className = '',
  disabled = false,
  onClick
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false
}) => {
  return (
    <Skeleton
      className={cn(
        rounded && 'rounded-full',
        className
      )}
      style={{ width, height }}
    />
  );
};

interface LoadingProgressProps {
  progress?: number;
  message?: string;
  className?: string;
  showPercentage?: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress = 0,
  message = '처리 중...',
  className = '',
  showPercentage = true
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        {showPercentage && (
          <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
        )}
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface LoadingDotsProps {
  className?: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  className = '',
  count = 3,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-primary rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};
