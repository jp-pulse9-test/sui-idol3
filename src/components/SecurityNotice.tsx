import { AlertTriangle, Lock, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SecurityNoticeProps {
  type: 'limited-access' | 'full-protection' | 'auth-required';
  onDismiss?: () => void;
}

export const SecurityNotice = ({ type, onDismiss }: SecurityNoticeProps) => {
  const navigate = useNavigate();

  if (type === 'limited-access') {
    return (
      <Alert className="border-warning/20 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">제한된 접근</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          현재 기본 아이돌 정보만 확인할 수 있습니다. 
          상세한 성격, 컨셉, 페르소나 정보를 보려면 로그인이 필요합니다.
          <div className="mt-3 flex gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="bg-warning hover:bg-warning/90"
            >
              <Lock className="w-4 h-4 mr-2" />
              로그인하기
            </Button>
            {onDismiss && (
              <Button size="sm" variant="outline" onClick={onDismiss}>
                나중에
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (type === 'full-protection') {
    return (
      <Alert className="border-green-500/20 bg-green-500/5">
        <Lock className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">보안 강화됨</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          아이돌 데이터가 보안 정책에 따라 보호되고 있습니다. 
          인증된 사용자만 전체 정보에 접근할 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  if (type === 'auth-required') {
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <Users className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">인증 필요</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          이 기능을 사용하려면 지갑 연결 또는 로그인이 필요합니다.
          <div className="mt-3">
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
            >
              지금 로그인하기
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SecurityNotice;