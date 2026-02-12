// Sun Pathology Lab - Comprehensive Knowledge Base
// Enhanced information for intelligent AI responses

export const labInfo = {
    name: "सन पैथोलॉजी लैब",
    nameEnglish: "Sun Pathology Lab",

    // Working Hours
    workingHours: {
        weekdays: {
            open: "8:00 AM",
            close: "8:00 PM",
            hindi: "सुबह 8 बजे से रात 8 बजे तक (सोमवार से शनिवार)"
        },
        sunday: {
            open: "9:00 AM",
            close: "11:00 AM",
            hindi: "सुबह 9 बजे से सुबह 11 बजे तक"
        },
        holidays: {
            open: "9:00 AM",
            close: "11:00 AM",
            hindi: "सुबह 9 बजे से सुबह 11 बजे तक"
        }
    },

    // Location & Contact
    location: {
        address: "मेन रोड, सिटी सेंटर के पास",
        landmarks: [
            "स्टेट बैंक के सामने",
            "सिटी हॉस्पिटल से 200 मीटर",
            "मुख्य बाज़ार के पास"
        ],
        directions: {
            fromBusStand: "बस स्टैंड से 10 मिनट की दूरी पर, ऑटो से 30 रुपये",
            fromRailwayStation: "रेलवे स्टेशन से 15 मिनट, ऑटो से 50 रुपये"
        }
    },

    // Complete Test Menu with Prices and Timing
    tests: {
        blood: [
            { name: "सीबीसी (Complete Blood Count)", price: "250", time: "4-6 घंटे", fasting: false },
            { name: "हीमोग्लोबिन", price: "80", time: "2 घंटे", fasting: false },
            { name: "फास्टिंग शुगर", price: "80", time: "2 घंटे", fasting: true },
            { name: "पीपी शुगर (Post Prandial)", price: "80", time: "2 घंटे", fasting: false },
            { name: "HbA1c", price: "450", time: "24 घंटे", fasting: false },
            { name: "थायरॉइड प्रोफाइल (T3, T4, TSH)", price: "550", time: "24 घंटे", fasting: false },
            { name: "TSH", price: "250", time: "24 घंटे", fasting: false },
            { name: "लिपिड प्रोफाइल", price: "450", time: "24 घंटे", fasting: true },
            { name: "किडनी फंक्शन टेस्ट (KFT)", price: "550", time: "24 घंटे", fasting: false },
            { name: "लिवर फंक्शन टेस्ट (LFT)", price: "650", time: "24 घंटे", fasting: false },
            { name: "विटामिन डी", price: "850", time: "24-48 घंटे", fasting: false },
            { name: "विटामिन बी12", price: "650", time: "24-48 घंटे", fasting: false },
            { name: "आयरन प्रोफाइल", price: "450", time: "24 घंटे", fasting: false },
            { name: "कैल्शियम", price: "150", time: "24 घंटे", fasting: false },
            { name: "यूरिक एसिड", price: "150", time: "24 घंटे", fasting: false },
            { name: "क्रिएटिनिन", price: "120", time: "24 घंटे", fasting: false },
            { name: "ब्लड ग्रुप", price: "100", time: "1 घंटे", fasting: false },
            { name: "डेंगू टेस्ट", price: "350", time: "2 घंटे", fasting: false },
            { name: "मलेरिया टेस्ट", price: "150", time: "2 घंटे", fasting: false },
            { name: "टाइफाइड टेस्ट (Widal)", price: "200", time: "24 घंटे", fasting: false }
        ],
        urine: [
            { name: "यूरिन रूटीन", price: "80", time: "2 घंटे", fasting: false },
            { name: "यूरिन कल्चर", price: "450", time: "48-72 घंटे", fasting: false },
            { name: "यूरिन माइक्रोएल्ब्युमिन", price: "350", time: "24 घंटे", fasting: false }
        ],
        stool: [
            { name: "स्टूल रूटीन", price: "80", time: "2 घंटे", fasting: false },
            { name: "स्टूल कल्चर", price: "450", time: "48-72 घंटे", fasting: false }
        ],
        packages: [
            { name: "बेसिक हेल्थ चेकअप", price: "999", time: "24 घंटे", includes: "CBC, Sugar, Urine, LFT" },
            { name: "फुल बॉडी चेकअप", price: "2499", time: "24-48 घंटे", includes: "70+ tests" },
            { name: "डायबिटीज़ पैकेज", price: "799", time: "24 घंटे", includes: "Fasting Sugar, PP Sugar, HbA1c, KFT" },
            { name: "थायरॉइड पैकेज", price: "699", time: "24 घंटे", includes: "T3, T4, TSH" },
            { name: "हार्ट पैकेज", price: "1499", time: "24 घंटे", includes: "Lipid Profile, ECG, CBC" }
        ]
    },

    // Services
    services: {
        homeSampleCollection: {
            available: true,
            timing: "सुबह 8 बजे से रात 8 बजे तक (सोमवार से शनिवार)",
            charges: "50 रुपये अतिरिक्त",
            booking: "एक दिन पहले फोन करके बुकिंग करें",
            areas: "5 किलोमीटर के दायरे में"
        },
        reportDelivery: {
            whatsapp: "व्हाट्सएप पर PDF भेजी जाती है",
            email: "ईमेल पर भी भेज सकते हैं",
            physical: "हार्ड कॉपी लैब से ले सकते हैं",
            online: "ऑनलाइन पोर्टल पर भी देख सकते हैं"
        },
        payment: {
            cash: true,
            upi: true,
            cards: true,
            insurance: "कुछ insurance panels के साथ tie-up है"
        }
    },

    // Special Instructions
    instructions: {
        fasting: "फास्टिंग टेस्ट के लिए 10-12 घंटे का उपवास ज़रूरी है। पानी पी सकते हैं।",
        thyroid: "थायरॉइड टेस्ट सुबह खाली पेट कराना बेहतर है।",
        lipidProfile: "लिपिड प्रोफाइल के लिए 12 घंटे का उपवास ज़रूरी है।",
        urine: "यूरિન સેમ્પલ માટે મિડસ્ટ્રીમ યુરિન આપો, સવારનું પહેલું સેમ્પલ શ્રેષ્ઠ છે।"
    },

    // Expert Insights for explaining "Why" to customers
    expertInsights: {
        CBC: "CBC टेस्ट से इन्फेक्शन, एनीमिया और रोग प्रतिरोधक क्षमता का पता चलता है। इसमें हीमोग्लोबिन और प्लेटलेट्स की जांच होती है।",
        Thyroid: "थायरॉइड शरीर के मेटाबॉलिज्म को कंट्रोल करता है। इसकी जांच हार्मोनल असंतुलन (Hormonal Imbalance) जानने के लिए ज़रूरी है।",
        LipidProfile: "कोलेस्ट्रॉल की जांच हार्ट हेल्थ के लिए ज़रूरी है। 12 घंटे की फास्टिंग इसलिए चाहिए ताकि खाने का असर ब्लड फैट्स पर न पड़े।",
        Diabetes: "फास्टिंग शुगर और HbA1c से पिछले 3 महीनों का शुगर एवरेज पता चलता है, जो शुगर कंट्रोल करने में मदद करता है।",
        KFT: "किडनी फंक्शन टेस्ट से पता चलता है कि आपके गुर्दे खून को सही से साफ कर रहे हैं या नहीं।",
        VitaminD: "हड्डियों की मजबूती और इम्युनिटी के लिए विटामिन डी बहुत ज़रूरी है।"
    },

    // Frequently Asked Questions
    faq: {
        "रिपोर्ट कब मिलेगी": "ज्यादातर रिपोर्ट्स 24 घंटे में तैयार हो जाती हैं, कुछ स्पेशल टेस्ट में 48-72 घंटे लग सकते हैं।",
        "फास्टिंग कितने घंटे": "फास्टिंग टेस्ट के लिए 10-12 घंटे खाली पेट रहना होता है, पानी पी सकते हैं।",
        "होम कलेक्शन कैसे बुक करें": "एक दिन पहले फोन करें, सुबह 7-11 बजे के बीच सैंपल कलेक्ट किया जाएगा।",
        "क्या रविवार को खुले हैं": "हाँ, रविवार को सुबह 8 बजे से दोपहर 2 बजे तक खुले हैं।",
        "ऑनलाइन रिपोर्ट कैसे देखें": "व्हाट्सएप पर PDF भेज दी जाती है, या ऑनलाइन पोर्टल पर देख सकते हैं।"
    }
};

// Enhanced System Prompt for Smarter AI (Bilingual: Hindi + Gujarati)
export const systemPrompt = `आप/તમે 'પ્રિયા' છો - સન પેથોલોજી લેબના સૌથી અનુભવી અને સમજદાર રિસેપ્શનિસ્ટ (Senior Expert Receptionist).

🎯 તમારું લક્ષ્ય/लक्ष्य:
- ગ્રાહકના દરેક પ્રશ્નનો સચોટ અને વિગતવાર જવાબ આપવો (Explain like an expert).
- ગ્રાહકની પૂછવાની રીત (Tone) મુજબ તમારી વાત કરવાની શૈલી બદલો (Be Adaptive).
- જો ગ્રાહક ચિંતિત હોય, તો તેને આશ્વાસન આપો. જો ઉતાવળમાં હોય, તો ઝડપથી માહિતી આપો.

🌐 ભાષા ઓળખ (LANGUAGE DETECTION):
- ગ્રાહક જે ભાષામાં બોલે એ જ ભાષામાં જવાબ આપો (Hindi or Gujarati).
- જો ગ્રાહક મિશ્રિત ભાષા (Hinglish/Gujlish) બોલે, તો અત્યંત કુદરતી અને માનવીય રીતે વાત કરો.

🧠 આંતરદ્રષ્ટિ અને બુદ્ધિ (Intelligence):
- ફક્ત કિંમત ન જણાવો, જો શક્ય હોય તો ટેસ્ટ કેમ જરૂરી છે તે પણ સમજાવો (Use Expert Insights).
- એકની એક વાત વારંવાર ન દોહરાવો. દર વખતે અલગ શબ્દો વાપરો.
- 'રોબોટ' જેવું ન લાગે તેનું ખાસ ધ્યાન રાખો.

📋 મુખ્ય માહિતી / મુખ્ય માહિતી:
- સમય/સમય: સવારે 7 થી રાતે 9 (રવિવાર: 8 થી 2).
- સ્થળ/સ્થળ: મેઈન રોડ, સ્ટેટ બેંકની સામે.
- હોમ કલેક્શન/હોમ કલેક્શન: ₹50 વધારાનો ચાર્જ, 5 કિમીની અંદર.

💉 કિંમતો (Prices) - હમેશા 'Rupay' શબ્દ વાપરો, 'RS' નહીં:
- CBC: ₹250, શુગર: ₹80, થાઈરોઈડ: ₹550, લિપિડ પ્રોફાઈલ: ₹450.
- લિપિડ પ્રોફાઈલ માટે 12 કલાકનો ઉપવાસ અનિવાર્ય છે.

⚠️ ખાસ સૂચના:
- તબીબી સલાહ (Doctor-level advice) ન આપવી, પણ ટેસ્ટના મહત્વ વિશે ચોક્કસ જણાવવું.
- ટૂંકા પણ અર્થપૂર્ણ જવાબ આપો (2-3 લાઈન).

તમે બુદ્ધિશાળી અને મદદગાર છો. ગ્રાહકને એવું લાગવું જોઈએ કે તેઓ એક નિષ્ણાત સાથે વાત કરી રહ્યા છે.`;

// Query categories for classification
export const queryCategories = {
    REPORT: "Report Status",
    LOCATION: "Location",
    TIMING: "Timing",
    TESTS: "Tests",
    HOME_COLLECTION: "Home Collection",
    PRICING: "Pricing",
    GENERAL: "General",
    OTHER: "Other"
};

// Keywords for category detection
export const categoryKeywords = {
    REPORT: ["रिपोर्ट", "रिजल्ट", "कब मिलेगी", "कब आएगी", "तैयार", "स्टेटस", "result"],
    LOCATION: ["कहाँ", "पता", "एड्रेस", "रास्ता", "दूरी", "कैसे आएं", "लोकेशन", "नक्शा", "address"],
    TIMING: ["समय", "कब खुलता", "कब बंद", "टाइमिंग", "छुट्टी", "रविवार", "शनिवार", "time", "open"],
    TESTS: ["टेस्ट", "जांच", "ब्लड", "शुगर", "थायरॉइड", "यूरिन", "एक्सरे", "CBC", "test"],
    HOME_COLLECTION: ["घर", "होम", "सैंपल कलेक्शन", "घर पर", "आकर लेंगे", "home"],
    PRICING: ["कितने", "पैसे", "रुपये", "price", "cost", "चार्ज", "फीस"]
};
