import React, { useState, useRef } from 'react';
import { useWalrus } from '@/hooks/useWalrus';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WalrusFileUploadProps {
  onUploadComplete?: (result: any) => void;
  className?: string;
}

export function WalrusFileUpload({ onUploadComplete, className }: WalrusFileUploadProps) {
  const { isConnected, walletAddress, currentAccount } = useWallet();
  const { uploadFile, uploadProgress, isLoading, error, clearError } = useWalrus();
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

  const handleUpload = async () => {
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

      const result = await uploadFile(content, {
        identifier: identifier.trim(),
        tags: parseTags(tags),
        epochs,
        deletable,
        account: currentAccount,
      });

      toast.success('파일이 성공적으로 업로드되었습니다!');
      onUploadComplete?.(result);
      
      // 폼 리셋
      setSelectedFile(null);
      setTextContent('');
      setIdentifier('');
      setTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  const getProgressValue = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return 50;
      case 'success':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (uploadProgress.status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (uploadProgress.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Upload className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Walrus 파일 업로드
        </CardTitle>
        <CardDescription>
          파일이나 텍스트를 Walrus 스토리지에 업로드합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadProgress.status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>업로드 중...</span>
              <span>{uploadProgress.status}</span>
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        )}

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
            <p className="text-xs text-muted-foreground mt-1">
              형식: key:value, key2:value2
            </p>
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
            onClick={handleUpload}
            disabled={isLoading || !currentAccount || (!selectedFile && !textContent.trim())}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                업로드
              </>
            )}
          </Button>

          {!currentAccount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                파일을 업로드하려면 지갑을 연결해주세요.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
