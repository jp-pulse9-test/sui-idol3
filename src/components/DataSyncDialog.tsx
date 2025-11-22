import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Database, HardDrive, AlertTriangle, Merge } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DataSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: 'keep-local' | 'use-blockchain' | 'merge') => void;
  localData: {
    vri: number;
    progress: number;
    photocards: number;
  };
  blockchainData: {
    vri: number;
    progress: number;
    photocards: number;
  };
}

export const DataSyncDialog = ({
  open,
  onOpenChange,
  onConfirm,
  localData,
  blockchainData,
}: DataSyncDialogProps) => {
  const [selectedAction, setSelectedAction] = useState<'keep-local' | 'use-blockchain' | 'merge'>('keep-local');

  const handleConfirm = () => {
    onConfirm(selectedAction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Merge className="w-6 h-6" />
            데이터 동기화 필요
          </DialogTitle>
          <DialogDescription>
            게스트 모드에서 플레이한 데이터와 블록체인에 저장된 데이터가 모두 발견되었습니다.
            어떤 데이터를 사용하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 데이터 비교 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">로컬 데이터 (게스트)</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total VRI:</span>
                    <Badge variant="outline">{localData.vri}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">브랜치 진행:</span>
                    <Badge variant="outline">{localData.progress}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">포토카드:</span>
                    <Badge variant="outline">{localData.photocards}장</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">블록체인 데이터</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total VRI:</span>
                    <Badge variant="outline">{blockchainData.vri}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">브랜치 진행:</span>
                    <Badge variant="outline">{blockchainData.progress}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">포토카드:</span>
                    <Badge variant="outline">{blockchainData.photocards}장</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 선택 옵션 */}
          <RadioGroup value={selectedAction} onValueChange={(value) => setSelectedAction(value as any)}>
            <Card className={selectedAction === 'keep-local' ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="keep-local" id="keep-local" />
                  <div className="flex-1">
                    <Label htmlFor="keep-local" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4" />
                        <span className="font-semibold">로컬 데이터 사용 (권장)</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        게스트 모드에서 플레이한 데이터를 블록체인에 저장합니다.
                        기존 블록체인 데이터는 덮어씌워집니다.
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={selectedAction === 'use-blockchain' ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="use-blockchain" id="use-blockchain" />
                  <div className="flex-1">
                    <Label htmlFor="use-blockchain" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4" />
                        <span className="font-semibold">블록체인 데이터 사용</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        블록체인에 저장된 기존 데이터를 사용합니다.
                        로컬 게스트 데이터는 삭제됩니다.
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={selectedAction === 'merge' ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="merge" id="merge" />
                  <div className="flex-1">
                    <Label htmlFor="merge" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Merge className="w-4 h-4" />
                        <span className="font-semibold">데이터 병합</span>
                        <Badge variant="secondary" className="text-xs">고급</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        두 데이터를 병합합니다. VRI는 합산되고, 포토카드는 통합됩니다.
                        브랜치 진행도는 높은 값을 유지합니다.
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>

          {/* 경고 메시지 */}
          {selectedAction === 'use-blockchain' && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">경고</p>
                    <p className="text-sm text-muted-foreground">
                      로컬 게스트 데이터가 영구적으로 삭제됩니다. 복구할 수 없습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm}>
            {selectedAction === 'keep-local' && '로컬 데이터로 계속'}
            {selectedAction === 'use-blockchain' && '블록체인 데이터로 계속'}
            {selectedAction === 'merge' && '데이터 병합'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
