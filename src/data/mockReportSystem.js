// Mock Report Status System
// Simulates 15 days of report delivery behavior

// Generate random time within range
const randomTime = (minHour, maxHour) => {
    const hour = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return { hour, minute };
};

// Format time in Hindi
const formatTimeHindi = (hour, minute) => {
    const period = hour < 12 ? "सुबह" : hour < 17 ? "दोपहर" : hour < 20 ? "शाम" : "रात";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const minuteStr = minute === 0 ? "" : `:${minute.toString().padStart(2, '0')}`;
    return `${period} ${displayHour}${minuteStr} बजे`;
};

// Generate mock report statuses for 15 days
const generateMockReports = () => {
    const reports = [];
    const now = new Date();

    const testTypes = [
        { name: "सीबीसी", duration: { min: 4, max: 6 } },
        { name: "शुगर टेस्ट", duration: { min: 2, max: 4 } },
        { name: "थायरॉइड प्रोफाइल", duration: { min: 20, max: 28 } },
        { name: "लिपिड प्रोफाइल", duration: { min: 20, max: 26 } },
        { name: "किडनी फंक्शन", duration: { min: 18, max: 24 } },
        { name: "लिवर फंक्शन", duration: { min: 18, max: 24 } },
        { name: "विटामिन डी", duration: { min: 24, max: 48 } },
        { name: "यूरिन रूटीन", duration: { min: 2, max: 4 } }
    ];

    // Generate reports for last 15 days
    for (let day = 0; day < 15; day++) {
        const numReports = Math.floor(Math.random() * 5) + 3; // 3-7 reports per day

        for (let i = 0; i < numReports; i++) {
            const reportDate = new Date(now);
            reportDate.setDate(reportDate.getDate() - day);

            const test = testTypes[Math.floor(Math.random() * testTypes.length)];
            const collectionTime = randomTime(7, 11);
            const readyTime = randomTime(14, 20);

            reports.push({
                id: `RPT${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
                patientName: generateHindiName(),
                testName: test.name,
                collectionDate: reportDate.toISOString().split('T')[0],
                collectionTime: formatTimeHindi(collectionTime.hour, collectionTime.minute),
                status: day === 0 ? (Math.random() > 0.3 ? "pending" : "ready") : "ready",
                readyTime: formatTimeHindi(readyTime.hour, readyTime.minute),
                deliveredVia: "व्हाट्सएप",
                whatsappSent: day > 0 || Math.random() > 0.5
            });
        }
    }

    return reports;
};

// Generate random Hindi names for mock data
const generateHindiName = () => {
    const firstNames = ["राम", "श्याम", "सीता", "गीता", "राजेश", "सुनीता", "अमित", "प्रिया", "विकास", "अंजली"];
    const lastNames = ["शर्मा", "वर्मा", "सिंह", "गुप्ता", "पटेल", "यादव", "कुमार", "देवी", "जोशी", "त्रिपाठी"];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Mock report database
let mockReports = generateMockReports();

// Get today's pending reports
export const getTodayPendingReports = () => {
    const today = new Date().toISOString().split('T')[0];
    return mockReports.filter(r => r.collectionDate === today && r.status === "pending");
};

// Get report status response (simulated)
export const getReportStatusResponse = () => {
    const responses = [
        {
            ready: true,
            message: "आपकी रिपोर्ट तैयार है और व्हाट्सएप पर भेज दी गई है। कृपया अपना व्हाट्सएप चेक करें।"
        },
        {
            ready: true,
            message: "जी हाँ, आपकी रिपोर्ट तैयार हो गई है। हमने इसे आपके व्हाट्सएप नंबर पर भेज दिया है।"
        },
        {
            ready: false,
            time: formatTimeHindi(...Object.values(randomTime(16, 20))),
            message: null
        },
        {
            ready: false,
            time: formatTimeHindi(...Object.values(randomTime(10, 14))),
            tomorrow: true,
            message: null
        }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    if (!response.ready && !response.message) {
        if (response.tomorrow) {
            response.message = `आपकी रिपोर्ट कल ${response.time} तक व्हाट्सएप पर भेज दी जाएगी।`;
        } else {
            response.message = `आपकी रिपोर्ट आज ${response.time} तक व्हाट्सएप पर भेज दी जाएगी।`;
        }
    }

    return response;
};

// Get delivery time estimate based on test type
export const getDeliveryEstimate = (testKeyword) => {
    const estimates = {
        "सीबीसी": "4 से 6 घंटे में",
        "शुगर": "2 से 3 घंटे में",
        "थायरॉइड": "24 घंटे में",
        "लिपिड": "24 घंटे में",
        "किडनी": "24 घंटे में",
        "लिवर": "24 घंटे में",
        "विटामिन": "24 से 48 घंटे में",
        "यूरिन": "2 से 4 घंटे में",
        "कल्चर": "48 से 72 घंटे में"
    };

    for (const [key, value] of Object.entries(estimates)) {
        if (testKeyword && testKeyword.includes(key)) {
            return value;
        }
    }

    return "24 से 48 घंटे में";
};

export { mockReports };
