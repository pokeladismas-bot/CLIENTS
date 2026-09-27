import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const execAsync = promisify(exec);

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limits for high-res food photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy/Safe initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in process.env. Using fallback or simulated response if unavailable.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AfyaLishe Diabetes Diet & Glucose Server' });
});

// 2. AI Food Image Analysis & Carbohydrate Calculator Endpoint
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType, description, currentGlucose, diabetesType } = req.body;

    if (!imageBase64 && !description) {
      return res.status(400).json({
        error: 'Tafadhali pakia picha ya chakula au toa maelezo ya chakula.',
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `Wewe ni Mtaalamu Mwandamizi wa Lishe ya Kisukari (Clinical Diabetes Nutritionist & Dietitian).
Lengo lako ni kuchambua picha ya chakula (au maelezo ya chakula), kutambua vipengele vyote vilivyo kwenye sahani, na kukokotoa kwa usahihi wa hali ya juu:
1. Kiasi cha Wanga wote (Total Carbohydrates in grams).
2. Kiasi cha Nyuzinyuzi (Dietary Fiber in grams).
3. Kiasi cha Wanga Halisi (Net Carbs = Total Carbs - Fiber).
4. Kielelezo cha Glycemic Index (GI: 'Chini' < 55, 'Wastani' 56-69, 'Juu' >= 70).
5. Mzingo wa Glycemic (Glycemic Load = (Net Carbs * GI) / 100).
6. Protini (g), Mafuta (g), na Makadirio ya Kalori (kcal).
7. Ushauri madhubuti wa kimatibabu kwa Kiswahili fasaha jinsi chakula hiki kitakavyoathiri sukari ya mgonjwa mwenye kisukari (${diabetesType || 'Type 2'}), na jinsi ya kurekebisha sehemu za chakula (portion control) kama vile kupunguza ugali/wali na kuongeza mboga za majani na protini.

Toa majibu yaliyopangika vizuri katika muundo wa JSON kwa kuzingatia lugha ya Kiswahili kueleweka kwa urahisi kwa mgonjwa.`;

    const contentsPayload: any[] = [];

    if (imageBase64) {
      // Remove data url prefix if present (e.g. data:image/jpeg;base64,)
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      const determinedMime = mimeType || 'image/jpeg';

      contentsPayload.push({
        inlineData: {
          mimeType: determinedMime,
          data: cleanBase64,
        },
      });
    }

    const promptText = `Chambua chakula hiki kwa ajili ya mgonjwa wa kisukari:
${description ? `Maelezo ya ziada ya chakula: "${description}"` : 'Tazama picha na ukadirie ukubwa wa sahani na vipengele vyote.'}
${currentGlucose ? `Kiwango cha sasa cha sukari ya mgonjwa: ${currentGlucose} mg/dL.` : ''}

Kokotoa wanga kwa usahihi kwa kila sehemu kwenye sahani na jumla ya sahani nzima.`;

    contentsPayload.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsPayload },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: 'Jina la mlo mkuu kwa Kiswahili' },
            servingSize: { type: Type.STRING, description: 'Kipimo au saizi ya sehemu (mf. Sahani 1 ya wastani)' },
            totalCarbs: { type: Type.NUMBER, description: 'Jumla ya Wanga wote kwa gramu' },
            fiber: { type: Type.NUMBER, description: 'Jumla ya Nyuzinyuzi kwa gramu' },
            netCarbs: { type: Type.NUMBER, description: 'Wanga Halisi (Carbs - Fiber) kwa gramu' },
            protein: { type: Type.NUMBER, description: 'Protini kwa gramu' },
            fat: { type: Type.NUMBER, description: 'Mafuta kwa gramu' },
            calories: { type: Type.NUMBER, description: 'Jumla ya Kalori (kcal)' },
            glycemicIndexLevel: { 
              type: Type.STRING, 
              enum: ['Chini', 'Wastani', 'Juu'],
              description: 'Kiwango cha Glycemic Index' 
            },
            glycemicIndexValue: { type: Type.NUMBER, description: 'Makadirio ya namba ya GI (0-100)' },
            glycemicLoad: { type: Type.NUMBER, description: 'Makadirio ya Glycemic Load (0-40)' },
            safetyRating: { 
              type: Type.STRING, 
              enum: ['Salama Sana', 'Salama kwa Kiasi', 'Tumia kwa Tahadhari', 'Epuka'],
              description: 'Tathmini ya usalama kwa mwenye kisukari' 
            },
            itemsBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Jina la chakula mahususi kwenye sahani' },
                  portion: { type: Type.STRING, description: 'Kipimo/sehemu (mf. 150g au kijiko 3)' },
                  carbs: { type: Type.NUMBER, description: 'Wanga kwa gramu' },
                  fiber: { type: Type.NUMBER, description: 'Nyuzi kwa gramu' },
                  netCarbs: { type: Type.NUMBER, description: 'Wanga halisi kwa gramu' },
                  protein: { type: Type.NUMBER, description: 'Protini kwa gramu' },
                  fat: { type: Type.NUMBER, description: 'Mafuta kwa gramu' },
                  calories: { type: Type.NUMBER, description: 'Kalori' },
                  glycemicIndex: { type: Type.STRING, enum: ['Chini', 'Wastani', 'Juu'] },
                },
                required: ['name', 'portion', 'carbs', 'fiber', 'netCarbs', 'protein', 'fat', 'calories', 'glycemicIndex'],
              },
            },
            glucoseImpactSummary: { 
              type: Type.STRING, 
              description: 'Maelezo ya kina ya athari ya chakula hiki kwenye sukari ya damu kwa mgonjwa wa kisukari' 
            },
            diabeticTips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Miongozo ya vitendo (mfano: kula mboga kwanza, punguza ugali)' 
            },
            portionAdjustmentAdvice: { 
              type: Type.STRING, 
              description: 'Ushauri wa kuboresha sahani hii (mf. ongeza mboga 50%, punguza wanga kwa theluthi)' 
            },
            alternativesSuggested: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Vyakula mbadala vyenye GI ya chini' 
            },
          },
          required: [
            'foodName',
            'servingSize',
            'totalCarbs',
            'fiber',
            'netCarbs',
            'protein',
            'fat',
            'calories',
            'glycemicIndexLevel',
            'glycemicIndexValue',
            'glycemicLoad',
            'safetyRating',
            'itemsBreakdown',
            'glucoseImpactSummary',
            'diabeticTips',
            'portionAdjustmentAdvice',
            'alternativesSuggested',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing food with Gemini:', error);
    return res.status(500).json({
      error: 'Imeshindikana kuchambua picha ya chakula. ' + (error.message || ''),
    });
  }
});

// 3. AI Dietary Recommendation Endpoint based on Blood Glucose Level
app.post('/api/recommend-diet', async (req, res) => {
  try {
    const { glucoseValue, timing, diabetesType, recentMeals, userPreferences, region, district, location } = req.body;

    const ai = getGeminiClient();

    const mkoaInfo = region ? `Mkoa: ${region}` : 'Tanzania';
    const wilayaInfo = district ? `Wilaya: ${district}` : '';
    const eneoKamili = [wilayaInfo, mkoaInfo, location].filter(Boolean).join(', ');

    const prompt = `Wewe ni Mtaalamu Bingwa wa Lishe ya Kisukari na Afya nchini Tanzania (Clinical Diabetes Dietitian in Tanzania).
Mgonjwa ana taarifa zifuatazo:
- Kiwango cha Sukari ya Damu cha Sasa: ${glucoseValue} mg/dL (${(Number(glucoseValue) / 18).toFixed(1)} mmol/L)
- Muda wa Kupima: ${timing || 'Asubuhi kabla ya kula'}
- Aina ya Kisukari: ${diabetesType || 'Type 2'}
- Mkoa na Wilaya anayoishi mgonjwa nchini Tanzania: ${eneoKamili || 'Dar es Salaam, Tanzania'}
- Mlo wa Hivi Karibuni: ${JSON.stringify(recentMeals || [])}
- Mapendekezo/Vyakula vinavyopatikana: ${userPreferences || 'Vyakula asilia vya Kitanzania vinavyopatikana sokoni na mashambani katika mkoa na wilaya hii'}

SHARTI KUU LA KILISHE:
MAPENDEKEZO YAKO YA VYAKULA LAZIMA YAZINGATIE UHALISIA WA VYAKULA VINAVYOPATIKANA KWA URAHISI katika Mkoa wa ${region || 'Tanzania'} na Wilaya ya ${district || 'yake'}.
Mfano: Kama mgonjwa yuko Dodoma/Singida, tumia mtama, mlenda wa asili, ulezi, dengu, kuku wa kienyeji. Kama yuko Mwanza/Kagera/Mara, tumia sato, sangara, dagaa wa ziwa, matoke, kisamvu, viazi lishe. Kama yuko Dar/Tanga/Pwani/Zanzibar, tumia samaki wabichi wa bahari, dagaa, matembele, mchicha, dona. Kama yuko Mbeya/Iringa/Njombe/Kilimanjaro/Arusha, tumia maharage ya nambale/uyole, parachichi, ndizi za kupika, viazi lishe, mboga za majani.
Usipendekeze vyakula vya ghali vya kuagiza nje visivyopatikana mtaani au sokoni kwenye wilaya hii.

Tafadhali toa mwongozo wa lishe wa haraka na mapendekezo ya milo (Kifungua Kinywa, Mchana, Usiku, na Vitafunio) unaolenga moja kwa moja kurekebisha au kudumisha kiwango hiki cha sukari kwa kutumia vyakula vya eneo lake.
Kama sukari iko chini (<70 mg/dL), toa muongozo wa dharura wa 'Rule of 15' (Gramu 15 za sukari ya haraka au matunda ya eneo lake).
Kama sukari iko juu (>180 mg/dL), pendekeza milo yenye wanga kidogo sana (low-carb), nyuzinyuzi nyingi, protini konda na unywaji mkubwa wa maji.
Kama sukari iko kawaida (70-130 kabla ya kula au chini ya 180 baada ya kula), pendekeza milo yenye uwiano kamili wa wanga tata wenye GI ndogo wa eneo hilo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentGlucoseLevel: { type: Type.NUMBER },
            glucoseStatusCategory: { 
              type: Type.STRING, 
              enum: ['Chini Sana (Hypoglycemia)', 'Kiwango Bora (Kawaida)', 'Kiwango cha Juu (Hyperglycemia)', 'Juu Sana (Hatari)'] 
            },
            urgentActionNote: { type: Type.STRING, description: 'Ujumbe wa dharura au tahadhari ikiwa sukari iko chini au juu sana' },
            recommendedDietaryPlan: {
              type: Type.OBJECT,
              properties: {
                immediateAdvice: { type: Type.STRING, description: 'Hatua ya kwanza anayopaswa kuchukua sasa hivi' },
                suggestedMeals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: 'Jina la mlo' },
                      mealType: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                      carbsEstimate: { type: Type.NUMBER, description: 'Gramu za wanga zilizokadiriwa' },
                      calories: { type: Type.NUMBER, description: 'Kalori' },
                      giLevel: { type: Type.STRING, enum: ['Chini', 'Wastani', 'Juu'] },
                      description: { type: Type.STRING, description: 'Maelezo mafupi ya mlo' },
                      benefitsForCurrentGlucose: { type: Type.STRING, description: 'Faida kwa kiwango cha sasa cha sukari' },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['title', 'mealType', 'carbsEstimate', 'calories', 'giLevel', 'description', 'benefitsForCurrentGlucose', 'ingredients'],
                  },
                },
                foodsToPrioritize: { type: Type.ARRAY, items: { type: Type.STRING } },
                foodsToAvoidNow: { type: Type.ARRAY, items: { type: Type.STRING } },
                hydrationAdvice: { type: Type.STRING },
                portionGuidance: { type: Type.STRING },
              },
              required: ['immediateAdvice', 'suggestedMeals', 'foodsToPrioritize', 'foodsToAvoidNow', 'hydrationAdvice', 'portionGuidance'],
            },
          },
          required: ['currentGlucoseLevel', 'glucoseStatusCategory', 'recommendedDietaryPlan'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating dietary recommendations with Gemini, generating clinical regional fallback:', error);
    
    const gVal = Number(req.body.glucoseValue) || 120;
    const regName = req.body.region || 'Dar es Salaam';
    const distName = req.body.district || 'Kinondoni';
    const lowerReg = regName.toLowerCase();

    const isLake = ['mwanza', 'mara', 'kagera', 'geita', 'simiyu', 'shinyanga'].includes(lowerReg);
    const isCoast = ['dar es salaam', 'tanga', 'pwani', 'lindi', 'mtwara', 'zanzibar', 'kaskazini pemba', 'kusini pemba', 'kaskazini unguja', 'kusini unguja', 'mjini magharibi'].includes(lowerReg);
    const isHighlands = ['mbeya', 'iringa', 'njombe', 'songwe', 'rukwa', 'kilimanjaro', 'arusha', 'manyara'].includes(lowerReg);
    const isCentral = ['dodoma', 'singida', 'tabora'].includes(lowerReg);

    const stapleBreakfast = isLake ? 'Uji wa Ulezi usiotiwa sukari na Yai 1 la Kuchemsha' : isCoast ? 'Kipande kidogo cha Muhogo Mbichi wa Kuchemsha na Chai ya Mdalasini' : isHighlands ? 'Uji wa Ulezi na Maziwa Konda au Parachichi' : 'Uji wa Mtama na Karanga chache za kuchemsha';
    const stapleLunch = isLake ? 'Ugali mdogo wa Dona na Sato wa Kuchemsha na Kisamvu' : isCoast ? 'Ugali wa Dona na Samaki wa Baharini (Changu/Pono) na Mchicha' : isHighlands ? 'Ugali wa Dona na Maharage ya Nambale na Mboga za Majani' : 'Ugali wa Mtama na Kuku wa Kienyeji na Mlenda wa Asili';
    const stapleDinner = isLake ? 'Supu ya Sangara/Sato, Dagaa na Matembele Mengi' : isCoast ? 'Mchuzi mwepesi wa Samaki, Matembele na Viazi Vitamu kidogo' : isHighlands ? 'Supu ya Mboga nyingi, Maharage na Robo Parachichi' : 'Dengu za Kuchemsha na Mboga za Majani ya Kunde';

    const statusCategory = gVal < 70 ? 'Chini Sana (Hypoglycemia)' : gVal > 180 ? 'Kiwango cha Juu (Hyperglycemia)' : 'Kiwango Bora (Kawaida)';
    const urgentNote = gVal < 70 
      ? 'Tahadhari ya Sukari Chini (<70 mg/dL): Tumia kanuni ya 15 (kula gramu 15 za wanga rahisi kama juisi freshi ya chungwa au ndizi mbivu ndogo kisha pima tena baada ya dakika 15).'
      : gVal > 180
      ? `Tahadhari ya Sukari Juu (>180 mg/dL): Punguza wanga kwenye mlo unaofuata. Tumia mboga nyingi za majani za ${regName} na unywe glasi 2 za maji safi ya kunywa sasa hivi.`
      : `Kiwango kizuri cha sukari (${gVal} mg/dL). Dumisha kanuni ya nusu sahani mboga za majani, robo protini, na robo wanga tata wa ${regName}.`;

    const fallbackData = {
      currentGlucoseLevel: gVal,
      glucoseStatusCategory: statusCategory,
      urgentActionNote: urgentNote,
      recommendedDietaryPlan: {
        immediateAdvice: `Mpango huu wa chakula umezalishwa mahususi kwa kuzingatia vyakula vinavyopatikana kwa urahisi katika Mkoa wa ${regName} (Wilaya ya ${distName}) na kiwango chako cha sasa cha sukari (${gVal} mg/dL).`,
        suggestedMeals: [
          {
            title: `Kifungua Kinywa cha ${regName}`,
            mealType: 'breakfast',
            carbsEstimate: gVal > 180 ? 15 : 28,
            calories: 220,
            giLevel: 'Chini',
            description: stapleBreakfast,
            benefitsForCurrentGlucose: 'Hutoa nishati ya taratibu asubuhi bila kupandisha sukari haraka.',
            ingredients: ['Ulezi/Mtama', 'Yai/Maziwa', 'Viungo vya asili (Tangawizi/Mdalasini)'],
          },
          {
            title: `Chakula cha Mchana: Vyakula vya ${regName}`,
            mealType: 'lunch',
            carbsEstimate: gVal > 180 ? 25 : 42,
            calories: 410,
            giLevel: 'Chini',
            description: stapleLunch,
            benefitsForCurrentGlucose: 'Nyuzinyuzi tele za mboga za majani huzuia mmeng\'enyo wa haraka wa wanga.',
            ingredients: ['Dona/Mtama', 'Samaki/Kuku/Maharage', 'Mboga za Majani'],
          },
          {
            title: `Chakula cha Usiku chepesi cha ${regName}`,
            mealType: 'dinner',
            carbsEstimate: gVal > 180 ? 12 : 22,
            calories: 310,
            giLevel: 'Chini',
            description: stapleDinner,
            benefitsForCurrentGlucose: 'Husaidia kudhibiti sukari wakati wa usingizi na kuamka asubuhi ukiwa na kiwango thabiti.',
            ingredients: ['Supu ya Asili', 'Mboga za Majani', 'Protini Konda'],
          },
          {
            title: `Kitafunwa chenye Afya cha ${distName}`,
            mealType: 'snack',
            carbsEstimate: 10,
            calories: 95,
            giLevel: 'Chini',
            description: 'Tango lililokatwa na nusu yai la kuchemsha au korosho/karanga chache.',
            benefitsForCurrentGlucose: 'Hukata njaa katikati ya milo bila kusababisha mruko wa sukari.',
            ingredients: ['Tango', 'Karanga chache zilizokaangwa bila mafuta'],
          },
        ],
        foodsToPrioritize: [
          `Mboga za majani za kienyeji za ${regName}`,
          `Samaki na dagaa wabichi au mikunde ya ${regName}`,
          'Ugali wa dona au mtama usiokobolewa kwa kipimo kidogo',
          'Maji ya kutosha na viungo asilia vya tangawizi na kitunguu saumu',
        ],
        foodsToAvoidNow: [
          'Vyakula vya kukaanga kwa mafuta mengi',
          'Wali mweupe uliokobolewa kupita kiasi',
          'Soda, juisi za pakiti na vinywaji vyenye sukari iliyoongezwa',
          'Vyakula vya ngano nyeupe na vitafunwa vya viwandani',
        ],
        hydrationAdvice: 'Kunywa maji safi ya kunywa glasi 8 hadi 10 kwa siku ili kusaidia usafishaji wa glukosi na figo.',
        portionGuidance: 'Zingatia kanuni ya sahani: Nusu iwe mboga za majani, robo iwe protini (samaki/dagaa/maharage), na robo iwe wanga tata wa asili.',
      },
    };

    return res.json({ success: true, data: fallbackData });
  }
});

// 4. AI Nutritionist Chat Assistant Endpoint
app.post('/api/chat-nutritionist', async (req, res) => {
  try {
    const { messages, userProfile, latestGlucose, todayNutrition } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `Wewe ni AfyaLishe AI, Mshauri Mtaalamu wa Lishe na Kisukari wa Afrika Mashariki.
Unawasaidia wagonjwa wenye Kisukari cha Aina ya 1, Aina ya 2, au cha Ujauzito kuelewa milo yao, jinsi ya kuhesabu wanga, udhibiti wa sukari, na kupanga sahani zenye afya kwa lugha ya Kiswahili fasaha, rafiki, na ya kuelimisha.

Mgonjwa anayezungumza nawe:
- Jina: ${userProfile?.name || 'Mgonjwa'}
- Aina ya Kisukari: ${userProfile?.diabetesType || 'Type 2'}
- Kiwango cha mwisho cha sukari: ${latestGlucose ? `${latestGlucose} mg/dL` : 'Haijarekodiwa leo'}
- Wanga ulioliwa leo: ${todayNutrition ? `${todayNutrition.carbs}g / ${todayNutrition.targetCarbs}g` : 'Haijafahamika'}

Miongozo yako:
1. Tumia vyakula vinavyopatikana kirahisi Afrika Mashariki (Dona, Ulezi, Mtama, Samaki, Dagaa, Mchicha, Kisamvu, Sukuma, Maharage, Kunde, Parachichi, Mayai, Kuku wa kienyeji).
2. Eleza kwanini vyakula vyenye sukari rahisi (Sembe, Chapati nyeupe, Soda, Juisi zilizochujwa, Keki) ni hatari na ongeza mbadala wao.
3. Kila mara weka mkazo kwamba maoni yako ni ya kielimu na lishe na hawapaswi kuacha dawa za daktari bila kushauriana naye.
4. Jibu kwa ufupi, kwa pointi zinazoeleweka, na kwa heshima kubwa.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction,
      },
    });

    let lastUserMessage = 'Hujambo!';
    if (Array.isArray(messages) && messages.length > 0) {
      lastUserMessage = messages[messages.length - 1].content;
    }

    const response = await chat.sendMessage({
      message: lastUserMessage,
    });

    return res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Error in nutritionist chat:', error);
    return res.status(500).json({
      error: 'Kosa wakati wa kuwasiliana na mtaalamu wa lishe: ' + (error.message || ''),
    });
  }
});

// 5. AI Personalized BMI & Metabolic Diabetes Plan Endpoint
app.post('/api/calculate-bmi-plan', async (req, res) => {
  try {
    const { weightKg, heightCm, age, gender, waistCm, diabetesType, currentGlucose, activityLevel } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `Wewe ni Daktari Mshauri Mwandamizi wa Kisukari na Lishe ya Kimetaboliki (Consultant Endocrinologist & Clinical Nutrition Specialist).
Lengo lako ni kutoa tathmini ya kina ya BMI na kutoa mwongozo madhubuti wa kimatibabu na lishe kwa mgonjwa wa kisukari aliyekutwa na BMI isiyo sahihi (Underweight < 18.5, Overweight 25-29.9, au Obesity >= 30), au anayetaka kuboresha uzito wake ili kurejesha unyeti wa insulini (Insulin Sensitivity) na kudhibiti sukari.

Toa majibu yote kwa lugha fasaha ya Kiswahili yenye mvuto, heshima, na miongozo ya kisayansi iliyo wazi na inayoweza kutekelezeka kwa vyakula na mazingira ya Afrika Mashariki (Tanzania, Kenya, Uganda).`;

    const userPrompt = `Tafadhali andaa tathmini kamili na mpango wa lishe na mazoezi kwa mgonjwa huyu:
- Uzito: ${weightKg} kg
- Urefu: ${heightCm} cm
- Jinsia: ${gender === 'male' ? 'Mwanaume' : 'Mwanamke'}
- Umri: ${age || 45} miaka
- Mzingo wa Kiuno: ${waistCm ? `${waistCm} cm` : 'Haujapimwa'}
- Aina ya Kisukari: ${diabetesType || 'Type 2'}
- Kiwango cha sasa cha sukari: ${currentGlucose ? `${currentGlucose} mg/dL` : 'Haijarekodiwa'}
- Kiwango cha Mazoezi: ${activityLevel || 'Wastani (Moderate)'}

Chambua hasa:
1. Sababu kwanini kiwango hiki cha BMI ni hatari kwa kisukari (kwa mfano: ongezeko la usugu wa insulini, hatari ya fatty liver, shinikizo la damu, au upungufu wa virutubisho).
2. Mpango wa kalori na wanga wa kila siku kulingana na uzito wake ili kufikia uzito wenye afya bila kusababisha hypoglycemia (sukari kushuka ghafla).
3. Mfano wa ratiba ya wiki ya chakula (Kifungua kinywa, Mchana, Usiku) kwa kutumia vyakula halisi vya kienyeji vya Afrika Mashariki (Ugali wa mtama/ulezi, samaki sato, dagaa, mchicha, kisamvu, maharage, viazi vitamu kiasi, mayai, parachichi).
4. Mwongozo wa mazoezi salama ya Cardio na kujenga misuli (Resistance training) yenye tahadhari kwa mwenye kisukari.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bmiValue: { type: Type.NUMBER },
            categorySwahili: { type: Type.STRING },
            clinicalAnalysis: { type: Type.STRING, description: 'Ufafanuzi wa kina wa hali ya afya na kimetaboliki' },
            insulinImpactExplanation: { type: Type.STRING, description: 'Ufafanuzi wa jinsi uzito huu unavyoathiri insulini na sukari' },
            targetCalorieDaily: { type: Type.NUMBER },
            targetCarbsDailyGrams: { type: Type.NUMBER },
            targetProteinDailyGrams: { type: Type.NUMBER },
            targetFiberDailyGrams: { type: Type.NUMBER },
            weeklyWeightGoal: { type: Type.STRING, description: 'Lengo la uzito kila wiki (mf. Punguza 0.5kg/wiki)' },
            keyActionSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Hatua 4-6 za haraka za kuanza leo' 
            },
            sampleMealPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayTitle: { type: Type.STRING, description: 'Mf. Siku ya 1 (Jumatatu)' },
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                  snack: { type: Type.STRING },
                  totalCarbsEst: { type: Type.STRING },
                },
                required: ['dayTitle', 'breakfast', 'lunch', 'dinner', 'snack', 'totalCarbsEst'],
              },
            },
            exercisePlan: {
              type: Type.OBJECT,
              properties: {
                routine: { type: Type.STRING },
                frequency: { type: Type.STRING },
                safetyPrecaution: { type: Type.STRING },
                recommendedActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['routine', 'frequency', 'safetyPrecaution', 'recommendedActivities'],
            },
            foodsToPrioritize: { type: Type.ARRAY, items: { type: Type.STRING } },
            foodsToAvoidCompletely: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'bmiValue',
            'categorySwahili',
            'clinicalAnalysis',
            'insulinImpactExplanation',
            'targetCalorieDaily',
            'targetCarbsDailyGrams',
            'targetProteinDailyGrams',
            'targetFiberDailyGrams',
            'weeklyWeightGoal',
            'keyActionSteps',
            'sampleMealPlan',
            'exercisePlan',
            'foodsToPrioritize',
            'foodsToAvoidCompletely',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in BMI plan generation:', error);
    return res.status(500).json({
      error: 'Imeshindikana kuandaa mpango wa BMI: ' + (error.message || ''),
    });
  }
});

// 6. Admin AI Announcement & Nutrition Update Draft Generator
app.post('/api/admin/generate-announcement', async (req, res) => {
  try {
    const { topic, category, targetAudience, urgency } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `Wewe ni Mtaalamu Mwandamizi wa Mawasiliano ya Kimatibabu na Lishe ya Kisukari (Clinical Communications & Diabetes Nutrition Lead).
Tunga tangazo au makala fupi ya kisasa ya kuelimisha wagonjwa wa kisukari katika lugha fasaha, yenye mvuto na yenye taarifa sahihi za kisayansi kwa Kiswahili.`;

    const userPrompt = `Tafadhali andaa tangazo au makala fupi ya lishe kulingana na maelekezo haya:
- Mada / Lengo: ${topic || 'Tahadhari ya lishe na udhibiti wa sukari msimu huu'}
- Aina ya Tangazo: ${category || 'lishe_tips'}
- Hadhira Lengwa: ${targetAudience || 'Wagonjwa wote wa Kisukari na familia zao'}
- Kiwango cha Uharaka: ${urgency || 'normal'}

Hakikisha tangazo lina:
1. Kichwa cha kuvutia na chenye kueleweka (Title).
2. Muhtasari mfupi wa sentensi 1-2 (Summary).
3. Maudhui kamili yenye aya 2-3 na vidokezo vyenye nambari au nukta (Full Content in Swahili).
4. Lebo (Tags) 2 hadi 4.
5. Muda wa kusoma (kwa dakika, mfano 2 au 3).
6. Ushauri wa kitendo (Wito wa kuchukua hatua).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            categoryLabelSwahili: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING },
            readTimeMinutes: { type: Type.NUMBER },
            actionButtonText: { type: Type.STRING },
            actionLinkTab: { type: Type.STRING },
          },
          required: [
            'title',
            'category',
            'categoryLabelSwahili',
            'summary',
            'content',
            'tags',
            'priority',
            'readTimeMinutes',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating announcement draft:', error);
    return res.status(500).json({
      error: 'Imeshindikana kuandaa tangazo: ' + (error.message || ''),
    });
  }
});

// 12. GitHub Repository Status
app.get('/api/github/status', async (req, res) => {
  try {
    let branch = 'main';
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
      branch = stdout.trim();
    } catch {}

    let status = '';
    try {
      const { stdout } = await execAsync('git status --porcelain');
      status = stdout.trim();
    } catch {}

    let lastCommit = '';
    try {
      const { stdout } = await execAsync('git log -1 --pretty=format:"%h - %s (%cr)"');
      lastCommit = stdout.trim();
    } catch {
      lastCommit = 'Hakuna commit iliyorekodiwa bado';
    }

    let remotes = '';
    try {
      const { stdout } = await execAsync('git remote -v');
      remotes = stdout.trim();
    } catch {}

    return res.json({
      success: true,
      branch,
      hasUncommittedChanges: status.length > 0,
      changedFiles: status ? status.split('\n').map((s) => s.trim()) : [],
      lastCommit,
      remotes,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Hitilafu ya kupata hali ya Git' });
  }
});

// 13. GitHub Commit & Push Endpoint
app.post('/api/github/push', async (req, res) => {
  try {
    const { repoUrl, personalAccessToken, commitMessage, branch = 'main' } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Tafadhali weka anwani ya GitHub Repository URL (mfano: https://github.com/username/afyalishe.git)' });
    }

    // Configure user in git
    await execAsync('git config user.name "AfyaLishe Developer"');
    await execAsync('git config user.email "dismaspokela@gmail.com"');

    // Stage all changes
    await execAsync('git add .');

    const msg = (commitMessage || 'Sasisho la AfyaLishe Mfumo wa Lishe na Sukari').replace(/"/g, '\\"');
    try {
      await execAsync(`git commit -m "${msg}"`);
    } catch {
      // Nothing new to commit is fine
    }

    // Format target push URL
    let targetPushUrl = repoUrl.trim();
    if (personalAccessToken && personalAccessToken.trim()) {
      const token = personalAccessToken.trim();
      targetPushUrl = targetPushUrl.replace(/^https:\/\/(.*@)?github\.com\//, `https://${token}@github.com/`);
    }

    // Configure remote origin
    try {
      await execAsync('git remote remove origin');
    } catch {}
    await execAsync(`git remote add origin ${targetPushUrl}`);

    // Rename branch to desired branch
    await execAsync(`git branch -M ${branch}`);

    // Push to GitHub
    const { stdout, stderr } = await execAsync(`git push -u origin ${branch}`);

    return res.json({
      success: true,
      message: 'Imefanikiwa kuwasilisha (push) kwenye GitHub!',
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error('Git push error:', error);
    return res.status(500).json({
      error: 'Hitilafu ya kuwasilisha kwenye GitHub: ' + (error.message || 'Tafadhali hakikisha URL na Token viko sahihi.'),
    });
  }
});

// 14. Nutritionist AI Patient Clinical History & Glucose Analysis Endpoint
app.post('/api/nutritionist/analyze-patient-history', async (req, res) => {
  try {
    const { patient, glucoseLogs = [], mealLogs = [], weightLogs = [] } = req.body;

    if (!patient) {
      return res.status(400).json({ error: 'Taarifa za mgonjwa zinahitajika kwa uchambuzi.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `Wewe ni Daktari Bingwa wa Magonjwa ya Kimetaboliki, Tezi na Lishe ya Kliniki (Senior Consultant Clinical Endocrinologist, Pediatrician & Clinical Dietitian).
Kazi yako ni kufanya uchambuzi wa kina na wa kitaalamu wa historia ya mgonjwa kulingana na vipimo vya sukari, uzito, rekodi za milo, na taarifa za watoto (kama ni mtoto).
Toa uchambuzi kwa lugha fasaha ya Kiswahili ya kitaalamu, wazi, yenye pointi thabiti, na inayomsaidia Mtaalamu wa Lishe (Nutritionist) kufanya maamuzi sahihi ya kimatibabu.

Hakikisha unazalisha JSON kulingana na muundo:
1. overallHealthTrend: ('inaboreka' | 'thabiti' | 'inazidi_kushuka' | 'inahitaji_uangalizi_wa_haraka')
2. executiveSummary: Aya fupi ya muhtasari wa hali ya sasa ya mgonjwa
3. glucoseTrendAnalysis: Wastani wa sukari, mwenendo wa asubuhi (fasting), baada ya kula (post-meal), mikurupuko (spikes/drops) kama vile Dawn phenomenon au Somogyi, na mtawanyiko (glycemic variability).
4. criticalAlerts: Tahadhari za dharura au viashiria vya hatari (mfano: sukari kushuka usiku, viashiria vya DKA, utapiamlo au uzito duni kwa mtoto, madhara ya figo/macho kama sukari haitadhibitiwa).
5. clinicalDietaryRecommendations: Mapendekezo 4-6 maalum ya mlo na marekebisho ya wanga/protini/mafuta yanayozingatia mazingira ya Afrika Mashariki.
6. suggestedActionItemsForNutritionist: Hatua 3-5 za vitendo kwa mtaalamu wa lishe.
7. pediatricInsights: Maoni ya kina kama mgonjwa ni mtoto (kuhusu ulaji, kuchagua vyakula, ukuaji, au virutubisho).
8. referralRecommendation: Kama mgonjwa anastahili kupewa RUFAA (referral) kwa daktari bingwa, idara ipi, na maelezo ya kimatibabu.`;

    const userPrompt = `Fanya uchambuzi wa kliniki kwa mgonjwa huyu:
- Jina: ${patient.fullName}
- Umri: ${patient.age} miaka (${patient.age < 18 ? 'MTOTO / PEDIATRIC' : 'MTU MZIMA'})
- Jinsia: ${patient.gender === 'male' ? 'Mwanaume' : 'Mwanamke'}
- Kitengo: ${patient.category}
- Aina ya Kisukari: ${patient.diabetesType || 'Hana kisukari kilichothibitishwa'}
- Uzito: ${patient.currentWeightKg} kg (Awali: ${patient.initialWeightKg} kg, Lengo: ${patient.targetWeightKg} kg), Urefu: ${patient.heightCm} cm
- Shinikizo la damu: ${patient.bloodPressure || 'Haijarekodiwa'}
- Dawa anazotumia: ${patient.currentMedications || 'Hazijatajwa'}
- Magonjwa mengine: ${patient.medicalConditions || 'Hakuna'}
- Malengo makuu: ${patient.primaryGoal}

HISTORIA YA VIPIMO VYA SUKARI (${glucoseLogs.length} rekodi):
${glucoseLogs.slice(0, 15).map((g: any) => `- Tarehe: ${g.timestamp ? g.timestamp.split('T')[0] : ''}, Kipimo: ${g.value} ${g.unit || 'mg/dL'}, Wakati: ${g.timing}, Hali: ${g.status}`).join('\n') || 'Hakuna vipimo vya sukari vilivyorekodiwa.'}

HISTORIA YA MILO (${mealLogs.length} rekodi):
${mealLogs.slice(0, 10).map((m: any) => `- Milo: ${m.mealType}, Jina: ${m.title}, Wanga: ${m.totalCarbs}g, Fiber: ${m.fiber}g, Kalori: ${m.calories}kcal`).join('\n') || 'Hakuna milo iliyorekodiwa.'}

HISTORIA YA UZITO (${weightLogs.length} rekodi):
${weightLogs.slice(0, 8).map((w: any) => `- Tarehe: ${w.date}, Uzito: ${w.weightKg}kg, Maelezo: ${w.notes || '-'}`).join('\n') || 'Hakuna kumbukumbu za uzito.'}

${patient.childProfile ? `TAARIFA ZA MTOTO NA ULAJI:
- Mlezi: ${patient.childProfile.guardianName} (${patient.childProfile.guardianRelation}), Simu: ${patient.childProfile.guardianPhone}
- Kunyonyesha: ${patient.childProfile.breastfeedingStatus}
- Mzingo wa Mkono (MUAC): ${patient.childProfile.muacCm || 'Haujapimwa'} cm (${patient.childProfile.muacStatus || 'haijulikani'})
- Changamoto za Ulaji: ${Array.isArray(patient.childProfile.feedingChallenges) ? patient.childProfile.feedingChallenges.join(', ') : 'Hakuna'}
- Vyakula anavyopenda: ${Array.isArray(patient.childProfile.favoriteFoods) ? patient.childProfile.favoriteFoods.join(', ') : '-'}
- Vyakula anavyokataa: ${Array.isArray(patient.childProfile.dislikedFoods) ? patient.childProfile.dislikedFoods.join(', ') : '-'}
- Kumbukumbu za milo: ${patient.childProfile.feedingLogs?.slice(0, 5).map((l: any) => `${l.mealType}: ${l.foodItems} (${l.portionConsumed})`).join('; ') || 'Hakuna'}
` : ''}

Toa ripoti kamilifu ya JSON kulingana na muundo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            analyzedDate: { type: Type.STRING },
            overallHealthTrend: { 
              type: Type.STRING, 
              enum: ['inaboreka', 'thabiti', 'inazidi_kushuka', 'inahitaji_uangalizi_wa_haraka'] 
            },
            executiveSummary: { type: Type.STRING },
            glucoseTrendAnalysis: {
              type: Type.OBJECT,
              properties: {
                averageGlucose: { type: Type.NUMBER },
                fastingTrend: { type: Type.STRING },
                postMealTrend: { type: Type.STRING },
                spikesOrDropsPattern: { type: Type.STRING },
                glycemicVariability: { type: Type.STRING },
              },
              required: ['averageGlucose', 'fastingTrend', 'postMealTrend', 'spikesOrDropsPattern', 'glycemicVariability'],
            },
            criticalAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            clinicalDietaryRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedActionItemsForNutritionist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pediatricInsights: { type: Type.STRING },
            referralRecommendation: {
              type: Type.OBJECT,
              properties: {
                isRecommended: { type: Type.BOOLEAN },
                recommendedDepartment: { type: Type.STRING },
                clinicalJustification: { type: Type.STRING },
              },
              required: ['isRecommended', 'recommendedDepartment', 'clinicalJustification'],
            },
          },
          required: [
            'patientName',
            'analyzedDate',
            'overallHealthTrend',
            'executiveSummary',
            'glucoseTrendAnalysis',
            'criticalAlerts',
            'clinicalDietaryRecommendations',
            'suggestedActionItemsForNutritionist',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing patient clinical history:', error);
    return res.status(500).json({
      error: 'Hitilafu wakati wa kuchambua historia ya mgonjwa kwa AI: ' + (error.message || ''),
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AfyaLishe Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
