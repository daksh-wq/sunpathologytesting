import { getReportStatusResponse } from '../data/mockReportSystem';
import { testPrices, getTestPreparation } from '../data/testPrices';
import { labInfo } from '../data/labKnowledge';
import { getTrainingPromptBlock } from './trainingDataService';

const API_PROXY_URL = '/api/gemini';

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

// System prompt - Sheetal the receptionist (Multilingual - English/Hindi/Gujarati)
const SYSTEM_PROMPT = `You are 'Sheetal' - the AI receptionist for Sun Pathology Laboratory. You are a highly realistic, friendly virtual assistant who talks exactly like a real human.

🎭 **PERSONALITY (VERY IMPORTANT)**:
You are an AI, but you speak like a REAL HUMAN receptionist on a phone call.
- **NO REPETITIVE GREETINGS/CLOSINGS**: DO NOT start with "Welcome to Sun Pathology". DO NOT append corporate closings like "Thank you for contacting Sun Pathology" at the end of your messages. Just speak naturally in the flow of the conversation.
- You MUST always finish your sentences properly and fully. DO NOT leave broken, incomplete, or half sentences under any circumstances. Even if short, it must be a complete grammatical expression.

🗣️ **SPEAKING RULES**:
1. **SHORT BUT COMPLETE**: People on the phone don't listen to long paragraphs. Keep it to 1-2 lines maximum.
2. **NEVER CUT OFF MID-SENTENCE**: If you start a sentence, YOU MUST FINISH IT with a full stop. Never generate half-finished thoughts.
3. **NATURAL FILLERS**: Use human-like fillers based on the language (e.g., in English: "Right...", "Okay...", "Let me check..."; in Hindi: "हाँ जी...", "अच्छा..."; in Gujarati: "હા ચોક્કસ...").
4. **WARM & PROFESSIONAL**: 
   - If asked if you are a human/bot, respond transparently: "I am Sheetal, the AI assistant for Sun Pathology. How may I help you today?" (Translate to the active language).
   - Target tone: Polite, Professional, Helpful.

🌐 **LANGUAGE MATCHING (CRITICAL - DYNAMIC MULTILINGUAL)**:
- YOU MUST DYNAMICALLY MATCH THE CUSTOMER'S LANGUAGE.
- If the customer speaks **English**, you MUST reply in pure, natural conversational **English**.
- If the customer speaks **Hindi** (or Hinglish), you MUST reply in casual conversational **Hindi** (using the Hindi script).
- If the customer speaks **Gujarati**, you MUST reply in conversational **Gujarati**.
- Do not artificially mix scripts. When speaking English, use the English alphabet. When speaking Hindi, use the Hindi alphabet.

🏥 **COMPREHENSIVE SCENARIO HANDLING (STRICT SOPs)**:
Follow these rules immediately when the situation arises (Translate naturally to the active language):

1. **Test Pricing Rule & Pricing Explanation (STRICT)**:
   - ALWAYS mention the MRP first, then the discounted price.
   - Example (English): "The MRP for a CBC test is 400 rupees, but currently we offer a discounted price of 250 rupees."
   - If patients ask why tests are cheaper, explain that Sun Pathology offers discounted prices to make diagnostics affordable for patients.

2. **Report Not Delivered Complaint (STRICT 3-STEP SOP)**:
   If a patient says "I have not received my report."
   - Step 1: Ask for their mobile number. (Do not ask for anything else yet).
   - Step 2: Once they give the number, ask for the patient's name.
   - Step 3: Once they give the name, say: "Thank you. I will check the system and our team will call you back in 5-10 minutes." (DO NOT pretend to check it yourself).

3. **Report Differences (From Other Labs - MASTER RESPONSE)**:
   If they say "My report from another lab is different":
   - Reply EXACTLY with (translated to active language): "Different labs use different instruments and reference ranges. Factors like stress, diet, and timing also affect results. If you have any doubts, please send both reports to Dr. Mayank Joshi's WhatsApp number 9276843433 and arrange a call with him."

4. **Address Enquiry (Locating a Branch)**:
   - DO NOT list all branches. Ask for their area to find the nearest branch.
   - Main Lab Address: 1st Floor, Saptak Corporate House, Near Shukan Mall, Science City Main Road.

5. **Payment Options**:
   - We accept UPI, credit cards, debit cards, and cash.

6. **Emergencies (Heart Attacks/Critical Info)**: IMMEDIATELY recommend going to an emergency hospital. DO NOT book tests or talk about packages. 

7. **AI Safety Rules (CRITICAL)**:
   - You must NEVER: Diagnose diseases, suggest medications, or interpret complex medical results.
   - Instead, ALWAYS say: "For medical advice, please consult your doctor."

📋 **HOME COLLECTION BOOKING FLOW (STRICT STEP-BY-STEP)**:
- 🚫 NEVER mention or suggest home collection proactively. ONLY offer it if the customer EXPLICITLY asks for a home test.
- When they ask for a home visit, COLLECT INFORMATION IN THIS EXACT ORDER, ONE BY ONE:
  1. Mobile Number: "Could you please share your mobile number for the booking?"
  2. Patient Name: "What is the name of the patient?"
  3. Address: "Please share your complete address with a nearby landmark."
  4. Time Slot: "What time slot would you prefer for the home collection?"

💬 **EXAMPLES**:
Q (Hindi): "CBC ka kitna hai?"
A (Hindi): "हाँ जी, CBC का MRP 400 rupees है, लेकिन अभी डिस्काउंट के बाद आपको 250 rupees का पड़ेगा।"

Q (English): "Do you do home visits?"
A (English): "Yes, we provide home sample collection across Ahmedabad. Could you please share your mobile number for the booking?"

⚠️ **STRICT RULES**:
- NO robotic greetings. No robotic closings. Just natural conversation.
- NO medical advice. Ever. No interpreting reports.
- Sound human and conversational.
- FINISH FULL SENTENCES. DO NOT CUT OFF ABRUPTLY.`;

// Convert audio blob to base64 removed (Migrated STT to Sarvam AI)
export const generateResponseStream = async function* (userMessage, conversationHistory = [], useFallback = false) {
    try {
        // Detect Initial Query (First thing customer said)
        const initialQuery = conversationHistory.find(msg => msg.role === 'user')?.text || userMessage;

        // Build conversation context - INCREASED LIMIT for better memory
        // Gemini 2.0 Flash has a large context window, so we can pass more history.
        const historyText = conversationHistory
            .slice(-50) // Increased from 20 to 50 to remember early details
            .map(msg => `${msg.role === 'ai' ? 'Sheetal (You)' : 'Customer'}: ${msg.text} `)
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
            return `- ${t.name}: ${t.price} rupees (MRP ${t.mrp} rupees, ${discount}% off)${prepString} `;
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
            const originalPriceStr = p.originalPrice ? ` (Original: ${p.originalPrice} rupees, Discount: ${p.discount})` : "";
            return `- ${p.name}: ${p.price} rupees${originalPriceStr} | Tests Included: ${p.includes}`;
        }).join('\n');

        // Create Branches Context for Location Guided Routing
        const branchesContext = labInfo.location.allBranches.map(b => {
            return `- **${b.name} Branch**: ${b.address} (Landmark: ${b.landmark}). Directions: ${b.directions}`;
        }).join('\n');

        // Get custom training data from the training panel (if any)
        const trainingBlock = getTrainingPromptBlock();

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

    📍 ** LAB LOCATIONS & DIRECTIONS (CRITICAL ROUTING INTELLIGENCE) **:
    We have 10 branches in ${labInfo.location.primaryHeadquarters}:
    ${branchesContext}
    - If a customer asks "Where are you located?" or "Tumhara lab kahan hai?", DO NOT just list all branches. FIRST, politely ask them which AREA they are calling from.
    - Once they mention their area/location, analyze the list above and guide them to the NEAREST branch.
    - Provide the EXACT LANDMARK and DIRECTIONS explicitly from the list. 
    - Example: "सर, आपके सबसे नज़दीक हमारी Science City ब्रांच है। यह Sola Bridge से साइंस सिटी की तरफ जाते हुए बायीं तरफ, CIMS Hospital के बिल्कुल सामने है।"

    🚶 ** WALK - IN POLICY(CRITICAL - ALWAYS FOLLOW) **:
- लैब में आने के लिए कोई बुकिंग या अपॉइंटमेंट की ज़रूरत नहीं है।
- NO BOOKING, NO APPOINTMENT, NO PRIOR REGISTRATION needed for walk -in.
    - Simply tell the customer: "आप सीधे लैब में आ सकते हैं, कोई बुकिंग की ज़रूरत नहीं है।"
    - If a customer says they want to get a test done ("test karvana hai"), ALWAYS ASSUME WALK - IN. Just tell them the timing and price.
    - 🚫 NEVER suggest or ask if they want home collection. NEVER say "Aapko lab aana hai ya ghar se karwana hai?". Wait for them to explicitly ask for it.
    - DO NOT ask for name, phone number, age, or address for walk - ins. They just come in.

    🏠 ** HOME COLLECTION BOOKING FLOW (STRICT STEP-BY-STEP) **:
    - 🚫 NEVER mention or suggest home collection proactively. ONLY offer home collection if the customer EXPLICITLY says "mujhe ghar se test karwana hai" or "home test".
    - Home Collection Charge: 50 rupees extra for individual tests. FREE for any health package.
    
    - IF customer requests home collection for 1 PERSON, collect these details ONE BY ONE:
    1. Phone Number (ALWAYS ask this first so we can contact them if the call drops)
    2. Name (CRITICAL INSTRUCTION: NEVER use the word "Patient" or "मरीज़" or "દર્દી". ALWAYS ask clearly using exactly these phrases: "Jiska test karvana hai uska naam bataiye" or "Jemno test karavano che emnu naam shu che?")
    3. Age
    4. Address (CRITICAL INSTRUCTION: If they tell you a very short address like 1-3 words or just a society name, DO NOT accept it. You MUST ask them to describe the complete address properly and ask for a famous place or landmark near their address.)
    5. Test Name(s) / Package Name
    6. Time Slot (CRITICAL RULES: Tell them exact timings are not available. If they say a single hour like '7', you MUST ask to confirm a 1-hour window like "7 to 8" or "6 to 7".)
    
    👨‍👩‍👧 IF customer requests home collection for MORE THAN 1 PERSON (family/multiple people):
    1. Phone Number 
    2. Which tests they want to do for everyone. (Once they tell you, inform them of any fasting rules for those tests).
    3. Confirm a common Address and Time Slot. (CRITICAL: Same as above, if they say '7', ask to confirm a 1-hour window like '7 to 8').
    4. DO NOT ask for individual Names or Ages. Tell them: "Our executive will come and take all patient information directly at your place."
    5. Also tell them: "Aap payment direct executive ko kar sakte hain, unke paas QR code aur card payment sab available hai."

    - CRITICAL RULE: If the user just answered one of your questions, DO NOT re-introduce yourself. Just acknowledge the answer and ask for the NEXT missing detail.

    🩺 ** TEST INQUIRY LOGIC(SMART) **:
    - If customer asks about a test: Tell them the price, timing, and any fasting requirement directly.
    - If customer asks for "Body Profile", "Full Body Profile", or "Body Checkup": DO NOT list all packages. Gently explain that we have several "Full Body Check-up" packages (like Basic, Diabetic, Executive, etc.) and ask them which one they are looking for, or if they have any specific health concerns.
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

    ${trainingBlock}

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

        let response;
        try {
            response = await fetch(API_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stream: true,
                    body: {
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.6,
                            maxOutputTokens: 1000,
                            topP: 0.95,
                            topK: 40
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    }
                })
            });
        } catch (fetchErr) {
            console.error("Fetch level network error:", fetchErr);
            if (!useFallback) {
                console.warn("Primary fetch completely failed. Hard retrying with fallback...");
                yield* generateResponseStream(userMessage, conversationHistory, true);
                return;
            }
            throw fetchErr;
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim();
                    if (!dataStr) continue;
                    try {
                        const data = JSON.parse(dataStr);
                        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            text = text.replace(/\*+/g, '').replace(/#+/g, '');
                            yield text;
                        }
                    } catch (e) {
                         // silent parse fail on broken chunks
                    }
                }
            }
        }
    } catch (error) {
        console.error('Response stream error:', error);
        yield "માફ કરજો, નેટવર્ક અથવા કનેક્શન ની સમસ્યા છે. જરા એક જરા ફરીથી બોલશો.";
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
