# Walrus SDK 통합 가이드

이 문서는 Sui:Idol³ 프로젝트에 Walrus SDK가 통합된 방법과 사용법을 설명합니다.

## 📦 설치된 패키지

```bash
npm install --save @mysten/walrus @mysten/sui
```

## 🏗️ 아키텍처

### 1. WalrusService (`src/services/walrusService.ts`)
- Walrus 클라이언트의 싱글톤 인스턴스
- 파일 업로드/다운로드, Blob 읽기/쓰기 기능 제공
- 에러 처리 및 재시도 로직 포함

### 2. 커스텀 훅

#### useWalrus (`src/hooks/useWalrus.ts`)
- 기본적인 Walrus 기능을 위한 훅
- 파일 업로드/다운로드, Blob 작업
- 로딩 상태 및 에러 처리

#### useWalrusFlow (`src/hooks/useWalrusFlow.ts`)
- 브라우저 환경에서 단계별 업로드를 위한 훅
- 인코딩 → 등록 → 업로드 → 인증 → 완료 플로우
- 각 단계별 상태 관리

### 3. 컴포넌트

#### WalrusFileUpload (`src/components/WalrusFileUpload.tsx`)
- 간단한 파일 업로드 인터페이스
- 파일 선택 또는 텍스트 입력 지원
- 태그, 저장 기간, 삭제 가능 여부 설정

#### WalrusFlowUpload (`src/components/WalrusFlowUpload.tsx`)
- 브라우저 환경에서 단계별 업로드
- 각 단계를 수동으로 실행 가능
- 진행 상황 시각화

#### WalrusFileDownload (`src/components/WalrusFileDownload.tsx`)
- Blob ID로 파일 다운로드
- 단일/다중 파일 다운로드 지원
- 파일 내용 미리보기 및 메타데이터 표시

## 🚀 사용법

### 기본 파일 업로드

```typescript
import { useWalrus } from '@/hooks/useWalrus';

function MyComponent() {
  const { uploadFile, isLoading, error } = useWalrus();
  
  const handleUpload = async () => {
    try {
      const result = await uploadFile('Hello World!', {
        identifier: 'hello.txt',
        tags: { type: 'text', category: 'greeting' },
        epochs: 3,
        deletable: true,
        signer: currentAccount,
      });
      console.log('업로드 완료:', result.blobId);
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };
}
```

### 단계별 업로드 플로우

```typescript
import { useWalrusFlow } from '@/hooks/useWalrusFlow';

function MyComponent() {
  const {
    currentStep,
    steps,
    startFlow,
    executeEncode,
    executeRegister,
    executeUpload,
    executeCertify,
    completeFlow,
  } = useWalrusFlow();
  
  const handleStepByStepUpload = async () => {
    // 1. 플로우 시작
    await startFlow([walrusFile]);
    
    // 2. 인코딩
    await executeEncode();
    
    // 3. 등록
    await executeRegister({
      epochs: 3,
      owner: currentAccount.address,
      deletable: true,
      signer: currentAccount,
    });
    
    // 4. 업로드
    await executeUpload();
    
    // 5. 인증
    await executeCertify(currentAccount);
    
    // 6. 완료
    const files = await completeFlow();
  };
}
```

### 파일 다운로드

```typescript
import { useWalrus } from '@/hooks/useWalrus';

function MyComponent() {
  const { downloadFile, readBlob } = useWalrus();
  
  const handleDownload = async (blobId: string) => {
    try {
      // WalrusFile로 다운로드
      const file = await downloadFile(blobId);
      const content = await file.text();
      const identifier = await file.getIdentifier();
      const tags = await file.getTags();
      
      // 또는 Blob으로 직접 읽기
      const blob = await readBlob(blobId);
    } catch (err) {
      console.error('다운로드 실패:', err);
    }
  };
}
```

## ⚙️ 설정

### Vite 설정 (`vite.config.ts`)

```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@mysten/walrus-wasm'],
  },
  build: {
    rollupOptions: {
      external: ['@mysten/walrus-wasm'],
    },
  },
});
```

### WalrusService 설정

```typescript
// WASM URL을 CDN에서 로드
const WALRUS_WASM_URL = 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm';

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient: this.suiClient,
  wasmUrl: WALRUS_WASM_URL,
  storageNodeClientOptions: {
    timeout: 60_000,
    onError: (error) => {
      console.error('Walrus storage node error:', error);
    },
  },
});
```

## 🎯 주요 기능

### 1. 파일 업로드
- 텍스트, 바이너리 파일 지원
- 메타데이터 (식별자, 태그) 설정
- 저장 기간 및 삭제 가능 여부 설정

### 2. 파일 다운로드
- Blob ID로 파일 검색
- 메타데이터 읽기
- 파일 내용 미리보기

### 3. 브라우저 최적화
- 단계별 업로드로 팝업 차단 방지
- 진행 상황 시각화
- 에러 처리 및 재시도

### 4. 에러 처리
- 네트워크 오류 자동 재시도
- 클라이언트 리셋 기능
- 상세한 에러 메시지

## 🔧 개발자 도구

메인 페이지에서 Database 아이콘을 클릭하면 Walrus 스토리지 도구에 접근할 수 있습니다:

1. **파일 업로드**: 간단한 파일 업로드 인터페이스
2. **파일 다운로드**: Blob ID로 파일 다운로드
3. **고급 업로드**: 단계별 업로드 플로우

## 📝 주의사항

1. **지갑 연결 필요**: 파일 업로드/다운로드는 지갑 연결이 필요합니다
2. **가스비**: 업로드 시 SUI 토큰으로 가스비를 지불해야 합니다
3. **WAL 토큰**: 저장 비용을 위해 WAL 토큰이 필요합니다
4. **네트워크**: 현재 testnet으로 설정되어 있습니다

## 📸 포토카드 저장 기능

### 포토카드 저장 서비스
- `PhotocardStorageService`: 포토카드 전용 저장 서비스
- 메타데이터와 이미지를 함께 저장
- 태그 기반 검색 및 필터링
- 사용자별, 아이돌별, 등급별 포토카드 관리

### 포토카드 저장 훅
- `usePhotocardStorage`: 포토카드 저장 전용 훅
- 저장, 로드, 검색 기능 제공
- 에러 처리 및 로딩 상태 관리

### 포토카드 갤러리
- `WalrusPhotocardGallery`: 저장된 포토카드 전시
- 그리드/리스트 뷰 지원
- 검색, 필터링, 정렬 기능
- 포토카드 상세 정보 및 다운로드

### 사용법

```typescript
import { usePhotocardStorage } from '@/hooks/usePhotocardStorage';

function PhotocardComponent() {
  const { storePhotocard, getUserPhotocards } = usePhotocardStorage();
  
  // 포토카드 저장
  const handleSave = async () => {
    const metadata = {
      id: 'photocard_123',
      idolId: 1,
      idolName: '아이돌명',
      rarity: 'SSR',
      concept: '컨셉명',
      // ... 기타 메타데이터
    };
    
    await storePhotocard(metadata, imageData, {
      epochs: 10,
      deletable: false,
      signer: currentAccount
    });
  };
  
  // 사용자 포토카드 로드
  const loadCards = async () => {
    const cards = await getUserPhotocards(currentAccount.address);
  };
}
```

## 🚀 향후 개선사항

1. **Upload Relay 통합**: 업로드 요청 수 감소
2. **배치 처리**: 여러 파일 동시 업로드 최적화
3. **캐싱**: 자주 사용되는 파일 캐싱
4. **압축**: 파일 크기 최적화
5. **메인넷 지원**: 프로덕션 환경 준비
6. **포토카드 검색 최적화**: Walrus 태그 검색 기능 활용
7. **포토카드 공유**: 다른 사용자와 포토카드 공유 기능
8. **포토카드 거래**: 마켓플레이스 연동

## 📚 참고 자료

- [Walrus SDK 공식 문서](https://sdk.mystenlabs.com/walrus)
- [Sui 공식 문서](https://docs.sui.io/)
- [Mysten Labs GitHub](https://github.com/MystenLabs)
