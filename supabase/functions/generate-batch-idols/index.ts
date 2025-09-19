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
  gender: string
}

// 소녀 이름들
const femaleNames = [
  "아린", "세라", "루나", "비아", "나래", "하율", "수아", "예나", "유진", "소희",
  "다은", "서연", "채린", "예린", "하은", "지우", "리아", "미아", "레이", "유나",
  "채영", "다현", "나연", "지효", "아연", "소민", "하린", "예슬", "채원", "서윤",
  "지아", "수빈", "하람", "세빈", "나율", "온유", "별", "다솜", "가을", "보라",
  "하늘", "바다", "꽃님", "민지", "하니", "다니엘", "해린", "혜인", "카리나", "윈터",
  "닝닝", "지젤", "사쿠라", "채원", "윤진", "카즈하", "은채", "미연", "민니", "소연",
  "우기", "슈화", "태연", "써니", "티파니", "효연", "유리", "수영", "윤아", "서현",
  "보아", "아이유", "선미", "청하", "헤이즈", "볼빨간사춘기", "마마무", "레드벨벳", "블랙핑크", "트와이스",
  "이달의소녀", "있지", "에스파", "아이브", "뉴진스", "르세라핌", "케플러", "스테이씨", "위클리", "체리블렛",
  "공원소녀", "프로미스나인", "오마이걸", "우주소녀", "드림캐쳐", "이브", "피어시스", "라붐", "구구단", "크레용팝",
  "소라", "달샤", "나은"
]

// 소년 이름들  
const maleNames = [
  "준서", "도윤", "하준", "시우", "예준", "민준", "서준", "지호", "태민", "민혁",
  "현진", "승민", "찬영", "도현", "재현", "성진", "승현", "진영", "우진", "동현",
  "상현", "준영", "민성", "지성", "태양", "은결", "시온", "아름", "소망", "지민",
  "태형", "정국", "석진", "호석", "남준", "윤기", "방탄", "엑소", "빅뱅", "샤이니",
  "슈퍼주니어", "동방신기", "세븐틴", "뉴이스트", "워너원", "아이콘", "위너", "크로스진", "몬스타엑스", "갓세븐",
  "스트레이키즈", "에이티즈", "투모로우바이투게더", "엔하이픈", "아이브이이", "더보이즈", "골든차일드", "온앤오프", "베리타스", "크래비티",
  "아스트로", "비투비", "펜타곤", "유키스", "인피니트", "비에이피", "블락비", "엠블랙", "빅스", "투에이엠",
  "비스트", "하이라이트", "씨엔블루", "에프티아일랜드", "엔플라잉", "데이식스", "로얄파이럿츠", "더로즈", "엔.시.티", "웨이브이",
  "레드벨벳", "드림", "슈퍼엠", "카이", "백현", "찬열", "수호", "시우민", "디오", "세훈",
  "크리스", "이민호", "박서준", "송중기", "현빈", "이종석", "박보검", "김우빈", "지창욱", "박형식",
  "성훈", "재우", "선호"
]

const personalities = [
  "밝고 에너지 넘치는", "차분하고 신중한", "유머러스하고 장난기 많은",
  "따뜻하고 배려심 깊은", "카리스마 있고 강인한", "순수하고 천진난만한",
  "지적이고 사려깊은", "자신감 넘치고 당당한", "섬세하고 감성적인",
  "활발하고 사교적인", "신비로운 매력의", "쿨하고 도시적인"
]

const concepts = [
  "청순", "섹시", "카리스마", "큐트", "엘레간트", "스포티", "레트로", "미니멀",
  "로맨틱", "펑키", "클래식", "모던", "빈티지", "어반", "걸크러시", "소프트"
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()
    console.log('Starting batch idol generation: 101 girls + 101 boys', { sessionId })
    
    const generatedIdols: IdolData[] = []
    let successCount = 0
    const totalCount = 202 // 101 girls + 101 boys
    
    // 진행상황 업데이트 함수
    const updateProgress = async (current: number, stage: string, currentName?: string) => {
      const progressData = {
        current,
        total: totalCount,
        percentage: Math.round((current / totalCount) * 100),
        stage,
        currentName: currentName || '',
        sessionId
      }
      
      try {
        await supabase
          .channel(`idol-generation-${sessionId}`)
          .send({
            type: 'broadcast',
            event: 'progress_update',
            payload: progressData
          })
      } catch (error) {
        console.error('Failed to send progress update:', error)
      }
    }
    
    // 소녀 101명 생성
    console.log('Generating 101 girls...')
    await updateProgress(0, 'girls', '')
    
    for (let i = 0; i < 101; i++) {
      try {
        const name = femaleNames[i % femaleNames.length] + (i >= femaleNames.length ? `${Math.floor(i / femaleNames.length) + 1}` : '')
        const personality = personalities[Math.floor(Math.random() * personalities.length)]
        const concept = concepts[Math.floor(Math.random() * concepts.length)]
        
        console.log(`Generating girl ${i + 1}/101: ${name}`)
        await updateProgress(i + 1, 'girls', name)
        
        // Gemini로 성격과 페르소나 생성
        const personaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `한국 K-pop 여성 아이돌 "${name}"의 상세한 캐릭터를 만들어주세요.
                기본 성향: ${personality}
                컨셉: ${concept}
                
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

        let description = `${personality} 성격의 매력적인 K-pop 여성 아이돌입니다.`
        let personaPrompt = `안녕하세요! 저는 ${name}이에요. ${personality} 성격으로 팬 여러분과 즐겁게 대화하고 싶어요!`

        if (personaResponse.ok) {
          const personaData = await personaResponse.json()
          const personaText = personaData.candidates?.[0]?.content?.parts?.[0]?.text || ""
          
          const personalityMatch = personaText.match(/성격설명:\s*(.+?)(?=\n페르소나:|$)/s)
          const personaMatch = personaText.match(/페르소나:\s*(.+)/s)
          
          if (personalityMatch) description = personalityMatch[1].trim()
          if (personaMatch) personaPrompt = personaMatch[1].trim()
        }

        // Gemini 2.5 Flash로 이미지 생성
        const imagePrompt = `Professional portrait of a beautiful Korean K-pop girl idol with ${personality} personality and ${concept} concept. Studio lighting, perfect makeup, stylish modern outfit, photorealistic, high fashion photography style, ultra detailed, beautiful face, Korean girl`
        
        let profileImage = `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=f8bfdb,fde7e9,fce4ec&scale=80`
        
        const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate an image: ${imagePrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7
            }
          })
        })
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          const imageBase64 = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
          if (imageBase64) {
            profileImage = `data:image/png;base64,${imageBase64}`
          }
        }

        const idolData: IdolData = {
          name,
          personality: `${personality} • ${concept}`,
          description,
          profile_image: profileImage,
          persona_prompt: personaPrompt,
          gender: 'female'
        }
        
        generatedIdols.push(idolData)
        successCount++

        // API 레이트 제한 방지
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error generating girl ${i + 1}:`, error)
      }
    }

    // 소년 101명 생성
    console.log('Generating 101 boys...')
    for (let i = 0; i < 101; i++) {
      try {
        const name = maleNames[i % maleNames.length] + (i >= maleNames.length ? `${Math.floor(i / maleNames.length) + 1}` : '')
        const personality = personalities[Math.floor(Math.random() * personalities.length)]
        const concept = concepts[Math.floor(Math.random() * concepts.length)]
        
        console.log(`Generating boy ${i + 1}/101: ${name}`)
        await updateProgress(101 + i + 1, 'boys', name)
        
        // Gemini로 성격과 페르소나 생성
        const personaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `한국 K-pop 남성 아이돌 "${name}"의 상세한 캐릭터를 만들어주세요.
                기본 성향: ${personality}
                컨셉: ${concept}
                
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

        let description = `${personality} 성격의 매력적인 K-pop 남성 아이돌입니다.`
        let personaPrompt = `안녕하세요! 저는 ${name}입니다. ${personality} 성격으로 팬 여러분과 즐겁게 대화하고 싶습니다!`

        if (personaResponse.ok) {
          const personaData = await personaResponse.json()
          const personaText = personaData.candidates?.[0]?.content?.parts?.[0]?.text || ""
          
          const personalityMatch = personaText.match(/성격설명:\s*(.+?)(?=\n페르소나:|$)/s)
          const personaMatch = personaText.match(/페르소나:\s*(.+)/s)
          
          if (personalityMatch) description = personalityMatch[1].trim()
          if (personaMatch) personaPrompt = personaMatch[1].trim()
        }

        // Gemini 2.5 Image Flash로 이미지 생성
        const imagePrompt = `Professional portrait of a handsome Korean K-pop boy idol with ${personality} personality and ${concept} concept. Studio lighting, perfect makeup, stylish modern outfit, photorealistic, high fashion photography style, ultra detailed, handsome face, Korean boy`
        
        let profileImage = `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=bde3ff,c0deff,e1f5fe&scale=80`
        
        const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate an image: ${imagePrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7
            }
          })
        })
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          const imageBase64 = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
          if (imageBase64) {
            profileImage = `data:image/png;base64,${imageBase64}`
          }
        }

        const idolData: IdolData = {
          name,
          personality: `${personality} • ${concept}`,
          description,
          profile_image: profileImage,
          persona_prompt: personaPrompt,
          gender: 'male'
        }
        
        generatedIdols.push(idolData)
        successCount++

        // API 레이트 제한 방지
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error generating boy ${i + 1}:`, error)
      }
    }

    console.log(`Generated ${generatedIdols.length} idols total. Inserting into database...`)

    // 배치로 데이터베이스에 삽입 (50개씩)
    const batchSize = 50
    let insertedCount = 0
    
    for (let i = 0; i < generatedIdols.length; i += batchSize) {
      const batch = generatedIdols.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('idols')
        .insert(batch)
        .select()

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        insertedCount += data.length
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} idols`)
      }
    }

    console.log(`Successfully inserted ${insertedCount} idols into database`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${insertedCount} idols (${generatedIdols.filter(i => i.gender === 'female').length} girls, ${generatedIdols.filter(i => i.gender === 'male').length} boys)`,
        generated_count: insertedCount,
        girls_count: generatedIdols.filter(i => i.gender === 'female').length,
        boys_count: generatedIdols.filter(i => i.gender === 'male').length,
        sample_idols: generatedIdols.slice(0, 5)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-batch-idols function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate batch idols', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})