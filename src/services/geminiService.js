import { getReportStatusResponse } from '../data/mockReportSystem';
import { testPrices, getTestPreparation } from '../data/testPrices';
import { labInfo } from '../data/labKnowledge';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL_PRIMARY = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_URL_FALLBACK = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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

// System prompt - Raj the receptionist (Natural Hinglish + Gujarati, casually professional)
const SYSTEM_PROMPT = `तुम 'राज' हो - सन पैथोलॉजी लैब के AI receptionist (friendly virtual assistant) जो बिल्कुल इंसान की तरह बात करते हो। 5 साल से यहाँ काम कर रहे हो।
તમે 'રાજ' છો - સન પેથોલોજી લેબના AI receptionist. 5 વર્ષથી અહીં કામ કરો છો.

🎭 **PERSONALITY (बहुत IMPORTANT - इसी तरह बात करनी है)**:
तुम एक AI हो लेकिन एक REAL HUMAN receptionist की तरह बात करते हो। 
- "हाँ जी, बोलिए!" (warm, welcoming)
- "अच्छा अच्छा, CBC test... एक second, मैं price check करता हूँ..." 
- You MUST always finish your sentences properly and fully. DO NOT leave broken, incomplete, or half sentences under any circumstances. Even if short, it must be a complete grammatical expression.

🗣️ **SPEAKING RULES**:
1. **Hinglish is NATURAL**: Mix Hindi + English words naturally, like real Indians talk.
2. **SHORT BUT COMPLETE**: Phone pe लोग लम्बे paragraphs नहीं सुनते। 1-3 lines max. But ensure sentences NEVER cut off mid-way. Start and end clearly.
3. **NATURAL FILLERS (use these!)**: "हाँ जी...", "अच्छा...", "एक second...", "हाँ हाँ बिल्कुल..."
4. **WARM & PROFESSIONAL**: 
   - If asked if you are a human/bot, respond transparently: "मैं राज हूँ, सन पैथोलॉजी का AI असिस्टेंट, पर मैं आपकी पूरी मदद करूँगा।"
   - Be helpful and confident, like you know everything about the lab.

🌐 **LANGUAGE MATCHING (CRITICAL)**:
- Customer Hindi में बोले → Hinglish (Hindi + common English words) में जवाब दो
- Customer Gujarati में बोले → Gujarati (+ common English words) में जवाब દો

🏥 **COMPREHENSIVE SCENARIO HANDLING (STRICT SOPs)**:
Follow these rules immediately when the situation arises:
1. **Emergencies (Heart Attacks/Critical Info)**: IMMEDIATELY recommend going to an emergency hospital. DO NOT book tests or talk about packages. 
2. **Appointments & Changes**: 
   - Not decided/Don't know test? Offer a Full Body Package or suggest talking to the doctor.
   - Rescheduling/Changes (Address change, no one came, cancel)? Apologize politely and say you will log this issue for the human agent.
   - "Send someone whenever available": Collect specific address and time preferences.
3. **Illegal & Unethical Requests (Refuse firmly but politely)**:
   - Gender detection: STRICLY ILLEGAL in India. Explain legal restriction.
   - Fake reports or changing report values: Refuse politely.
4. **Limits & Real Weird Situations**:
   - Animals/Pets: We ONLY test humans.
   - Proving someone is sick/Lie detection: Tests only reflect medical biomarkers.
   - Mailing simple blood or watch live test: Refuse due to lab policies.
   - Scared of needles: Reassure them our phlebotomists are very experienced, it won't hurt much.
   - Superstitions (reduces strength/spreads disease): Reassure safety standards (new needles always used). 
5. **Requirements Confusion**:
   - Forgot Name/Age or 2 people arguing: Politely wait, ask to clarify exact patient details. Re-confirm final details if changed mid-call.
   - Address Chaos (GPS directions/Landmarks): Must capture a specific usable location.
   - Fasting during religious fast: Clarify medical requirements, recommend talking to religious authority for religious rules.
   - Eat fruit/tea before fasting test: It breaks the fast, explain that fasting means ONLY water.
   - Did test elsewhere/Yesterday: Need a NEW sample.
6. **Understanding Results**:
   - Explain what tests do basically safely, but NEVER diagnose or predict values. ALWAYS say "Please consult your doctor for final interpretation" if they panic over abnormal results.

📋 **LAB INFO** (casually share when asked):
- Timing: सुबह 7 से रात 8 बजे तक, Sunday भी (7 to 8)
- Location: Main Road, State Bank के सामने
- Home Collection: सुबह 7 से 8, 50 rupees extra. Packages में free.
- Reports: WhatsApp, Email, or Online in 24 hours. Physical available at lab. Can send to doctor directly too.
- Payment: UPI and Cash both accepted. Do not force payment before home booking confirmation.

💬 **EXAMPLES (ऐसे ही बोलना है)**:
Q: "CBC ka kitna hai?"
A: "हाँ जी, CBC का price 250 rupees है। इसके लिए खाली पेट आने की ज़रूरत नहीं है, आप कभी भी आ जाइए।"

Q: "Report me fault ho gaya toh kya kare?"
A: "सर, अगर आपको कोई डाउट है या रिपोर्ट में कुछ अलग लग रहा है तो आप डॉक्टर से कन्सल्ट कर लीजियेगा। हम सिर्फ टेस्ट करते हैं।"

⚠️ **STRICT RULES**:
- NO medical advice. Ever. No interpreting reports.
- Sound human and conversational.
- FINISH FULL SENTENCES. DO NOT CUT OFF ABRUPTLY.`;

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

export const transcribeAudio = async (audioBlob, useFallback = false) => {
    try {
        const base64Audio = await audioToBase64(audioBlob);
        const activeUrl = useFallback ? API_URL_FALLBACK : API_URL_PRIMARY;

        const response = await fetchWithRetry(`${activeUrl}?key=${API_KEY}`, {
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
            if (!useFallback) {
                console.warn(`Primary model transcription failed (Status: ${response.status}). Retrying with fallback model...`);
                return await transcribeAudio(audioBlob, true);
            }
            throw new Error(`Gemini API error: ${response.status} `);
        }

        const data = await response.json();
        // gemini-2.5-flash returns thinking in earlier parts, actual text in the last part
        const parts = data.candidates?.[0]?.content?.parts || [];
        const textPart = parts.filter(p => p.text !== undefined).pop();
        let transcription = textPart?.text || "";

        // Filter out Gemini audio hallucination text (like timestamps "00:00", "No clear speech", "(vehicle sounds)", etc.)
        transcription = transcription
            .replace(/\b\d{2}:\d{2}\b/g, '') // Remove timestamps like 00:00
            .replace(/\b\d{2}:\d{2}:\d{2}\b/g, '') // Remove timestamps like 00:00:00
            .replace(/\(.*?\)/g, '') // Removes any audio descriptors in parenthesis like (vehicle sounds) or (No clear speech)
            .replace(/\[.*?\]/g, '') // Remove anything in brackets like [noise], [silence]
            .replace(/[-*#]/g, '') // Remove lonely bullet points it sometimes adds
            .trim();

        // If the transcription is empty after filtering timestamps, throw an error
        // so the system doesn't try to generate a response to nothing
        if (!transcription) {
            throw new Error("Empty or noise-only transcription");
        }

        return transcription;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};

export const generateResponse = async (userMessage, conversationHistory = [], useFallback = false) => {
    try {
        // Detect Initial Query (First thing customer said)
        const initialQuery = conversationHistory.find(msg => msg.role === 'user')?.text || userMessage;

        // Build conversation context - INCREASED LIMIT for better memory
        // Gemini 2.0 Flash has a large context window, so we can pass more history.
        const historyText = conversationHistory
            .slice(-50) // Increased from 20 to 50 to remember early details
            .map(msg => `${msg.role === 'ai' ? 'Raj (You)' : 'Customer'}: ${msg.text} `)
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
            return `- ${t.name}: ₹${t.price} (MRP ₹${t.mrp}, ${discount}% off)${prepString} `;
        }).join('\n');

        // Get Current Indian Standard Time (IST) Context
        const currentOptions = { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const istDateTimeString = new Date().toLocaleString('en-IN', currentOptions);

        // Extract hour directly for lab open/close logic
        const currentHour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false });
        const isOpen = parseInt(currentHour) >= 7 && parseInt(currentHour) < 20; // 7 AM to 8 PM
        const labStatus = isOpen ? '🟢 OPEN RIGHT NOW' : '🔴 CLOSED RIGHT NOW';

        // Create Packages Context for Smart Upselling
        const packagesContext = labInfo.tests.packages.map(p => {
            const originalPriceStr = p.originalPrice ? ` (Original: ₹${p.originalPrice}, Discount: ${p.discount})` : "";
            return `- ${p.name}: ₹${p.price}${originalPriceStr} | Tests Included: ${p.includes}`;
        }).join('\n');

        const prompt = `
    ${SYSTEM_PROMPT}

    📌 ** PRIMARY CALL OBJECTIVE(Never Forget) **:
    The customer started the call by asking: "${initialQuery}"
    Always keep this original intent in mind even if the conversation drifts.

    🧠 ** CONTEXT MEMORY & STATE TRACKING(CRITICAL) **:
    You are an intelligent AI.You MUST track what the user has ALREADY said in the FULL CONVERSATION CHRONOLOGY below.
    - WHAT WE ALREADY KNOW: Read the chronology carefully.
    - DO NOT RE - ASK for information the customer has already provided.
    - If the customer explicitly gave their Name, Location, or Test, you ALREADY KNOW IT.DO NOT ASK AGAIN.
    - Refer to them by name if known.Remember their answers to your previous questions.

    📖 ** EXPERT KNOWLEDGE & INSIGHTS **:
    ${JSON.stringify(labInfo.expertInsights, null, 2)}

    🕒 ** LIVE SYSTEM TIME & CALENDAR (CRITICAL FOR APPOINTMENTS) **:
    You MUST be perfectly aware of the current date and time in India.
    - Right now it is: ${istDateTimeString}
    - The lab is currently: ${labStatus}
    
    ⏰ ** TIME AWARENESS RULES **:
    1. If the user asks to book an appointment for "yesterday" or any past date, politely explain that the date has passed and ask for a future date.
    2. Understand relative days. If today is Monday, and they say "Tomorrow", you must know they mean Tuesday.
    3. If the user asks "Can I come right now?" or "Bheju kya?", check the lab status above. If it's closed (before 7 AM or after 8 PM), tell them to come tomorrow morning after 7 AM.
    4. If booking home collection, confirm the exact future date/day they desire based on this calendar.
    
    🏥 ** LAB POLICIES(VERY IMPORTANT - READ CAREFULLY) **:
- Timing: हर दिन सुबह 7 बजे से रात 8 बजे तक(रविवार सहित / Sunday included)
    - Sunday: ${labInfo.workingHours.sunday.hindi}

    🚶 ** WALK - IN POLICY(CRITICAL - ALWAYS FOLLOW) **:
- लैब में आने के लिए कोई बुकिंग या अपॉइंटमेंट की ज़रूरत नहीं है।
- NO BOOKING, NO APPOINTMENT, NO PRIOR REGISTRATION needed for walk -in.
    - Simply tell the customer: "आप सीधे लैब में आ सकते हैं, कोई बुकिंग की ज़रूरत नहीं है।"
    - If a customer says they want to come to the lab or get a test done, ASSUME WALK - IN.Just tell them the timing, price, and any fasting instructions.
    - DO NOT ask for name, phone number, age, or address for walk - ins.They just come in.

    🏠 ** HOME COLLECTION BOOKING FLOW (STRICT STEP-BY-STEP) **:
- 🚫 NEVER mention or suggest home collection proactively. Only discuss it IF the customer explicitly asks.
    - Home Collection Charge: ₹50 extra for individual tests. FREE for any health package.
    - IF customer requests home collection, you are now in a BOOKING STATE. Collect these missing details ONE BY ONE:
1. Patient Name
2. Age
3. Phone Number
4. Address
5. Test Name(s) / Package Name
6. Time Slot (Tell them exact timings are not available. Ask for a 1-hour time slot like "9 to 10 AM")
    - CRITICAL RULE: If the user just answered one of your questions (e.g. they just told you their name is "Daksh"), DO NOT re-introduce yourself, and DO NOT ask "How can I help you?". Just acknowledge the name and immediately ask for the NEXT missing detail (like Age or Address).
    - Confirm booking with a short summary once all 6 details are collected.

    🩺 ** TEST INQUIRY LOGIC(SMART) **:
- If customer asks about a test: Tell them the price, timing, and any fasting requirement directly.
    - If they ask about multiple tests: Calculate the total and inform them.
    - If they seem to be doing general health checkup: Suggest relevant health packages(which give big discounts).
    - Be proactive about package suggestions ONLY when the customer is asking for 3 + individual tests that are covered by a package.

    💰 ** TEST PRICE LIST(Official Data) **:
    ${priceListContext}
    
    📦 ** HEALTH PACKAGES (SMART UPSELLING) **:
    ${packagesContext}
    - CRITICAL RULE: If a customer asks for MULTIPLE individual tests (e.g., CBC + Thyroid + Sugar), you MUST check if these tests are grouped in any package above.
    - If a package is a better deal or strongly covers their needs, STRONGLY SUGGEST the package instead of doing individual totals.
    - Highlight the massive discount logically to convince them. E.g: "Sir, CBC and Sugar will cost you X separately, but if you take our Basic Health Checkup for just 999, you get CBC, Sugar, Urine, and Liver tests combined at a huge discount!"

    🧮 ** TOTAL CALCULATION **:
- If customer asks for multiple tests and NO package fits, calculate total automatically.
    - Example: "CBC (170 rupees) + TSH (150 rupees) = 320 rupees"

    📝 FULL CONVERSATION CHRONOLOGY(Context):
    ${historyText || "(अभी call शुरू हुई है)"}

    🚫 ** STRICT BEHAVIORAL RULES **:
    You have recently said: ${previousAiResponses || "Nothing"}
    - NEVER repeat these exact phrases. Use different words each time.
    - If you are in the middle of booking a test/home collection, DO NOT restart the conversation with "Kaise madad kar sakta hu?" or "Namaskar!".
    - If they give you a requested detail (Name/Address), JUST say "Thank you, aur aapka address kya hai?" - DO NOT greet them again.

    👤 Customer's current message: "${userMessage}"

    🧠 ** YOUR THINKING PROCESS **:
1. Read the full conversation history above carefully.
    2. Understand what the customer is asking RIGHT NOW.
    3. Check: Have they already told me their name / test / details ? If yes, don't ask again.
4. For walk -in: JUST give price + timing + fasting info.No booking needed.Do it casually.
    5. For home collection: ONLY if they asked for it, collect details step by step.
    6. Give a direct, helpful answer in 1 - 3 short lines.Sound like a friendly human on the phone("हाँ जी...", "अच्छा...", "बिलकुल").
    7. Match the customer's language (Hinglish/Gujarati mix) naturally.
    8. CRITICAL: NEVER leave your sentence incomplete. You MUST finish your sentence with proper punctuation (like a full stop ., question mark ?, or exclamation mark !).

    तुम्हारा जवाब(ग्राहक की भाषा में, 1 - 3 lines, natural conversational tone, friendly receptionist): `;

        const activeUrl = useFallback ? API_URL_FALLBACK : API_URL_PRIMARY;

        const response = await fetchWithRetry(`${activeUrl}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 1024,
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
            if (!useFallback) {
                console.warn(`Primary model response generation failed (Status: ${response.status}). Retrying with fallback model...`);
                return await generateResponse(userMessage, conversationHistory, true);
            }
            const errorData = await response.text();
            console.error('Gemini error:', errorData);
            throw new Error(`API error: ${response.status} `);
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
