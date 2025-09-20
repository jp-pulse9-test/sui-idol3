import React, { useState } from 'react';
import { useWalrus } from '@/hooks/useWalrus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface WalrusFileDownloadProps {
  onDownloadComplete?: (file: any) => void;
  className?: string;
}

export function WalrusFileDownload({ onDownloadComplete, className }: WalrusFileDownloadProps) {
  const { downloadFile, downloadFiles, readBlob, isLoading, error, clearError } = useWalrus();
  const [blobId, setBlobId] = useState('');
  const [blobIds, setBlobIds] = useState('');
  const [downloadedFile, setDownloadedFile] = useState<any>(null);
  const [downloadedFiles, setDownloadedFiles] = useState<any[]>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileMetadata, setFileMetadata] = useState<any>(null);

  const handleSingleDownload = async () => {
    if (!blobId.trim()) {
      toast.error('Blob ID를 입력해주세요');
      return;
    }

    try {
      clearError();
      const file = await downloadFile(blobId.trim());
      setDownloadedFile(file);
      setFileMetadata(null);
      
      // 파일 내용 미리보기
      try {
        const content = await file.text();
        setFileContent(content);
      } catch (err) {
        setFileContent('텍스트로 읽을 수 없는 파일입니다');
      }

      // 파일 메타데이터 가져오기
      try {
        const identifier = await file.getIdentifier();
        const tags = await file.getTags();
        setFileMetadata({ identifier, tags });
      } catch (err) {
        // 메타데이터가 없는 경우 무시
      }

      toast.success('파일이 성공적으로 다운로드되었습니다!');
      onDownloadComplete?.(file);
    } catch (err) {
      console.error('다운로드 실패:', err);
    }
  };

  const handleMultipleDownload = async () => {
    if (!blobIds.trim()) {
      toast.error('Blob ID들을 입력해주세요');
      return;
    }

    const ids = blobIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      toast.error('유효한 Blob ID를 입력해주세요');
      return;
    }

    try {
      clearError();
      const files = await downloadFiles(ids);
      setDownloadedFiles(files);
      setDownloadedFile(null);
      setFileContent('');
      setFileMetadata(null);
      
      toast.success(`${files.length}개의 파일이 성공적으로 다운로드되었습니다!`);
    } catch (err) {
      console.error('다운로드 실패:', err);
    }
  };

  const handleBlobRead = async () => {
    if (!blobId.trim()) {
      toast.error('Blob ID를 입력해주세요');
      return;
    }

    try {
      clearError();
      const blob = await readBlob(blobId.trim());
      setDownloadedFile({ bytes: () => Promise.resolve(blob) });
      setFileContent(`Blob 데이터 (${blob.length} bytes)`);
      setFileMetadata(null);
      
      toast.success('Blob이 성공적으로 읽혔습니다!');
    } catch (err) {
      console.error('Blob 읽기 실패:', err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다');
    } catch (err) {
      toast.error('복사에 실패했습니다');
    }
  };

  const downloadAsFile = async (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Walrus 파일 다운로드
        </CardTitle>
        <CardDescription>
          Blob ID를 사용하여 Walrus에서 파일을 다운로드합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 단일 파일 다운로드 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="blob-id">Blob ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="blob-id"
                placeholder="0x..."
                value={blobId}
                onChange={(e) => setBlobId(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => copyToClipboard(blobId)}
                variant="outline"
                size="sm"
                disabled={!blobId.trim()}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSingleDownload}
              disabled={isLoading || !blobId.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              파일 다운로드
            </Button>
            <Button
              onClick={handleBlobRead}
              disabled={isLoading || !blobId.trim()}
              variant="outline"
            >
              <Eye className="mr-2 h-4 w-4" />
              Blob 읽기
            </Button>
          </div>
        </div>

        {/* 여러 파일 다운로드 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="blob-ids">여러 Blob ID (쉼표로 구분)</Label>
            <Input
              id="blob-ids"
              placeholder="0x..., 0x..., 0x..."
              value={blobIds}
              onChange={(e) => setBlobIds(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleMultipleDownload}
            disabled={isLoading || !blobIds.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            여러 파일 다운로드
          </Button>
        </div>

        {/* 다운로드된 파일 정보 */}
        {downloadedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <h3 className="text-lg font-semibold">다운로드된 파일</h3>
            </div>

            {fileMetadata && (
              <div className="space-y-2">
                {fileMetadata.identifier && (
                  <div>
                    <Label>파일명</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={fileMetadata.identifier} readOnly />
                      <Button
                        onClick={() => copyToClipboard(fileMetadata.identifier)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {fileMetadata.tags && Object.keys(fileMetadata.tags).length > 0 && (
                  <div>
                    <Label>태그</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(fileMetadata.tags).map(([key, value]) => (
                        <Badge key={key} variant="secondary">
                          {key}: {value as string}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {fileContent && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>파일 내용 미리보기</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(fileContent)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(fileContent, fileMetadata?.identifier || 'downloaded-file.txt')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-muted max-h-60 overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">{fileContent}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 다운로드된 여러 파일 정보 */}
        {downloadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <h3 className="text-lg font-semibold">다운로드된 파일들 ({downloadedFiles.length}개)</h3>
            </div>

            <div className="space-y-3">
              {downloadedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="font-medium">파일 {index + 1}</span>
                    </div>
                    <Badge variant="outline">다운로드 완료</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
