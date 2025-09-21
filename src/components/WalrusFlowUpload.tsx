import React, { useState, useRef } from 'react';
import { useWalrusFlow } from '@/hooks/useWalrusFlow';
import { useWallet } from '@/hooks/useWallet';
import { WalrusFile } from '@mysten/walrus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface WalrusFlowUploadProps {
  onUploadComplete?: (files: WalrusFile[]) => void;
  className?: string;
}

export function WalrusFlowUpload({ onUploadComplete, className }: WalrusFlowUploadProps) {
  const { currentAccount } = useWallet();
  const {
    currentStep,
    steps,
    isFlowActive,
    startFlow,
    executeEncode,
    executeRegister,
    executeUpload,
    executeCertify,
    completeFlow,
    resetFlow,
    error,
    clearError,
  } = useWalrusFlow();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [tags, setTags] = useState('');
  const [epochs, setEpochs] = useState(3);
  const [deletable, setDeletable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTextContent('');
      if (!identifier) {
        setIdentifier(file.name);
      }
    }
  };

  const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseTags = (tagsString: string): Record<string, string> => {
    const tagsObj: Record<string, string> = {};
    if (tagsString.trim()) {
      tagsString.split(',').forEach(tag => {
        const [key, value] = tag.split(':').map(s => s.trim());
        if (key && value) {
          tagsObj[key] = value;
        }
      });
    }
    return tagsObj;
  };

  const handleStartFlow = async () => {
    if (!currentAccount) {
      toast.error('지갑을 연결해주세요');
      return;
    }

    if (!selectedFile && !textContent.trim()) {
      toast.error('파일을 선택하거나 텍스트를 입력해주세요');
      return;
    }

    if (!identifier.trim()) {
      toast.error('파일 식별자를 입력해주세요');
      return;
    }

    try {
      clearError();
      
      let content: Uint8Array | Blob | string;
      if (selectedFile) {
        content = selectedFile;
      } else {
        content = textContent;
      }

      // string을 Uint8Array로 변환
      let fileContent: Uint8Array | Blob;
      if (typeof content === 'string') {
        fileContent = new TextEncoder().encode(content);
      } else {
        fileContent = content;
      }

      const walrusFile = WalrusFile.from({
        contents: fileContent,
        identifier: identifier.trim(),
        tags: parseTags(tags),
      });

      await startFlow([walrusFile]);
      toast.success('업로드 플로우가 시작되었습니다');
    } catch (err) {
      console.error('플로우 시작 실패:', err);
    }
  };

  const handleExecuteEncode = async () => {
    try {
      await executeEncode();
      toast.success('인코딩이 완료되었습니다');
    } catch (err) {
      console.error('인코딩 실패:', err);
    }
  };

  const handleExecuteRegister = async () => {
    if (!currentAccount) {
      toast.error('지갑을 연결해주세요');
      return;
    }

    try {
      const digest = await executeRegister({
        epochs,
        owner: currentAccount.address,
        deletable,
        account: currentAccount,
      });
      toast.success(`등록이 완료되었습니다: ${digest.slice(0, 8)}...`);
    } catch (err) {
      console.error('등록 실패:', err);
    }
  };

  const handleExecuteUpload = async () => {
    try {
      await executeUpload();
      toast.success('업로드가 완료되었습니다');
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  const handleExecuteCertify = async () => {
    if (!currentAccount) {
      toast.error('지갑을 연결해주세요');
      return;
    }

    try {
      const digest = await executeCertify(currentAccount);
      toast.success(`인증이 완료되었습니다: ${digest.slice(0, 8)}...`);
    } catch (err) {
      console.error('인증 실패:', err);
    }
  };

  const handleCompleteFlow = async () => {
    try {
      const files = await completeFlow();
      toast.success('업로드 플로우가 완료되었습니다!');
      onUploadComplete?.(files);
      
      // 폼 리셋
      setSelectedFile(null);
      setTextContent('');
      setIdentifier('');
      setTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('플로우 완료 실패:', err);
    }
  };

  const getStepStatus = (step: string) => {
    const stepData = steps.find(s => s.step === step);
    return stepData?.status || 'pending';
  };

  const getStepIcon = (step: string) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBadgeVariant = (step: string) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isStepEnabled = (step: string) => {
    if (!isFlowActive) return false;
    
    const stepIndex = steps.findIndex(s => s.step === step);
    const currentStepIndex = steps.findIndex(s => s.step === currentStep);
    
    // 현재 단계이거나 이전 단계가 성공한 경우에만 활성화
    return stepIndex <= currentStepIndex + 1;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Walrus 고급 업로드 플로우
        </CardTitle>
        <CardDescription>
          브라우저 환경에서 단계별로 파일을 업로드합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 파일 입력 섹션 */}
        {!isFlowActive && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-input">파일 선택</Label>
              <Input
                id="file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="mt-1"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="text-content">또는 텍스트 입력</Label>
              <Textarea
                id="text-content"
                placeholder="업로드할 텍스트를 입력하세요..."
                value={textContent}
                onChange={handleTextContentChange}
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="identifier">파일 식별자</Label>
              <Input
                id="identifier"
                placeholder="예: my-file.txt"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">태그 (선택사항)</Label>
              <Input
                id="tags"
                placeholder="예: type:image, category:photo"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="epochs">저장 기간 (에포크)</Label>
                <Input
                  id="epochs"
                  type="number"
                  min="1"
                  max="10"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="deletable"
                  checked={deletable}
                  onChange={(e) => setDeletable(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="deletable">삭제 가능</Label>
              </div>
            </div>

            <Button
              onClick={handleStartFlow}
              disabled={!currentAccount || (!selectedFile && !textContent.trim())}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              업로드 플로우 시작
            </Button>
          </div>
        )}

        {/* 플로우 단계 섹션 */}
        {isFlowActive && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">업로드 단계</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFlow}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                리셋
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.step)}
                    <div>
                      <div className="font-medium capitalize">{step.step}</div>
                      {step.error && (
                        <div className="text-sm text-red-500">{step.error}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStepBadgeVariant(step.step)}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleExecuteEncode}
                disabled={!isStepEnabled('encode') || getStepStatus('encode') === 'success'}
                className="w-full"
                variant={currentStep === 'encode' ? 'default' : 'outline'}
              >
                {getStepStatus('encode') === 'in_progress' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                인코딩 실행
              </Button>

              <Button
                onClick={handleExecuteRegister}
                disabled={!isStepEnabled('register') || getStepStatus('register') === 'success'}
                className="w-full"
                variant={currentStep === 'register' ? 'default' : 'outline'}
              >
                {getStepStatus('register') === 'in_progress' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                등록 실행
              </Button>

              <Button
                onClick={handleExecuteUpload}
                disabled={!isStepEnabled('upload') || getStepStatus('upload') === 'success'}
                className="w-full"
                variant={currentStep === 'upload' ? 'default' : 'outline'}
              >
                {getStepStatus('upload') === 'in_progress' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                업로드 실행
              </Button>

              <Button
                onClick={handleExecuteCertify}
                disabled={!isStepEnabled('certify') || getStepStatus('certify') === 'success'}
                className="w-full"
                variant={currentStep === 'certify' ? 'default' : 'outline'}
              >
                {getStepStatus('certify') === 'in_progress' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                인증 실행
              </Button>

              <Button
                onClick={handleCompleteFlow}
                disabled={!isStepEnabled('complete') || getStepStatus('complete') === 'success'}
                className="w-full"
                variant={currentStep === 'complete' ? 'default' : 'outline'}
              >
                {getStepStatus('complete') === 'in_progress' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                플로우 완료
              </Button>
            </div>
          </div>
        )}

        {!currentAccount && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              파일을 업로드하려면 지갑을 연결해주세요.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
