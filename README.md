# 🌟 AIDOL101 — Begin Your Journey

> **"최애 아이돌을 고르고, 스토리 에피소드를 통해 추억이 담긴 포토카드를 모아 데뷔와 성장을 체감하는 특별한 경험."**  
> **SEASON 1, 당신의 픽으로 탄생하는 K-POP 아이돌. 최애의 성장과 추억을 만드는 특별한 여정 ✨**  

> **"Pick your favorite idol, collect memory-filled photocards through story episodes, and experience their debut and growth."**  
> **SEASON 1: A K-POP idol born from your choice. A special journey of growth and memories. ✨**

---

## 🚀 서비스 개요 / Overview
**AIDOL101**은 K-POP 팬덤 문화를 Web3와 AI 기술로 재해석한 **인터랙티브 아이돌 스토리 플랫폼**입니다.  
**AIDOL101** is an **interactive idol story platform** that reimagines K-POP fandom culture through Web3 and AI technology.

---

## 🎯 여정의 시작 / Begin Your Journey
**DATA ALLY → LEGEND**

### Dimension: AWAKEN ❅
**The Awakening / 각성**
> You awaken as DATA ALLY. Meet your AIDOL.  
> 당신은 DATA ALLY로 깨어납니다. 당신의 AIDOL을 만나세요.

- 101명의 소년 & 101명의 소녀 프리셋 아이돌 중 선택
- AI 생성 프로필과 개성 있는 스토리로 만남
- Choose from 101 preset boys & 101 girls with AI-generated profiles

### Dimension: SALVATION
**The Mission / 임무**
> As DATA ALLY, restore the broken world. Your mission begins.  
> DATA ALLY로서 부서진 세계를 복원하세요. 당신의 임무가 시작됩니다.

- 인터랙티브 스토리 에피소드 진행
- 대화와 선택을 통한 세계 복원
- Progress through interactive story episodes with meaningful choices

### Dimension: GLORY
**The Legend / 전설**
> Together with AIDOL, become LEGEND forever.  
> AIDOL과 함께 영원한 LEGEND가 되세요.

- 포토카드 수집으로 추억 보관
- 온체인 보상과 성장 달성
- Collect photocards and achieve on-chain rewards

**팬은 소비자가 아니라 참여자·큐레이터·공동 제작자가 됩니다.**  
**Fans are not just consumers, but participants, curators, and co-creators.**

---

## ✨ 핵심 기능 / Key Features
- 🎭 **아이돌 픽 (Idol Pick)**: 속성(동물상, 체형 등) 기반 하이브리드 선택 시스템  
  → Hybrid selection system based on attributes (animal face, body type, etc.)  
- 📖 **스토리 플레이 (Story Play)**: 일상부터 데뷔까지 몰입형 텍스트 스토리  
  → Immersive text stories, from daily life to debut episodes  
- 🖼️ **포토카드 보상 (Photocard Rewards)**: 스토리 진행 및 활동으로 카드 수집  
  → Collect digital photocards as story & activity rewards  
- 🗨️ **Q&A 대화 (Interactive Q&A)**: 팬-아이돌 몰입감을 강화하는 질의응답  
  → Interactive Q&A to deepen immersion with idols  
- 🌐 **온체인 생태계 (On-chain Ecosystem)**: 후원·투표·보상이 연결된 Web3 경험  
  → Web3 experience with support, voting, and reward linkage  

---

## 🏆 차별 포인트 / Differentiators
- **K-POP 특수성 / K-POP Uniqueness**: 글로벌 팬덤의 강력한 결속력과 소비력  
- **스토리+수집 / Story + Collection**: NFT가 아닌, **추억 기반 포토카드**  
- **글로벌 검증 / Global Validation**: Eternity(IITERNITI) 사례 –  
  스위스 *AI For Good*, 영국 *V&A Museum*, 독일 *Universum Museum* 전시 및 공연 경험  
  → Showcased at *AI For Good (Switzerland)*, *V&A Museum (UK)*, *Universum Museum (Germany)*  
- **참여형 성장 / Participatory Growth**: 팬의 선택이 최애 성장에 직접 반영  

---

## 🛠️ 기술 스택 / Tech Stack

### Frontend
- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite (Fast HMR & optimized builds)
- **Styling**: TailwindCSS + Radix UI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Wallet Integration**: Sui dApp Kit (@mysten/dapp-kit)

### Backend
- **Platform**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Edge Functions**: Deno runtime (serverless)
- **Real-time**: WebSocket subscriptions
- **Storage**: Supabase Storage + Walrus Protocol

### Blockchain & Web3
- **Primary Chain**: Sui Network
- **Smart Contracts**: Move language (sui_idol/sources/photocard.move)
- **Cross-chain Bridge**: Wormhole Protocol (Sui ↔ EVM ↔ Solana)
- **Decentralized Storage**: Walrus Protocol
- **Token Standards**: Sui Object Model

### AI & Machine Learning
- **AI Gateway**: Lovable AI Gateway
- **LLM Engine**: Google Gemini 2.5 Flash
- **Features**: 
  - Idol image generation
  - Interactive story conversation
  - Photocard enhancement (background removal, style transfer)

---

## 🌊 Impact on Sui Ecosystem

### Strategic Significance on Sui Network

**AIDOL101 represents a breakthrough use case that bridges Sui's technical excellence with global K-POP fandom culture.**

#### 1. **Mass Consumer Entertainment Application**
- Leverages Sui's core strengths (parallel execution, low gas fees, instant finality) for **mainstream entertainment**
- Moves beyond DeFi/GameFi to connect **global entertainment industry** with Web3
- Serves as a **gateway** to onboard **1 billion+ K-POP fans** into the Sui ecosystem

#### 2. **Move Language Best Practices Showcase**

**sui_idol::photocard Module** - K-POP photocard implementation using Sui Object Model:
```move
struct PhotoCard has key, store {
    id: UID,
    idol_id: u64,
    rarity: u8,
    concept: String,
    season: u64,
    serial_no: u64,
    image_url: String,
}

struct IdolCard has key, store {
    id: UID,
    name: String,
    persona_prompt: String,  // AI-generated personality
    profile_image: String,
}
```

**cross_chain_storage Module** - Walrus storage proof on-chain registry:
```move
struct StorageProof has key, store {
    id: UID,
    blob_id: String,
    stored_epoch: u64,
    file_size: u64,
    source_chain: String,
    vaa_signature: vector<u8>,  // Wormhole VAA verification
}
```

#### 3. **Full-Stack Sui Infrastructure Demonstration**

```
Frontend (Sui dApp Kit)
    ↓
Smart Contracts (Move)
    ├── photocard.move (NFT minting)
    └── cross_chain_storage.move (Storage proof registry)
    ↓
Walrus Protocol (Decentralized Storage)
    ├── Photocard images
    └── AI-generated content
    ↓
Wormhole Bridge (Cross-chain interoperability)
    └── Sui ↔ EVM ↔ Solana asset bridging
```

**Integrated Technologies:**
- **Sui dApp Kit**: Wallet connection, transaction signing, real-time chain state queries
- **Walrus Protocol**: Decentralized storage for photocard images and AI-generated content
- **Wormhole**: Cross-chain asset transfer enabling users from other chains to join Sui ecosystem

---

### 🚀 Expected Impact

#### 1. **User Acquisition**

**K-POP Fandom Web3 Onboarding**
- Only a small fraction of 1B+ K-POP fans have Web3 experience
- AIDOL101 positioned as their **"first Web3 experience"**
- Natural user journey: Sui Wallet installation → SUI token acquisition → Sui ecosystem engagement

**Monthly Active Users (MAU) Contribution**
- Target: **100,000+ MAU** within 6 months post-launch
- Daily transactions: photocard minting, idol card issuance, story rewards
- Significant contribution to Sui network's total transaction volume

#### 2. **Ecosystem Growth**

**NFT Market Diversification**
- Current Sui NFTs: PFP projects, gaming items
- AIDOL101: Pioneering **entertainment IP-based collectible NFTs**
- Brings K-POP fandom to Sui NFT marketplaces (BlueMove, Clutchy, etc.)

**Walrus Protocol Adoption Acceleration**
- Mass storage of AI-generated images and photocards
- Projected: **1TB+ monthly storage** (100K MAU × 10MB average per user)
- Increased incentives for Walrus storage node operators

**Wormhole Bridge Volume Growth**
- Provides entry path for EVM/Solana users to Sui
- Cross-chain photocard transfers → increased Wormhole bridge transaction volume

#### 3. **Technical Validation**

**Sui Performance Verification**
- End-to-end latency testing: Real-time AI generation → on-chain minting → Walrus storage
- Large-scale concurrent access scenarios (e.g., new idol launch events)

**Move Developer Community Expansion**
- Open-source AIDOL101 codebase → Move learning reference
- Entertainment DApp development guidelines

#### 4. **Business Model Diversification**

**Revenue Model Validation within Sui Ecosystem**
- Premium photocard minting fees (SUI/WAL payments)
- Cross-chain transfer fees
- Premium story episode content sales

**IP Licensing Opportunities**
- Potential collaboration with actual K-POP entertainment companies upon success
- Expansion into official idol photocard platform on Sui

#### 5. **Global Marketing Impact**

**Sui Foundation Partnership Case Study**
- Reference case for Entertainment × Web3 collaboration
- Featured Sui use case at conferences and hackathons

**Media Exposure**
- K-POP + Web3 combination appeals to **both tech and entertainment media**
- Increases Sui network awareness

---

### 📊 Key Impact Metrics

| Metric | 6-Month Target | Sui Ecosystem Contribution |
|--------|---------------|---------------------------|
| **MAU** | 100,000+ | New Sui Wallet user growth |
| **Photocard Minting** | 500,000+ NFTs | Sui Object creation volume increase |
| **Walrus Storage** | 1TB+ | Walrus network usage growth |
| **Wormhole Bridge** | $500K+ TVL | Cross-chain liquidity expansion |
| **Daily Transactions** | 50,000+ txs | Sui network activity increase |

---

### 🎯 Long-term Vision

**"Making Sui the Web3 Hub for K-POP Fandom"**

1. **Season 2, 3 Expansion**: New idols, extended storylines
2. **DAO Governance**: Fan voting determines idol comeback concepts
3. **Real-world Integration**: Exclusive offline events for Sui NFT holders
4. **IP Extension**: Webtoons, animation, metaverse concerts

**AIDOL101 is not just a DApp—it's a strategic project connecting the Sui ecosystem with the global entertainment industry.**

---

## 🏗️ 시스템 아키텍처 / System Architecture

```
Frontend (React 18.3 + Vite)
    ↓
Wallet Integration (Sui dApp Kit)
    ↓
Backend Layer (Supabase)
    ├── PostgreSQL Database (RLS)
    ├── Edge Functions (AI processing)
    └── Storage (Walrus integration)
    ↓
Blockchain Layer
    ├── Sui Network (Move contracts)
    ├── Walrus Protocol (Decentralized storage)
    └── Wormhole Bridge (Cross-chain)
    ↓
AI Layer (Gemini 2.5 Flash via Lovable AI Gateway)
```

---

## 📦 설치 및 실행 / Installation & Setup

### 전제 조건 / Prerequisites
- Node.js 18+ 
- npm, pnpm, or bun
- Sui Wallet (for blockchain features)
- Supabase account (for backend features)

### 환경 변수 설정 / Environment Variables
`.env` 파일을 프로젝트 루트에 생성:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행 / Installation Steps
```bash
# 리포지토리 클론 / Clone repository
git clone https://github.com/your-org/aidol101.git
cd aidol101

# 의존성 설치 / Install dependencies
npm install

# 개발 서버 실행 / Run dev server
npm run dev
```

### 프로덕션 빌드 / Production Build
```bash
# 빌드 / Build
npm run build

# Sui 스마트 컨트랙트 배포 / Deploy Sui smart contracts
cd sui_idol
sui move build
sui client publish --gas-budget 100000000
```

---

## 📂 프로젝트 구조 / Project Structure

```
aidol101/
├── src/
│   ├── components/        # React 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── services/         # API 서비스 레이어
│   ├── hooks/            # 커스텀 React Hooks
│   ├── integrations/     # Supabase 통합
│   └── providers/        # Context Providers
├── sui_idol/             # Sui Move 스마트 컨트랙트
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # DB 마이그레이션
├── docs/                 # 기술 문서
└── public/               # 정적 자산
```

---

## 📚 기술 문서 / Technical Documentation

- [API 키 보안 가이드](./docs/API_KEY_SECURITY.md)
- [크로스체인 통합 가이드](./docs/CROSS_CHAIN_INTEGRATION.md)
- [프로덕션 배포 가이드](./docs/PRODUCTION_DEPLOYMENT.md)
- [사용자 가이드 - API 키 관리](./docs/USER_GUIDE_API_KEYS.md)
- [보안 수정 요약](./docs/SECURITY_FIXES_SUMMARY.md)

---

## 🌐 팀 & 연락처 / Team & Contact

🧑‍💻 **Team**: AIDOL101 by Pulse9 Inc  
📧 **Email**: contact@pulse9.net  
🐦 **X (Twitter)**: @aidol101  
🌍 **Website**: Coming Soon

---

## 📄 라이선스 / License
MIT License - 자유롭게 사용 가능

## 🤝 기여하기 / Contributing
Issues와 Pull Requests를 환영합니다!

## 🔗 관련 링크 / Links
- [Sui Network](https://sui.io)
- [Walrus Protocol](https://walrus.site)
- [Supabase](https://supabase.com)
- [Lovable AI](https://lovable.dev)
