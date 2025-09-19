import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface IdolData {
  name: string
  personality: string
  description: string
  profile_image: string
  persona_prompt: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting idol generation process...')
    
    // 한국 K-pop 스타일 이름들과 성향들
    const koreanNames = [
      "지민", "태형", "정국", "석진", "호석", "남준", "윤기",
      "민지", "하니", "다니엘", "해린", "혜인",
      "카리나", "윈터", "닝닝", "지젤",
      "사쿠라", "채원", "윤진", "카즈하", "은채",
      "미연", "민니", "소연", "우기", "슈화",
      "나연", "정연", "모모", "사나", "지효", "미나", "다현", "채영", "쯔위",
      "예지", "리아", "류진", "채령", "유나",
      "아이린", "슬기", "웬디", "조이", "예리",
      "태연", "써니", "티파니", "효연", "유리", "수영", "윤아", "서현",
      "제니", "지수", "로제", "리사",
      "솔라", "문별", "휘인", "화사",
      "은하", "예린", "유주", "신비", "엄지", "유나",
      "아이유", "태민", "키", "온유", "종현", "민호",
      "찬열", "백현", "첸", "디오", "카이", "세훈", "수호", "시우민", "레이",
      "마크", "재현", "재민", "해찬", "런쥔", "천러", "지성",
      "타오", "승관", "호시", "준", "원우", "밍규", "도겸", "승철", "정한", "여준", "디노", "버논", "우지",
      "뱀뱀", "잭슨", "유겸", "영재", "진영", "마크", "제이비",
      "화영", "채원", "강혜원", "미카미", "나코", "히토미", "유리", "조유리", "안유진", "장원영", "권은비", "최예나"
    ]

    const personalities = [
      "밝고 에너지 넘치는", "차분하고 신중한", "유머러스하고 장난기 많은",
      "따뜻하고 배려심 깊은", "카리스마 있고 강인한", "순수하고 천진난만한",
      "지적이고 사려깊은", "자신감 넘치고 당당한", "섬세하고 감성적인",
      "활발하고 사교적인", "신비롭고 매력적인", "성실하고 열정적인",
      "유연하고 적응력 좋은", "창의적이고 독창적인", "안정적이고 믿음직한",
      "모험적이고 도전적인", "온화하고 평화로운", "역동적이고 진취적인",
      "직관적이고 영감적인", "논리적이고 체계적인"
    ]

    const concepts = [
      "청순", "섹시", "카리스마", "큐트", "엘레간트", "스포티", "레트로", "미니멀",
      "로맨틱", "펑키", "클래식", "모던", "빈티지", "어반", "네이처", "글래머",
      "인디", "팝", "락", "발라드", "댄스", "힙합", "재즈", "포크"
    ]

    let generatedIdols: IdolData[] = []
    
    // 202명의 아이돌 데이터 생성
    for (let i = 0; i < 202; i++) {
      try {
        const randomName = koreanNames[Math.floor(Math.random() * koreanNames.length)]
        const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)]
        const randomConcept = concepts[Math.floor(Math.random() * concepts.length)]
        
        // 이름에 번호 추가해서 유니크하게 만들기
        const uniqueName = `${randomName}${String(i + 1).padStart(3, '0')}`
        
        // Gemini 2.5를 사용해서 상세한 성격과 페르소나 생성
        const personaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `한국 K-pop 아이돌 "${uniqueName}"의 상세한 캐릭터를 만들어주세요.
                기본 성향: ${randomPersonality}
                컨셉: ${randomConcept}
                
                다음 형식으로 응답해주세요:
                성격설명: (3-4문장으로 구체적인 성격 특징)
                페르소나: (팬들과 대화할 때 사용할 말투와 캐릭터 설정, 200자 내외)`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 400
            }
          })
        })

        const personaData = await personaResponse.json()
        const personaText = personaData.candidates?.[0]?.content?.parts?.[0]?.text || ""
        
        // 텍스트에서 성격설명과 페르소나 추출
        const personalityMatch = personaText.match(/성격설명:\s*(.+?)(?=\n페르소나:|$)/s)
        const personaMatch = personaText.match(/페르소나:\s*(.+)/s)
        
        const description = personalityMatch ? personalityMatch[1].trim() : `${randomPersonality} 성격의 매력적인 K-pop 아이돌입니다.`
        const personaPrompt = personaMatch ? personaMatch[1].trim() : `안녕하세요! 저는 ${uniqueName}이에요. ${randomPersonality} 성격으로 팬 여러분과 즐겁게 대화하고 싶어요!`
        
        // 이미지 생성을 위한 프롬프트
        const imagePrompt = `Professional K-pop idol portrait photo of ${uniqueName}, ${randomPersonality} personality, ${randomConcept} concept, high quality studio lighting, beautiful Korean idol, detailed face, perfect makeup, stylish outfit, commercial photography style, 4K resolution`
        
        // 실제 이미지 생성은 시간이 많이 걸리므로, 플레이스홀더 이미지 사용
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${uniqueName}&backgroundColor=b6e3f4,c0aede,d1d4f9&clothesColor=black,blue01,blue02,blue03,gray01,gray02&topColor=auburn,black,blonde,brown,pastel,platinum,red,silverGray`
        
        const idolData: IdolData = {
          name: uniqueName,
          personality: `${randomPersonality} • ${randomConcept}`,
          description: description,
          profile_image: profileImage,
          persona_prompt: personaPrompt
        }
        
        generatedIdols.push(idolData)
        console.log(`Generated idol ${i + 1}/202: ${uniqueName}`)
        
        // API 호출 제한을 위한 딜레이
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`Error generating idol ${i + 1}:`, error)
        // 에러가 발생해도 기본 데이터로 계속 진행
        const fallbackName = `아이돌${String(i + 1).padStart(3, '0')}`
        const fallbackPersonality = personalities[i % personalities.length]
        const fallbackConcept = concepts[i % concepts.length]
        
        generatedIdols.push({
          name: fallbackName,
          personality: `${fallbackPersonality} • ${fallbackConcept}`,
          description: `${fallbackPersonality} 성격의 매력적인 K-pop 아이돌입니다.`,
          profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackName}`,
          persona_prompt: `안녕하세요! 저는 ${fallbackName}이에요. ${fallbackPersonality} 성격으로 팬 여러분과 즐겁게 대화하고 싶어요!`
        })
      }
    }

    console.log(`Generated ${generatedIdols.length} idols, inserting into database...`)

    // 데이터베이스에 일괄 삽입 (배치로 나누어서)
    const batchSize = 50
    let insertedCount = 0
    
    for (let i = 0; i < generatedIdols.length; i += batchSize) {
      const batch = generatedIdols.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('idols')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
        throw error
      }
      
      insertedCount += batch.length
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}, total: ${insertedCount}/${generatedIdols.length}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated and inserted ${insertedCount} idols`,
        sample: generatedIdols.slice(0, 3) // 처음 3명 샘플 반환
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-preset-idols function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate idols', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})