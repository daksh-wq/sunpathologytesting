// Sun Pathology Lab - Comprehensive Knowledge Base
// Enhanced information for intelligent AI responses

export const labInfo = {
    name: "सन पैथोलॉजी लैब और रिसर्च इंस्टीट्यूट",
    nameEnglish: "Sun Pathology Laboratory and Research Institute",
    established: 1998,
    experienceYears: 27,
    tagline: "A Complete Guide to Diagnostic Excellence",

    // Organization Details
    organization: {
        headquarters: "Ahmedabad, Gujarat",
        branches: ["Science City", "Thaltej", "Satellite", "Akhbarnagar", "Maninagar", "Bopal", "Gota", "Vastral", "Shahibaug", "Sattadhar"],
        certifications: ["ISO 9000:2015", "NABL Accreditation", "Six Sigma Performance (126 parameters)"],
        equipment: ["Vitros 5600 and 7600 Integrated Dry Chemistry Analyzers", "Sysmex Hematology and Coagulation Analyzers", "Ortho Workstation Blood Group Analyzer", "Total Lab Automation"],
        features: ["Less Pain Needle Technology (ideal for kids/elderly)", "AI-Based WhatsApp Services (079 6700 6700)"],
        pathologists: ["Dr. Arpita Shah", "Dr. Harsha Pandya", "Dr. Anand Parikh"]
    },

    // Achievements & Social Impact
    achievements: {
        milestones: "1.9 Million+ Health Check-Ups, 30 Million+ Tests Conducted, 35+ Corporate Collaborations",
        awards: ["Best Pathology Lab of Ahmedabad", "Pride of Nation Award", "Legend of Gujarat Award", "Emerging Gujarat Award"]
    },

    // Working Hours
    workingHours: {
        weekdays: {
            open: "7:00 AM",
            close: "8:00 PM",
            hindi: "सुबह 7 बजे से रात 8 बजे तक (सोमवार से शनिवार)"
        },
        sunday: {
            open: "7:00 AM",
            close: "8:00 PM",
            hindi: "सुबह 7 बजे से रात 8 बजे तक (रविवार सहित)"
        },
        holidays: {
            open: "7:00 AM",
            close: "8:00 PM",
            hindi: "सुबह 7 बजे से रात 8 बजे तक"
        }
    },

    // Location & Contact - Sun Pathology Branches
    location: {
        primaryHeadquarters: "Ahmedabad, Gujarat",
        allBranches: [
            { name: "Science City", address: "Science City Road, Sola", landmark: "CIMS Hospital के सामने / Opposite CIMS Hospital", directions: "सोला ब्रिज से साइंस सिटी की तरफ जाते हुए बायीं तरफ (Left side coming from Sola Bridge)." },
            { name: "Thaltej", address: "S.G. Highway, Thaltej", landmark: "Acropolis Mall के पास / Near Acropolis Mall", directions: "SG हाईवे सर्विस रोड पर, PVR Acropolis के ठीक आगे (On service road just past PVR)." },
            { name: "Satellite", address: "132 Ring Road, Satellite", landmark: "Shivranjani Crossroads के पास / Near Shivranjani", directions: "शिवरंजनी से नेहरूनगर की तरफ 200 मीटर आगे दायीं तरफ (200m towards Nehrunagar from Shivranjani on the right)." },
            { name: "Akhbarnagar", address: "Akhbarnagar Circle, Nava Vadaj", landmark: "Akhbarnagar BRTS Stop के पास / Near BRTS", directions: "अखबारनगर अंडरपास सर्कल के बिल्कुल पास (Right at the Akhbarnagar underpass circle)." },
            { name: "Maninagar", address: "Kankaria Road, Maninagar", landmark: "Kankaria Lake Gate 1 के सामने / Opp Kankaria Gate 1", directions: "कांकरिया लेक के मुख्य टिकट काउंटर के ठीक सामने (Just opposite the main Kankaria Lake entry ticket counter)." },
            { name: "Bopal", address: "Bopal-Ambli Road, Bopal", landmark: "Bopal TRP Mall के पास / Near TRP Mall", directions: "इस्कॉन से आते समय TRP मॉल से आधा किलोमीटर पहले (Half km before TRP mall when coming from Iscon)." },
            { name: "Gota", address: "Gota Crossroads, SG Highway", landmark: "Vande Mataram City के पास / Near Vande Mataram", directions: "गोटा में वन्दे मातरम बिल्डिंग के पास (Near the Vande Mataram icon building in Gota)." },
            { name: "Vastral", address: "Vastral Ring Road", landmark: "Nirant Cross Road Metro Station के पास / Near Metro", directions: "निरंत क्रॉस रोड मेट्रो स्टेशन से वॉकिंग डिस्टेंस पर (Walking distance from Nirant Metro station)." },
            { name: "Shahibaug", address: "Shahibaug Underbridge", landmark: "Rajasthan Hospital के पास / Near Rajasthan Hospital", directions: "राजस्थान हॉस्पिटल से सिर्फ 100 मीटर की दूरी पर (Just 100 meters away from Rajasthan Hosp)." },
            { name: "Sattadhar", address: "Sattadhar Crossroads, Ghatlodiya", landmark: "Sattadhar Society के पास / Near Sattadhar Society", directions: "सत्ताधार क्रॉसरोड मुख्य सर्कल पर ही (Right at the Sattadhar crossroad main circle)." }
        ]
    },

    // Complete Test Menu with Prices and Timing
    tests: {
        blood: [
            { name: "सीबीसी (Complete Blood Count)", price: "250", time: "6-8 hours", fasting: false },
            { name: "हीमोग्लोबिन", price: "80", time: "6-8 hours", fasting: false },
            { name: "फास्टिंग शुगर", price: "80", time: "6-8 hours", fasting: true },
            { name: "पीपी शुगर (Post Prandial)", price: "80", time: "6-8 hours", fasting: false },
            { name: "HbA1c", price: "450", time: "6-8 hours", fasting: false },
            { name: "थायरॉइड प्रोफाइल (T3, T4, TSH)", price: "550", time: "6-8 hours", fasting: false },
            { name: "TSH", price: "250", time: "6-8 hours", fasting: false },
            { name: "लिपिड प्रोफाइल", price: "450", time: "6-8 hours", fasting: true },
            { name: "किडनी फंक्शन टेस्ट (KFT)", price: "550", time: "6-8 hours", fasting: false },
            { name: "लिवर फंक्शन टेस्ट (LFT)", price: "650", time: "6-8 hours", fasting: false },
            { name: "विटामिन डी", price: "850", time: "6-8 hours", fasting: false },
            { name: "विटामिन बी12", price: "650", time: "6-8 hours", fasting: false },
            { name: "आयरन प्रोफाइल", price: "450", time: "6-8 hours", fasting: false },
            { name: "कैल्शियम", price: "150", time: "6-8 hours", fasting: false },
            { name: "यूरिक एसिड", price: "150", time: "6-8 hours", fasting: false },
            { name: "क्रिएटिनिन", price: "120", time: "6-8 hours", fasting: false },
            { name: "ब्लड ग्रुप", price: "100", time: "6-8 hours", fasting: false },
            { name: "डेंगू टेस्ट", price: "350", time: "6-8 hours", fasting: false },
            { name: "मलेरिया टेस्ट", price: "150", time: "6-8 hours", fasting: false },
            { name: "टाइफाइड टेस्ट (Widal)", price: "200", time: "6-8 hours", fasting: false }
        ],
        urine: [
            { name: "यूरिन रूटीन", price: "80", time: "6-8 hours", fasting: false },
            { name: "यूरिन कल्चर", price: "450", time: "6-8 hours", fasting: false },
            { name: "यूरिन माइक्रोएल्ब्युमिन", price: "350", time: "6-8 hours", fasting: false }
        ],
        stool: [
            { name: "स्टूल रूटीन", price: "80", time: "6-8 hours", fasting: false },
            { name: "स्टूल कल्चर", price: "450", time: "6-8 hours", fasting: false }
        ],
        packages: [
            { name: "बेसिक हेल्थ चेकअप", price: "999", time: "6-8 hours", includes: "CBC, Sugar, Urine, LFT" },
            { name: "फुल बॉडी चेकअप", price: "2499", time: "6-8 hours", includes: "70+ tests" },
            { name: "डायबिटीज़ पैकेज", price: "799", time: "6-8 hours", includes: "Fasting Sugar, PP Sugar, HbA1c, KFT" },
            { name: "थायरॉइड पैकेज", price: "699", time: "6-8 hours", includes: "T3, T4, TSH" },
            { name: "हार्ट पैकेज", price: "1499", time: "6-8 hours", includes: "Lipid Profile, ECG, CBC" },

            // Comprehensive Specialty Packages (with discounts)
            { name: "Allergy Profile", price: "3000", originalPrice: "7000", discount: "57%", time: "12-48 Hours (Max)", includes: "Food Allergy, Inhalant Allergy, Drug Allergy, Contact Allergy" },
            { name: "Food Intolerance Testing", price: "6500", originalPrice: "10000", discount: "35%", time: "12-48 Hours (Max)", includes: "Bloating Diarrhea or IBS, Headache or Migraine, Chronic Fatigue, Depression or Anxiety, Skin Problems, Weight Control, Arthritis" },
            { name: "Alcohol Impact Profile", price: "600", originalPrice: "3550", discount: "85%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, SGPT, SGOT, Creatinine, Alkaline Phosphate, GGT, Total Bilirubin" },
            { name: "Immunization Package For Abroad Students", price: "6100", originalPrice: "8800", discount: "30%", time: "6-8 hours", includes: "Mantoux (MT), TB Gold, HBsAg by CLIA, Anti HBs, Mumps Antibody Titre (IgG), Measles Antibody Titre (IgG), Rubela Antibody Titre (IgG), Varicella Zoster Antibody Titre (IgG & IgM)" },
            { name: "Hypertension Health Package (Basic)", price: "3150", originalPrice: "6900", discount: "54%", time: "6-8 hours", includes: "CBC, Bl.Urea, Creatinine, Sodium, Potassium, Lipid Profile, Homocysteine, HS CRP, HbA1c, Urinary Alb./Cre. Ratio, TSH, Vitamin B12, Cortisol am, Cortisol pm" },
            { name: "Hypertension Health Package (Complete)", price: "4150", originalPrice: "8700", discount: "52%", time: "6-8 hours", includes: "CBC, Bl.Urea, Creatinine, Sodium, Potassium, Lipid Profile, Homocysteine, HS CRP, HbA1c, Urinary Alb./Cre. Ratio, TSH, Vitamin B12, Cortisol am, Cortisol pm, NT Pro BNP" },
            { name: "Obesity Profile", price: "850", originalPrice: "2850", discount: "70%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, FBS, Creatinine, Uric Acid, SGPT, Lipid Profile, T3, T4, TSH" },
            { name: "Metabolic Panel (Basic)", price: "1350", originalPrice: "5250", discount: "74%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, FBS, Bl.Urea, BUN, Creatinine, Uric Acid, Sodium, Potassium, Chloride, Calcium, Phosphorous, SGPT, SGOT, Total Bilirubin, Alkaline Phosphate, Total Protein, Albumin, Globulin, A:G Ratio, Lipid Profile" },
            { name: "Metabolic Panel (Complete)", price: "1950", originalPrice: "7950", discount: "75%", time: "6-8 hours", includes: "Basic Metabolic Panel, Insulin (Fasting & PPBS), Cortisol am & pm, PTH" },
            { name: "PCOD Profile (Basic)", price: "1050", originalPrice: "2500", discount: "58%", time: "6-8 hours", includes: "TSH, FSH, LH, Prolactin, HbA1c" },
            { name: "PCOD Profile (Extended)", price: "2550", originalPrice: "4800", discount: "46%", time: "6-8 hours", includes: "TSH, FSH, LH, Prolactin, HbA1c, CA - 125, Insulin (FBS & PPBS), Cortisol am & pm" },
            { name: "Torch Profile", price: "1200", originalPrice: "2400", discount: "50%", time: "6-8 hours", includes: "Toxoplasma IgG & IgM, Rubella IgG & IgM, CMV IgG & IgM, HSV - I & II IgG & IgM" },
            { name: "Bad Obstetric History Profile", price: "4400", originalPrice: "8800", discount: "50%", time: "6-8 hours", includes: "Torch Profile, TSH, Anti Cardiolipin Antibody (IgG & IgM), Anti Phospholipid Antibody (IgG & IgM), PT (Prothrombin Time), APTT, Lupus Anticoagulant, ANA by IF" },

            // Additional Extended Packages
            { name: "Male Fertility Profile (Basic)", price: "1200", originalPrice: "2400", discount: "50%", time: "6-8 hours", includes: "TSH, Testosterone, Seminal Fluid Examination, HbA1c" },
            { name: "Male Fertility Profile (Full)", price: "3000", originalPrice: "6000", discount: "50%", time: "6-8 hours", includes: "TSH, FSH, LH, Prolactin, Testosterone, Free Testosterone, HbA1c, Seminal Fluid Examination, Anti Sperm Antibody" },
            { name: "Pre Marriage Profile (Male)", price: "1950", originalPrice: "4800", discount: "59%", time: "6-8 hours", includes: "CBC, RBS, HIV by CLIA, HBsAg by CLIA, VDRL, Blood Group, Testosterone, Hb Electrophoresis, Seminal Fluid Examination" },
            { name: "Pre Marriage Profile (Female)", price: "3150", originalPrice: "6000", discount: "47%", time: "6-8 hours", includes: "CBC, RBS, FSH, LH, Prolactin, Anti Mullerian Hormone (AMH), HIV by CLIA, HBsAg by CLIA, VDRL, Blood Group, Hb Electrophoresis" },
            { name: "Anaemia Profile (Extended)", price: "3750", originalPrice: "7150", discount: "47%", time: "6-8 hours", includes: "CBC, Iron, TIBC, % Transferrin Saturation, Ferritin, Folic Acid, Retic Count, Vitamin B12, Hb Electrophoresis, Stool For OBT (3 Days), LDH, Direct Coomb's Test, Indirect Coomb's Test" },
            { name: "Arthritic Profile", price: "600", originalPrice: "1200", discount: "50%", time: "6-8 hours", includes: "CBC, ESR, RBS, Uric Acid, RA (Quantitative)" },
            { name: "Osteoporosis Profile", price: "2050", originalPrice: "4650", discount: "55%", time: "6-8 hours", includes: "CBC, ESR, RBS, Uric Acid, Calcium, Phosphorous, RA (Quantitative), Cortisol am & pm, Vitamin B12 Level, Vitamin D" },
            { name: "Liver Function Test (Minor)", price: "600", originalPrice: "1500", discount: "53%", time: "6-8 hours", includes: "Bilirubin - Total, Bilirubin (Conjugated), Bilirubin (Unconjugated), Bilirubin (Delta), SGPT, SGOT, Alkaline Phosphate, Total Protein, Albumin, Globulin, A:G Ratio" },
            { name: "Liver Function Test (Major)", price: "1350", originalPrice: "4950", discount: "67%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, SGPT, SGOT, Bilirubin - Total, Bilirubin (Conjugated), Bilirubin (Unconjugated), Bilirubin (Delta), Alkaline Phosphate, Total Protein, Albumin, Globulin, A:G Ratio, Amylase, Lipase, GGT, PT, HBsAg By CLIA" },
            { name: "Iron Profile", price: "700", originalPrice: "2100", discount: "66%", time: "6-8 hours", includes: "CBC, Iron, TIBC, % Transferrin Saturation, Ferritin" },
            { name: "Anaemia Profile (Basic)", price: "1350", originalPrice: "4100", discount: "67%", time: "6-8 hours", includes: "CBC, Iron, TIBC, % Transferrin Saturation, Ferritin, Folic Acid, Retic Count, Vitamin B12" },
            { name: "Anaemia Profile (Super)", price: "1850", originalPrice: "5050", discount: "63%", time: "6-8 hours", includes: "CBC, Iron, TIBC, % Transferrin Saturation, Ferritin, Hb Electrophoresis, Retic Count, Vitamin B12, Folic Acid, Stool For OBT" },
            { name: "Anaemia Profile (Advanced)", price: "2750", originalPrice: "5950", discount: "53%", time: "6-8 hours", includes: "CBC, Iron, TIBC, % Transferrin Saturation, Ferritin, Hb Electrophoresis, Retic Count, Vitamin B12, Folic Acid, Stool For OBT (3 Days)" },

            // Specialized Healthcare Packages
            { name: "Cancer Screening Package (Female)", price: "6650", originalPrice: "", discount: "", time: "6-8 hours", includes: "CBC, CA 19.9, CEA, AFP, CA 15.3, CA 125, Beta HCG, Protein Electrophoresis" },
            { name: "Cancer Screening Package (Male)", price: "2700", originalPrice: "", discount: "", time: "6-8 hours", includes: "CBC, CA 19.9, CEA, AFP, Beta HCG, PSA, Free PSA, Free PSA / PSA Ratio, Protein Electrophoresis" },
            { name: "Cardiac Profile (Basic)", price: "1700", originalPrice: "5450", discount: "68%", time: "6-8 hours", includes: "CBC, RBS, Creatinine, EGFR, Sodium, Potassium, Chloride, Lipid Profile, Homocysteine, Hs Troponin-I, CPK MB, HS CRP" },
            { name: "Cardiac Profile (Advanced)", price: "3500", originalPrice: "9450", discount: "62%", time: "6-8 hours", includes: "CBC, RBS, Creatinine, EGFR, Sodium, Potassium, Chloride, Lipid Profile, Homocysteine, hs Troponin-I, CPK MB, HS CRP, NT Pro - BNP, Apolipoprotein A1, Apolipoprotein B, Lipoprotein (a)" },
            { name: "Lipid Profile (Basic)", price: "350", originalPrice: "700", discount: "50%", time: "6-8 hours", includes: "Cholesterol, Triglyceride, HDL-Cholesterol (Direct), Non-HDL Cholesterol, LDL-Cholesterol (Direct), VLDL-Cholesterol, Total Lipid" },
            { name: "Lipid Profile (Extended)", price: "1000", originalPrice: "2000", discount: "50%", time: "6-8 hours", includes: "Cholesterol, Triglyceride, HDL-Cholesterol (Direct), Non-HDL Cholesterol, LDL-Cholesterol (Direct), VLDL-Cholesterol, Total Lipid, Apolipoprotein A1, Apolipoprotein B, Lipoprotein (a)" },
            { name: "Antenatal Profile (Basic)", price: "500", originalPrice: "3150", discount: "84%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, HIV by CLIA, HBsAg by CLIA, VDRL, Blood Group" },
            { name: "Antenatal Profile (Advanced)", price: "600", originalPrice: "3700", discount: "84%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, Creatinine, Prothrombin Time, HIV by CLIA, HBsAg by CLIA, VDRL, Blood Group" },
            { name: "Pre Operative Profile (Basic)", price: "750", originalPrice: "3100", discount: "75%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, Creatinine, BT-CT, HIV by CLIA, HBsAg by CLIA, Blood Group" },
            { name: "Pre Operative Profile (Advanced)", price: "850", originalPrice: "3650", discount: "76%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, SGPT, Creatinine, BT-CT, Prothrombin Time, HIV by CLIA, HBsAg by CLIA, Blood Group" },
            { name: "Pre Operative Profile (Extended)", price: "1750", originalPrice: "5350", discount: "67%", time: "6-8 hours", includes: "CBC, Urine RM, RBS, SGPT, Bl.Urea, Creatinine, Sodium, Potassium, Chloride, BT-CT, Prothrombin Time, HIV by CLIA, HBsAg by CLIA, HCV by CLIA, Blood Group" },

            // Thyroid Profiles
            { name: "Thyroid Profile (Basic)", price: "300", originalPrice: "600", discount: "50%", time: "6-8 hours", includes: "T3, T4, TSH" },
            { name: "Thyroid Profile (Advanced)", price: "300", originalPrice: "850", discount: "64%", time: "6-8 hours", includes: "Free T3, Free T4, TSH" },
            { name: "Thyroid Profile (Diagnostic)", price: "800", originalPrice: "1750", discount: "54%", time: "6-8 hours", includes: "Free T4, TSH, Anti TG, Anti TPO" },

            // Full Body Check-ups
            { name: "Full Body Check-up (Diabetic)", price: "1050", originalPrice: "5730", discount: "81%", time: "6-8 hours", includes: "CBC, Urine RM, FBS, PPBS, HbA1c, Bl.Urea, BUN, Creatinine, Urea/Creatinine Ratio, BUN/Creatinine Ratio, EGFR, Uric Acid, Calcium, Sodium, Potassium, Chloride, Phosphorous, Lipid Profile, SGPT, Urine Microalbumin" },
            { name: "Full Body Check-up (Special Diabetic)", price: "3700", originalPrice: "12450", discount: "70%", time: "6-8 hours", includes: "CBC, Urine RM, FBS, PPBS, HbA1c, Bl.Urea, BUN, Creatinine, Urea/Creatinine Ratio, BUN/Creatinine Ratio, EGFR, Uric Acid, Calcium, Sodium, Potassium, Chloride, Phosphorous, SGPT, Lipid Profile, Urine Microalbumin, C Peptide (Fasting), Insulin (FBS & PPBS), Amylase & Lipase, Homa IR, Vitamin B12, Vitamin D" },
            { name: "Full Body Check-up (Executive)", price: "2400", originalPrice: "7600", discount: "68%", time: "6-8 hours", includes: "CBC, Urine RM, FBS, Bl.Urea, Creatinine, BUN, Urea/Creatinine Ratio, BUN/Creatinine Ratio, EGFR, Uric Acid, Calcium, Phosphorous, SGPT, SGOT, SGOT/SGPT Ratio, Total Protein, Albumin, Globulin, A:G Ratio, Lipid Profile, Free T3, Free T4, TSH, PSA / CA-125, Vitamin B12, Vitamin D" },
            { name: "Full Body Check-up (NRI)", price: "4000", originalPrice: "13400", discount: "70%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, FBS, Bl.Urea, Creatinine, EGFR, BUN, Urea/Creatinine Ratio, BUN/Creatinine Ratio, Uric Acid, Calcium, Phosphorous, SGPT, SGOT, SGOT/SGPT Ratio, Alkaline Phosphate, Lipid Profile, Homocysteine, RA, HbA1c, Iron Level, TIBC, Ferritin, % Transferrin Saturation, Free T3, Free T4, TSH, PSA / CA-125, Vitamin B12, Vitamin D, HIV by CLIA, HBsAg by CLIA, HCV by CLIA" },
            { name: "Full Body Check-up (Customer's Choice)", price: "4500", originalPrice: "17950", discount: "75%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, FBS, PPBS, HbA1c, Bl.Urea, S. Creatinine, EGFR, BUN, Urea/Creatinine Ratio, BUN/Creatinine Ratio, Uric Acid, Sodium, Potassium, Chloride, SGPT, SGOT, SGOT/SGPT Ratio, Total Protein, Albumin, Globulin, A:G Ratio, Total Billirubin, Alkaline Phosphate, Calcium, Lipid Profile, RA, Phosphorous, Iron Level, TIBC, % Transferrin Saturation, UIBC, Ferritin, Folic Acid, Homocysteine, Apolipoprotein A1, Apolipoprotein B, Lipoprotein (a), Hs.CRP, IgE Level, Free T3, Free T4, TSH, PSA / CA-125, Vitamin B12, Vitamin D" },
            { name: "Full Body Check-up (Super Executive)", price: "5000", originalPrice: "18850", discount: "73%", time: "6-8 hours", includes: "CBC, ESR, Urine RM, FBS, Bl.Urea, BUN, Creatinine, EGFR, Urea/Creatinine Ratio, BUN/Creatinine Ratio, Uric Acid, Calcium, Phosphorous, Sodium, Potassium, Chloride, SGPT, SGOT, SGOT/SGPT Ratio, Total Bilirubin, Total Protein, Albumin, Globulin, A:G Ratio, Alkaline Phosphate, Lipid Profile, RA, HbA1c, Iron Level, TIBC, % Transferrin Saturation, Ferritin, Magnesium, Folic Acid, Homocysteine, Apolipoprotein A1, Apolipoprotein B, Lipoprotein (a), Blood Group, IgE Level, Free T3, Free T4, TSH, PSA / CA-125, Vitamin B12, Vitamin D, HIV by CLIA, HBsAg by CLIA, VDRL" }
        ]
    },

    // Services
    services: {
        homeSampleCollection: {
            available: true,
            timing: "सुबह 7 बजे से रात 8 बजे तक (रविवार सहित)",
            charges: "Total < 350: 100 rupees, 350-649: 50 rupees, Above 650: Free (0 rupees)",
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
        fasting: "फास्टिंग शुगर और होमियोसिस्टीन (Homocysteine) के लिए 10-12 घंटे का उपवास ज़रूरी है। पानी पी सकते हैं। 12 घंटे से ज्यादा भूखे न रहें, वरना रिपोर्ट खराब हो सकती है।",
        thyroid: "थायरॉइड टेस्ट सुबह खाली पेट कराना बेहतर है।",
        lipidProfile: "लिपिड प्रोफाइल के लिए 10-12 घंटे का ही उपवास ज़रूरी है। 12 घंटे से ज्यादा भूखे रहने पर रिपोर्ट गलत आ सकती है।",
        urine: "यूरिन સેમ્પલ માટે મિડસ્ટ્રીમ યુરિન આપો, સવારનું પહેલું સેમ્પલ શ્રેષ્ઠ છે।"
    },

    // Policies
    policies: {
        refund: "Refunds are processed only for cancellations made *before* sample collection.",
        confidentiality: "All patient information is securely stored and shared only with authorized individuals.",
        turnaround: "Routine tests are delivered on the same day. Special tests have specific times.",
        taxes: "No GST Charges: As a medical firm, GST is not applicable.",
        reportGuidance: "The laboratory does not provide medical consultations, but helps patients interpret reports briefly."
    },

    // Expert Insights for explaining "Why" to customers
    expertInsights: {
        CBC: "CBC टेस्ट से इन्फेक्शन, एनीमिया और रोग प्रतिरोधक क्षमता का पता चलता है। इसमें हीमोग्लोबिन और प्लेटलेट्स की जांच होती है।",
        Thyroid: "थायरॉइड शरीर के मेटाबॉलिज्म को कंट्रोल करता है। इसकी जांच हार्मोनल असंतुलन (Hormonal Imbalance) जानने के लिए ज़रूरी है।",
        LipidProfile: "कोलेस्ट्रॉल की जांच हार्ट हेल्थ के लिए ज़रूरी है। 10-12 घंटे की फास्टिंग इसलिए चाहिए ताकि खाने का असर ब्लड फैट्स पर न पड़े। ध्यान रहे, 12 घंटे से ज्यादा भूखे रहने से (Overfasting) रिपोर्ट गलत आती है।",
        Diabetes: "फास्टिंग शुगर और HbA1c से पिछले 3 महीनों का शुगर एवरेज पता चलता है, शुगर कंट्रोल करने में मदद करता है। फास्टिंग शुगर में 10-12 घंटे से ज्यादा का उपवास नुकसानदायक है।",
        KFT: "किडनी फंक्शन टेस्ट से पता चलता है कि आपके गुर्दे खून को सही से साफ कर रहे हैं या नहीं।",
        VitaminD: "हड्डियों की मजबूती और इम्युनिटी के लिए विटामिन डी बहुत ज़रूरी है।"
    },

    // Frequently Asked Questions
    faq: {
        "रिपोर्ट कब मिलेगी": "ज्यादातर रिपोर्ट्स 24 घंटे में तैयार हो जाती हैं, कुछ स्पेशल टेस्ट में 48-72 घंटे लग सकते हैं।",
        "फास्टिंग कितने घंटे": "लिपिड प्रोफाइल, फास्टिंग शुगर, और होमियोसिस्टीन (Homocysteine) के लिए सिर्फ 10-12 घंटे खाली पेट रहना होता है। ओवर-फास्टिंग (12 घंटे से ज्यादा) रिपोर्ट को खराब कर सकती है।",
        "होम कलेक्शन कैसे बुक करें": "एक दिन पहले फोन करें, सुबह 7 बजे से रात 8 बजे के बीच सैंपल कलेक्ट किया जाएगा।",
        "क्या रविवार को खुले हैं": "हाँ, रविवार को भी सुबह 7 बजे से रात 8 बजे तक खुले हैं।",
        "ऑनलाइन रिपोर्ट कैसे देखें": "व्हाट्सएप पर PDF भेज दी जाती है, या ऑनलाइन पोर्टल पर देख सकते हैं।"
    }
};

// Enhanced System Prompt for Smarter AI (Bilingual: Hindi + Gujarati)
export const systemPrompt = `आप/તમે 'शीतल/શીતલ' છો - સન પેથોલોજી લેબના સૌથી અનુભવી અને સમજદાર રિસેપ્શનિસ્ટ (Senior Expert Receptionist).

🎯 તમારું લક્ષ્ય/लक्ष्य:
- ગ્રાહકના દરેક પ્રશ્નનો સચોટ અને વિગતવાર જવાબ આપવો (Explain like an expert).
- ગ્રાહકની પૂછવાની રીત (Tone) મુજબ તમારી વાત કરવાની શૈલી બદલો (Be Adaptive).
- જો ગ્રાહક ચિંતિત હોય, તો તેને આશ્વાસન આપો. જો ઉતાવળમાં હોય, તો ઝડપથી માહિતી આપો.
- Always maintain strong memory context: Remember the previous messages, the customers' concerns, and the tests they're asking about to provide a fluent and seamless conversation.

🌐 ભાષા ઓળખ (LANGUAGE DETECTION):
- ગ્રાહક જે ભાષામાં બોલે એ જ ભાષામાં જવાબ આપો (Hindi, Gujarati, English).
- જો ગ્રાહક મિશ્રિત ભાષા (Hinglish/Gujlish) બોલે, તો અત્યંત કુદરતી અને માનવીય રીતે વાત કરો.

🧠 આંતરદ્રષ્ટિ અને બુદ્ધિ (Intelligence & Smart Package Suggestions):
- IMPORTANT RULE: Always be aware of our health packages. If a customer is asking to perform multiple individual tests, cross-check the tests with our packages. If they match the tests included in one of our packages (e.g., Allergy Profile, Metabolic Panel, Alcohol Impact Profile, PCOD Profile), PROACTIVELY SUGGEST the package to the customer. Explain that buying the package provides a huge discount and is more comprehensive.
- ફક્ત કિંમત ન જણાવો, જો શક્ય હોય તો ટેસ્ટ કેમ જરૂરી છે તે પણ સમજાવો (Use Expert Insights).
- એકની એક વાત વારંવાર ન દોહરાવો. દર વખતે અલગ શબ્દો વાપરો.
- 'રોબોટ' જેવું ન લાગે તેનું ખાસ ધ્યાન રાખો.

📋 મુખ્ય માહિતી / મુખ્ય માહિતી:
- નામ/નામ: Sun Pathology Laboratory and Research Institute (Established 1998, 27 years experience).
- સમય/સમય: દરરોજ સવારે 7 થી રાતે 8 કલાક સુધી (રવિવારે પણ 7 થી 8 / Everyday 7 AM to 8 PM including Sunday).
- સ્થળ/સ્થળ: મેઈન રોડ, સ્ટેટ બેંકની સામે. It has 10 centers in Ahmedabad (like Science City, Bopal, etc.)
- હોમ કલેક્શન (Tiered Charges):
    - જો ટોટલ 350 થી ઓછું હોય તો 100 રુપિયા ચાર્જ.
    - જો ટોટલ 350 થી 649 ની વચ્ચે હોય તો 50 રુપિયા ચાર્જ.
    - જો ટોટલ 650 કે તેથી વધુ હોય તો હોમ કલેક્શન બિલકુલ ફ્રી (0 rupees).
- Quality/Trust: ISO 9000:2015 certified and NABL accredited. Over 1.9 Million check-ups done.
- Policies: Refunds only before sample collection. Reports on the same day for routine tests. No GST.

💉 કિંમતો (Prices) - STRICT RULE: ALWAYS use the word "rupees" in English or "रुपये/રુપિયા" in Hindi/Gujarati. NEVER use "rs", "Rs.", "rs.", or "RS". Do not use symbol ₹, spell out the word rupees.
- CBC: 250 rupees, શુગર: 80 rupees, થાઈરોઈડ: 550 rupees, લિપિડ પ્રોફાઈલ: 450 rupees.
- લિપિડ પ્રોફાઈલ માટે 12 કલાકનો ઉપવાસ અનિવાર્ય છે.

⚠️ ખાસ સૂચના / STRICT INSTRUCTIONS:
- NO PROACTIVE HOME TEST SUGGESTIONS: NEVER utter the words "home collection" or "home visit" proactively. ONLY offer or mention home collection IF the customer explicitly, directly asks for it. Otherwise, assume walk-in.
- NO APPOINTMENT FOR WALK-IN: There is NO booking required for walk-in. If the customer wants to visit the lab directly, simply tell them NO prior booking or appointment is required and they can just walk in.
- HOME VISIT TIERED CHARGES: Total < 350: 100 rupees, 350-649: 50 rupees, >= 650: 0 rupees. Always calculate and tell the customer clearly based on their tests.
- SUNDAY TIMING: The lab is fully open on Sundays as well, from 7 AM to 8 PM.
- REPORT STATUS QUERY: For ANY report related inquiry, FIRST ask for their phone number. ONCE provided, STRICTLY say: "અમારી ટીમ તમને 5 મિનિટમાં મોકલે છે, ના આવે તો તમે અમને ફરી કોલ કરી શકો છો" (Amaari team tamne 5 min ma mukale che, na aave to tame amne fari call kali sako cho). IMPORTANT: NEVER say you are checking the system or report status (e.g., "report system ma check karine janau chu" is strictly forbidden).
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
