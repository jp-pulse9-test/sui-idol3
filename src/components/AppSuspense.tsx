import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "앱을 불러오는 중..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export { LoadingFallback };

interface AppSuspenseProps {
  children: React.ReactNode;
}

const AppSuspense: React.FC<AppSuspenseProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default AppSuspense;