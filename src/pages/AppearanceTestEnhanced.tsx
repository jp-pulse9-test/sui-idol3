import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";

interface Question {
  id: number;
  question: string;
  options: Array<{
    text: string;
    value: string;
    emoji: string;
  }>;
}

const getMaleAppearanceQuestions = (world: string): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: 1,
      question: "선호하는 소년 아이돌의 헤어스타일은?",
      options: [
        { text: "깔끔한 단발", value: "short", emoji: "✂️" },
        { text: "자연스러운 웨이브", value: "wave", emoji: "🌊" },
        { text: "시크한 장발", value: "long", emoji: "💫" },
        { text: "독특한 컬러", value: "colorful", emoji: "🎨" }
      ]
    },
    {
      id: 2,
      question: "매력적인 소년 아이돌의 눈매는?",
      options: [
        { text: "큰 동그란 눈", value: "round", emoji: "👀" },
        { text: "날카로운 눈매", value: "sharp", emoji: "⚡" },
        { text: "웃는 눈", value: "smiling", emoji: "😊" },
        { text: "신비로운 눈매", value: "mysterious", emoji: "🌙" }
      ]
    },
    {
      id: 3,
      question: "선호하는 소년 아이돌의 체형은?",
      options: [
        { text: "슬림한 체형", value: "slim", emoji: "🎋" },
        { text: "탄탄한 근육질", value: "athletic", emoji: "💪" },
        { text: "건강한 체형", value: "healthy", emoji: "🌟" },
        { text: "키가 큰 편", value: "tall", emoji: "🗼" }
      ]
    },
    {
      id: 4,
      question: "선호하는 소년 아이돌의 스타일은?",
      options: [
        { text: "깔끔한 정장", value: "formal", emoji: "🤵" },
        { text: "캐주얼 편안함", value: "casual", emoji: "👕" },
        { text: "힙한 스트릿", value: "street", emoji: "🧢" },
        { text: "모던 시크", value: "modern", emoji: "🖤" }
      ]
    },
    {
      id: 5,
      question: "매력적인 소년 아이돌의 표정은?",
      options: [
        { text: "밝은 미소", value: "bright", emoji: "😄" },
        { text: "쿨한 무표정", value: "cool", emoji: "😎" },
        { text: "차분한 미소", value: "calm", emoji: "😌" },
        { text: "장난스러운 표정", value: "playful", emoji: "😋" }
      ]
    },
    {
      id: 6,
      question: "소년 아이돌의 목소리 톤은?",
      options: [
        { text: "깊고 중저음", value: "deep", emoji: "🎵" },
        { text: "밝고 경쾌한", value: "bright_voice", emoji: "🎶" },
        { text: "부드럽고 따뜻한", value: "soft", emoji: "🎼" },
        { text: "독특하고 개성있는", value: "unique", emoji: "🎤" }
      ]
    },
    {
      id: 7,
      question: "소년 아이돌의 춤 스타일은?",
      options: [
        { text: "파워풀하고 강렬한", value: "powerful", emoji: "💥" },
        { text: "부드럽고 우아한", value: "graceful", emoji: "🕊️" },
        { text: "힙하고 트렌디한", value: "trendy", emoji: "🔥" },
        { text: "독창적이고 예술적인", value: "artistic", emoji: "🎭" }
      ]
    },
    {
      id: 8,
      question: "소년 아이돌의 패션 센스는?",
      options: [
        { text: "클래식하고 정제된", value: "classic", emoji: "👔" },
        { text: "트렌디하고 세련된", value: "trendy_fashion", emoji: "✨" },
        { text: "개성적이고 독특한", value: "unique_fashion", emoji: "🌈" },
        { text: "편안하고 자연스러운", value: "natural", emoji: "🍃" }
      ]
    },
    {
      id: 9,
      question: "소년 아이돌의 무대 매너는?",
      options: [
        { text: "카리스마틱하고 강인한", value: "charismatic", emoji: "👑" },
        { text: "친근하고 다정한", value: "friendly", emoji: "🤗" },
        { text: "프로페셔널하고 완벽한", value: "professional", emoji: "⭐" },
        { text: "자유롭고 즉흥적인", value: "free", emoji: "🎪" }
      ]
    },
    {
      id: 10,
      question: "소년 아이돌의 매력 포인트는?",
      options: [
        { text: "강한 리더십과 카리스마", value: "leadership", emoji: "🦁" },
        { text: "순수하고 깨끗한 이미지", value: "pure", emoji: "🤍" },
        { text: "섹시하고 성숙한 매력", value: "mature", emoji: "🖤" },
        { text: "밝고 에너지 넘치는", value: "energetic", emoji: "☀️" }
      ]
    },
    {
      id: 11,
      question: "소년 아이돌의 이상적인 컨셉은?",
      options: [
        { text: "강렬하고 파워풀한", value: "powerful_concept", emoji: "⚡" },
        { text: "로맨틱하고 감성적인", value: "romantic", emoji: "💖" },
        { text: "쿨하고 시크한", value: "chic", emoji: "🔮" },
        { text: "밝고 발랄한", value: "cheerful", emoji: "🌟" }
      ]
    }
  ];

  // 세계관별 질문 수정
  if (world === 'academy') {
    baseQuestions[8].question = "학원에서 소년 아이돌의 어떤 모습이 매력적인가요?";
    baseQuestions[8].options = [
      { text: "학생회장 같은 리더십", value: "leader_student", emoji: "🏫" },
      { text: "조용한 모범생", value: "quiet_student", emoji: "📚" },
      { text: "운동선수 같은 활발함", value: "athlete_student", emoji: "⚽" },
      { text: "예술적인 감성", value: "artistic_student", emoji: "🎨" }
    ];
  } else if (world === 'beast') {
    baseQuestions[9].question = "수인 소년 아이돌의 어떤 특징에 끌리나요?";
    baseQuestions[9].options = [
      { text: "늑대 같은 카리스마", value: "wolf_like", emoji: "🐺" },
      { text: "고양이 같은 사랑스러움", value: "cat_like", emoji: "🐱" },
      { text: "여우 같은 영리함", value: "fox_like", emoji: "🦊" },
      { text: "사자 같은 용맹함", value: "lion_like", emoji: "🦁" }
    ];
  }

  return baseQuestions;
};

const getFemaleAppearanceQuestions = (world: string): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: 1,
      question: "선호하는 소녀 아이돌의 헤어스타일은?",
      options: [
        { text: "깔끔한 단발", value: "short", emoji: "✂️" },
        { text: "부드러운 웨이브", value: "wave", emoji: "🌊" },
        { text: "우아한 장발", value: "long", emoji: "💫" },
        { text: "독특한 컬러", value: "colorful", emoji: "🎨" }
      ]
    },
    {
      id: 2,
      question: "매력적인 소녀 아이돌의 눈매는?",
      options: [
        { text: "큰 동그란 눈", value: "round", emoji: "👀" },
        { text: "고양이 같은 눈매", value: "cat_eyes", emoji: "🐱" },
        { text: "웃는 눈", value: "smiling", emoji: "😊" },
        { text: "신비로운 눈매", value: "mysterious", emoji: "🌙" }
      ]
    },
    {
      id: 3,
      question: "선호하는 소녀 아이돌의 체형은?",
      options: [
        { text: "슬림한 체형", value: "slim", emoji: "🎋" },
        { text: "건강한 체형", value: "healthy", emoji: "🌸" },
        { text: "부드러운 곡선", value: "soft", emoji: "🌺" },
        { text: "키가 큰 편", value: "tall", emoji: "🗼" }
      ]
    },
    {
      id: 4,
      question: "선호하는 소녀 아이돌의 스타일은?",
      options: [
        { text: "우아한 드레스", value: "elegant", emoji: "👗" },
        { text: "캐주얼 편안함", value: "casual", emoji: "👕" },
        { text: "힙한 스트릿", value: "street", emoji: "🧢" },
        { text: "로맨틱 플로럴", value: "romantic", emoji: "🌺" }
      ]
    },
    {
      id: 5,
      question: "매력적인 소녀 아이돌의 표정은?",
      options: [
        { text: "밝은 미소", value: "bright", emoji: "😄" },
        { text: "섹시한 윙크", value: "wink", emoji: "😉" },
        { text: "차분한 미소", value: "calm", emoji: "😌" },
        { text: "장난스러운 표정", value: "playful", emoji: "😋" }
      ]
    },
    {
      id: 6,
      question: "소녀 아이돌의 목소리 톤은?",
      options: [
        { text: "맑고 높은 음성", value: "clear_high", emoji: "🎵" },
        { text: "부드럽고 따뜻한", value: "soft", emoji: "🎶" },
        { text: "허스키하고 섹시한", value: "husky", emoji: "🎤" },
        { text: "독특하고 개성있는", value: "unique", emoji: "🎼" }
      ]
    },
    {
      id: 7,
      question: "소녀 아이돌의 춤 스타일은?",
      options: [
        { text: "우아하고 아름다운", value: "graceful", emoji: "🩰" },
        { text: "파워풀하고 강렬한", value: "powerful", emoji: "💥" },
        { text: "큐트하고 사랑스러운", value: "cute", emoji: "💕" },
        { text: "섹시하고 세련된", value: "sexy", emoji: "🔥" }
      ]
    },
    {
      id: 8,
      question: "소녀 아이돌의 패션 센스는?",
      options: [
        { text: "우아하고 고급스러운", value: "luxury", emoji: "💎" },
        { text: "트렌디하고 세련된", value: "trendy_fashion", emoji: "✨" },
        { text: "큐트하고 사랑스러운", value: "cute_fashion", emoji: "🎀" },
        { text: "독특하고 개성적인", value: "unique_fashion", emoji: "🌈" }
      ]
    },
    {
      id: 9,
      question: "소녀 아이돌의 무대 매너는?",
      options: [
        { text: "우아하고 품격있는", value: "elegant_manner", emoji: "👑" },
        { text: "친근하고 다정한", value: "friendly", emoji: "🤗" },
        { text: "섹시하고 매혹적인", value: "seductive", emoji: "💋" },
        { text: "발랄하고 에너지 넘치는", value: "energetic", emoji: "🌟" }
      ]
    },
    {
      id: 10,
      question: "소녀 아이돌의 매력 포인트는?",
      options: [
        { text: "청순하고 순수한 이미지", value: "innocent", emoji: "🤍" },
        { text: "섹시하고 성숙한 매력", value: "mature", emoji: "🖤" },
        { text: "큐트하고 사랑스러운", value: "adorable", emoji: "💖" },
        { text: "카리스마틱하고 강인한", value: "charismatic", emoji: "👸" }
      ]
    },
    {
      id: 11,
      question: "소녀 아이돌의 이상적인 컨셉은?",
      options: [
        { text: "로맨틱하고 감성적인", value: "romantic", emoji: "💐" },
        { text: "파워풀하고 강렬한", value: "powerful_concept", emoji: "⚡" },
        { text: "큐트하고 발랄한", value: "cute_concept", emoji: "🌸" },
        { text: "우아하고 신비로운", value: "mysterious_concept", emoji: "🔮" }
      ]
    }
  ];

  // 세계관별 질문 수정
  if (world === 'academy') {
    baseQuestions[8].question = "학원에서 소녀 아이돌의 어떤 모습이 매력적인가요?";
    baseQuestions[8].options = [
      { text: "학생회장 같은 리더십", value: "leader_student", emoji: "🎓" },
      { text: "조용한 모범생", value: "quiet_student", emoji: "📖" },
      { text: "예술적인 감성", value: "artistic_student", emoji: "🎨" },
      { text: "밝고 인기 많은", value: "popular_student", emoji: "🌟" }
    ];
  } else if (world === 'beast') {
    baseQuestions[9].question = "수인 소녀 아이돌의 어떤 특징에 끌리나요?";
    baseQuestions[9].options = [
      { text: "고양이 같은 사랑스러움", value: "cat_like", emoji: "🐱" },
      { text: "여우 같은 영리함", value: "fox_like", emoji: "🦊" },
      { text: "토끼 같은 순수함", value: "rabbit_like", emoji: "🐰" },
      { text: "늑대 같은 카리스마", value: "wolf_like", emoji: "🐺" }
    ];
  }

  return baseQuestions;
};

export const AppearanceTestEnhanced = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress } = useWallet();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!isConnected || !walletAddress) {
      toast.error("먼저 지갑을 연결해주세요!");
      navigate('/');
      return;
    }

    const selectedGender = localStorage.getItem('selectedGender');

    if (!selectedGender) {
      toast.error("먼저 성별을 선택해주세요!");
      navigate('/pick');
      return;
    }

    // 성별에 따른 질문 설정
    const questionsToUse = selectedGender === 'male'
      ? getMaleAppearanceQuestions('modern')
      : getFemaleAppearanceQuestions('modern');
    setQuestions(questionsToUse);
  }, [isConnected, walletAddress, navigate]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 외모 취향 분석 완료
      const appearanceProfile = calculateAppearanceProfile(newAnswers);
      localStorage.setItem('appearanceProfile', JSON.stringify(appearanceProfile));
      toast.success("외모 취향 분석이 완료되었습니다!");
      navigate('/result-analysis');
    }
  };

  const calculateAppearanceProfile = (answers: string[]) => {
    const selectedGender = localStorage.getItem('selectedGender');
    
    // 외모 취향 분석 로직
    const profile = {
      hair: answers[0],
      eyes: answers[1], 
      body: answers[2],
      style: answers[3],
      expression: answers[4],
      voice: answers[5],
      dance: answers[6],
      fashion: answers[7],
      manner: answers[8],
      charm: answers[9],
      concept: answers[10],
      type: determineAppearanceType(answers, selectedGender || 'male', 'modern'),
      gender: selectedGender,
      world: 'modern'
    };
    return profile;
  };

  const determineAppearanceType = (answers: string[], gender: string, world: string) => {
    // 세계관과 성별에 따른 타입 분류
    const genderPrefix = gender === 'male' ? '소년' : '소녀';
    
    let worldSuffix = '';
    if (world === 'academy') {
      worldSuffix = ' (학원물)';
    } else if (world === 'beast') {
      worldSuffix = ' (수인물)';
    } else if (world === 'apocalypse') {
      worldSuffix = ' (아포칼립스)';
    } else if (world === 'fantasy') {
      worldSuffix = ' (판타지)';
    }

    // 답변 분석 기반 타입 결정
    if (answers.includes("bright") && answers.includes("cheerful")) {
      return `밝고 발랄한 ${genderPrefix} 아이돌${worldSuffix}`;
    } else if (answers.includes("sharp") && answers.includes("charismatic")) {
      return `카리스마틱한 ${genderPrefix} 아이돌${worldSuffix}`;
    } else if (answers.includes("elegant") && answers.includes("graceful")) {
      return `우아한 ${genderPrefix} 아이돌${worldSuffix}`;
    } else if (answers.includes("cute") && answers.includes("adorable")) {
      return `큐트한 ${genderPrefix} 아이돌${worldSuffix}`;
    } else if (answers.includes("sexy") || answers.includes("mature")) {
      return `성숙한 ${genderPrefix} 아이돌${worldSuffix}`;
    } else {
      return `자연스러운 ${genderPrefix} 아이돌${worldSuffix}`;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">2. 외형 성향 분석</h1>
          <p className="text-muted-foreground">
            질문 {currentQuestion + 1} / {questions.length}
          </p>
          <Progress value={progress} className="w-full" />
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-border">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  variant="outline"
                  size="lg"
                  className="h-auto p-6 text-left flex items-center gap-4 hover:bg-primary/10"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-lg">{option.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => navigate('/mbti')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            이전 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTestEnhanced;