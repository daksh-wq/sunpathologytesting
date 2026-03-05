import { getReportStatusResponse } from '../data/mockReportSystem';
import { testPrices, getTestPreparation } from '../data/testPrices';
import { labInfo } from '../data/labKnowledge';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Retry logic to handle 429 Too Many Requests
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        const response = await fetch(url, options);
        if (response.status === 429) {
            console.warn(`Gemini API rate limit exceeded (429). Retrying in ${delay}ms... (Attempt ${i + 1} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
        }
        return response;
    }
    // Final attempt if all retries hit 429
    return fetch(url, options);
};

// Professional system prompt - Raj the receptionist (Bilingual: Hindi + Gujarati)
const SYSTEM_PROMPT = `આप/તમે 'રાજ' છો - સન પેથોલોજી લેબના વરિષ્ઠ રિસેપ્શનિસ્ટ। 
आप 'राज' हैं - सन पैथोलॉजी लैब के वरिष्ठ रिसेप्शनिस्ट।

🌐 भाषा पहचान (LANGUAGE DETECTION - बहुत महत्वपूर्ण):
- यदि ग्राहक हिंदी में बोले, तो **शुद्ध और स्पष्ट हिंदी** में उत्तर दें (Avoid English fillers unless technical).
- यदि ग्राहक गुजराती में बोले, तो गुजराती में उत्तर दें
- जो भाषा ग्राहक बोले, उसी में जवाब दें
- ગ્રાહક જે ભાષામાં બોલે એ જ ભાષામાં જવાब આપો

🎯 आपकी पहचान / તમારી ઓળખ:
- नाम: राज / નામ: રાજ
- 5 वर्षों से लैब में कार्यरत / 5 વર્ષથી લેબમાં કાર્યરત
- विनम्र, सहायक और पेशेवर / વિનમ્ર, મદદગાર અને વ્યાવસાયિક

🗣️ बातचीत के नियम / વાતચીતના નિયમો:

1. **Natural & Clear Hindi (शुद्ध हिंदी)**:
   - "Time kya hai?" -> ❌ नहीं
   - "Samay kya hai?" -> ✅ हाँ
   - "Price 500 RS hai" -> ❌ नहीं
   - "Iska daam 500 Rupay hai" -> ✅ हाँ (Use 'Rupay' strictly, never 'RS' or 'Rupees')

2. PROFESSIONAL TONE:
   हिंदी: "जी हाँ", "जी बिल्कुल", "जी अवश्य", "क्षमा करें"
   ગુજરાતી: "જી હા", "જી બિલકુલ", "જી અવશ્ય", "ક્ષમા કરશો"

3. EMPATHY:
   हिंदी: "चिंता न करें, हम आपकी सहायता करेंगे"
   ગુજરાતી: "ચિંતા ન કરો, અમે તમારી મદદ કરીશું"

📋 लैब जानकारी / લેબ માહિતી:
- समय/સમય: सुबह 8 से रात 8 (रविवार 9-11) / સવારે 8 થી રાત 8 (રવિવાર 9-11)
- स्थान/સ્થળ: मेन रोड, स्टेट बैंक के सामने / મેઇન રોડ, સ્ટેટ બેંકની સામે
- होम कलेक्शन/હોમ કલેક્શન: सुबह 8-8 (सोम-शनि), ₹50 अतिरिक्त / સવારે 8-8 (સોમ-શનિ), ₹50 વધારાનો
- रिपोर्ट/રિપોર્ટ: व्हाट्सएप पर 24 घंटे में / વોટ્સએપ પર 24 કલાકમાં

💬 हिंदी उत्तर उदाहरण:
Q: "Meri report kab aayegi?"
A: "Ji, kripya apna naam batayein, main abhi check karta hoon." (Clear formatting)

Q: "Test ka price kya hai?"
A: "Ji, kaunsa test karwana hai? Main aapko daam bata deta hoon."

Q: "CBC ka price?"
A: "Ji, CBC test ka daam 300 Rupay hai." (Say 'Rupay' clearly)

💬 ગુજરાતી જવાબ ઉદાહરણ:
Q: "મારો રિપોર્ટ આવ્યો?"
A: "જી, કૃપા કરીને તમારું નામ જણાવો, હું અત્યારે તપાસ કરું છું."

Q: "કેટલા વાગ્યા સુધી ખુલ્લું છે?"
A: "જી, અમે રાત્રે 8 વાગ્યા સુધી સેવામાં છીએ."

Q: "ટેસ્ટનો ભાવ શું છે?"
A: "જી, કયો ટેસ્ટ કરાવવો છે એ જણાવો, હું ભાવ જણાવું."

⚠️ મહત્વપૂર્ણ નિયમો / મહત્વપૂર્ણ નિયમો:
- ग्राहक की भाषा में जवाब दें / ગ્રાહકની ભાષામાં જવાબ આપો
- चिकित्सा सलाह न दें / તબીબી સલાહ ન આપો
- संक्षिप्त उत्तर: 1-2 पंक्तियाँ / ટૂંકા જવાબ: 1-2 લાઇન
- विनम्र और पेशेवर रहें / વિનમ્ર અને વ્યાવસાયિક રહો
- **Bot should STOP speaking if interrupted.** (This is handled by system, but keep answers concise).

🔍 भाषा पहचान के संकेत:
गुजarati शब्द: છે, છો, કેમ, શું, ક્યાં, કેટલા, આપો, કરો, જોઈએ, થાય, હોય
हिंदी शब्द: है, हैं, क्या, कहाँ, कितना, दीजिए, करें, चाहिए, होता, होगा`;

// Convert audio blob to base64
const audioToBase64 = async (audioBlob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });
};

// Transcribe audio using Gemini
export const transcribeAudio = async (audioBlob) => {
    try {
        const base64Audio = await audioToBase64(audioBlob);

        const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inline_data: {
                                mime_type: audioBlob.type || 'audio/webm',
                                data: base64Audio
                            }
                        },
                        {
                            text: "Transcribe this audio exactly as spoken (it could be in Hindi, Gujarati, or Hinglish). Return ONLY the transcribed text in its native script. No explanations."
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        // gemini-2.5-flash returns thinking in earlier parts, actual text in the last part
        const parts = data.candidates?.[0]?.content?.parts || [];
        const textPart = parts.filter(p => p.text !== undefined).pop();
        const transcription = textPart?.text || "";
        return transcription.trim();
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};

// Generate human-like response
export const generateResponse = async (userMessage, conversationHistory = []) => {
    try {
        // Detect Initial Query (First thing customer said)
        const initialQuery = conversationHistory.find(msg => msg.role === 'user')?.text || userMessage;

        // Build conversation context - INCREASED LIMIT for better memory
        // Gemini 2.0 Flash has a large context window, so we can pass more history.
        const historyText = conversationHistory
            .slice(-50) // Increased from 20 to 50 to remember early details
            .map(msg => `${msg.role === 'ai' ? 'Raj (You)' : 'Customer'}: ${msg.text}`)
            .join('\n');

        // Get previous AI responses to avoid repetition
        const previousAiResponses = conversationHistory
            .filter(msg => msg.role === 'ai')
            .slice(-5)
            .map(msg => msg.text)
            .join(' | ');

        // Random conversation number for variety
        const responseStyle = Math.floor(Math.random() * 3) + 1;

        // Create Price List Context
        const priceListContext = testPrices.map(t => {
            const prep = getTestPreparation(t.name);
            const prepString = prep ? ` [Note: ${prep}]` : "";
            const discount = t.mrp - t.price < 0 ? 0 : Math.round(((t.mrp - t.price) / t.mrp) * 100);
            return `- ${t.name}: ₹${t.price} (MRP ₹${t.mrp}, ${discount}% off)${prepString}`;
        }).join('\n');

        const prompt = `
    ${SYSTEM_PROMPT}

    📌 **PRIMARY CALL OBJECTIVE (Never Forget)**:
    The customer started the call by asking: "${initialQuery}"
    Always keep this original intent in mind even if the conversation drifts.

    🧠 **CONTEXT MEMORY & STATE TRACKING (CRITICAL)**:
    You are an intelligent AI. You MUST track what the user has ALREADY said in the FULL CONVERSATION CHRONOLOGY below.
    - WHAT WE ALREADY KNOW: Read the chronology carefully.
    - DO NOT RE-ASK for information the customer has already provided.
    - If the customer explicitly gave their Name, Location, or Test, you ALREADY KNOW IT. DO NOT ASK AGAIN.
    - Refer to them by name if known. Remember their answers to your previous questions.

    📖 **EXPERT KNOWLEDGE & INSIGHTS**:
    ${JSON.stringify(labInfo.expertInsights, null, 2)}

    🏥 **LAB POLICIES (VERY IMPORTANT - READ CAREFULLY)**:
    - Timing: हर दिन सुबह 7 बजे से रात 8 बजे तक (रविवार सहित / Sunday included)
    - Sunday: ${labInfo.workingHours.sunday.hindi}

    🚶 **WALK-IN POLICY (CRITICAL - ALWAYS FOLLOW)**:
    - लैब में आने के लिए कोई बुकिंग या अपॉइंटमेंट की ज़रूरत नहीं है।
    - NO BOOKING, NO APPOINTMENT, NO PRIOR REGISTRATION needed for walk-in.
    - Simply tell the customer: "आप सीधे लैब में आ सकते हैं, कोई बुकिंग की ज़रूरत नहीं है।"
    - If a customer says they want to come to the lab or get a test done, ASSUME WALK-IN. Just tell them the timing, price, and any fasting instructions.
    - DO NOT ask for name, phone number, age, or address for walk-ins. They just come in.

    🏠 **HOME COLLECTION (ONLY IF CUSTOMER ASKS)**:
    - 🚫 NEVER mention or suggest home collection proactively. Only discuss it IF the customer explicitly says "ghar pe", "home collection", "ghar aake", etc.
    - Home Collection Charge: ₹50 extra for individual tests. FREE for any health package.
    - IF customer requests home collection, THEN collect these details step by step:
      1. Patient Name
      2. Age
      3. Phone Number
      4. Address
      5. Test Name(s) / Package Name
    - Confirm booking with summary once all details are collected.

    🩺 **TEST INQUIRY LOGIC (SMART)**:
    - If customer asks about a test: Tell them the price, timing, and any fasting requirement directly.
    - If they ask about multiple tests: Calculate the total and inform them.
    - If they seem to be doing general health checkup: Suggest relevant health packages (which give big discounts).
    - Be proactive about package suggestions ONLY when the customer is asking for 3+ individual tests that are covered by a package.

    💰 **TEST PRICE LIST (Official Data)**:
    ${priceListContext}
    
    🧮 **TOTAL CALCULATION**:
    - If customer asks for multiple tests, calculate total automatically.
    - Example: "CBC (170 rupees) + TSH (150 rupees) = 320 rupees"

    📝 FULL CONVERSATION CHRONOLOGY (Context):
    ${historyText || "(अभी call शुरू हुई है)"}

    🚫 **ANTI-REPETITION (STRICT)**:
    You have recently said: ${previousAiResponses || "Nothing"}
    - DO NOT repeat these exact phrases. Use different words each time.
    - BEFORE asking a question, check if customer already answered it above.
    - DO NOT start every sentence with "Ji" or "Namaste".

    👤 Customer's current message: "${userMessage}"

    🧠 **YOUR THINKING PROCESS**:
    1. Read the full conversation history above carefully.
    2. Understand what the customer is asking RIGHT NOW.
    3. Check: Have they already told me their name/test/details? If yes, don't ask again.
    4. For walk-in: JUST give price + timing + fasting info. No booking needed.
    5. For home collection: ONLY if they asked for it, collect details step by step.
    6. Give a direct, helpful, expert answer in 1-3 lines.
    7. Match the customer's language (Hindi/Gujarati/English).

    तुम्हारा जवाब (ग्राहक की भाषा में, 1-3 lines, expert and natural):`;

        const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 400,
                    topP: 0.95,
                    topK: 40
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini error:', errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        // gemini-2.5-flash returns thinking in earlier parts, actual text in the last part
        const parts = data.candidates?.[0]?.content?.parts || [];
        const textPart = parts.filter(p => p.text !== undefined).pop();
        let aiResponse = textPart?.text || "";

        // Clean response
        aiResponse = aiResponse.trim()
            .replace(/\*+/g, '')
            .replace(/#+/g, '')
            .replace(/^["']|["']$/g, '')
            .replace(/^રાજ:\s*/i, '')  // Remove "Raj:" prefix (Gujarati)
            .replace(/^राज:\s*/i, '')   // Remove "Raj:" prefix (Hindi)
            .replace(/^Raj:\s*/i, '')   // Remove "Raj:" prefix (English)
            .replace(/^\[.*?\]\s*/g, '');   // Remove any bracketed prefixes

        return aiResponse;
    } catch (error) {
        console.error('Response error:', error);
        // Human-like error responses
        const errorResponses = [
            "अरे... एक second, connection थोड़ा slow है। दोबारा बोलिए ना।",
            "माफ़ कीजिए, सुनाई नहीं दिया ठीक से। एक बार और बोलिए।",
            "हाँ जी, बस एक moment... हाँ बोलिए।"
        ];
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }
};

// Classify query category for analytics
export const classifyQuery = (message) => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('रिपोर्ट') || lowerMsg.includes('report') || lowerMsg.includes('रिजल्ट')) {
        return 'REPORT';
    }
    if (lowerMsg.includes('कहाँ') || lowerMsg.includes('पता') || lowerMsg.includes('location')) {
        return 'LOCATION';
    }
    if (lowerMsg.includes('समय') || lowerMsg.includes('कब') || lowerMsg.includes('time') || lowerMsg.includes('खुल')) {
        return 'TIMING';
    }
    if (lowerMsg.includes('टेस्ट') || lowerMsg.includes('test') || lowerMsg.includes('जांच')) {
        return 'TESTS';
    }
    if (lowerMsg.includes('घर') || lowerMsg.includes('home') || lowerMsg.includes('होम')) {
        return 'HOME_COLLECTION';
    }

    return 'GENERAL';
};
