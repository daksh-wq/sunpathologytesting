// Training Data Service — localStorage-backed CRUD for custom AI training
// Manages custom instructions and Q&A training pairs that augment the Gemini system prompt.

const STORAGE_KEY_INSTRUCTIONS = 'llm_training_instructions';
const STORAGE_KEY_QA = 'llm_training_qa';

// ── Helpers ──

const loadFromStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// ── Custom Instructions CRUD ──

export const getInstructions = () => loadFromStorage(STORAGE_KEY_INSTRUCTIONS);

export const addInstruction = (text) => {
    if (!text?.trim()) return null;
    const instructions = getInstructions();
    const entry = {
        id: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text: text.trim(),
        enabled: true,
        createdAt: new Date().toISOString(),
    };
    instructions.push(entry);
    saveToStorage(STORAGE_KEY_INSTRUCTIONS, instructions);
    return entry;
};

export const updateInstruction = (id, updates) => {
    const instructions = getInstructions();
    const idx = instructions.findIndex(i => i.id === id);
    if (idx === -1) return null;
    instructions[idx] = { ...instructions[idx], ...updates };
    saveToStorage(STORAGE_KEY_INSTRUCTIONS, instructions);
    return instructions[idx];
};

export const deleteInstruction = (id) => {
    const instructions = getInstructions().filter(i => i.id !== id);
    saveToStorage(STORAGE_KEY_INSTRUCTIONS, instructions);
};

export const toggleInstruction = (id) => {
    const instructions = getInstructions();
    const item = instructions.find(i => i.id === id);
    if (item) {
        item.enabled = !item.enabled;
        saveToStorage(STORAGE_KEY_INSTRUCTIONS, instructions);
    }
};

// ── Q&A Training Pairs CRUD ──

export const getQAPairs = () => loadFromStorage(STORAGE_KEY_QA);

export const addQAPair = (question, answer, category = 'General') => {
    if (!question?.trim() || !answer?.trim()) return null;
    const pairs = getQAPairs();
    const entry = {
        id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || 'General',
        enabled: true,
        createdAt: new Date().toISOString(),
    };
    pairs.push(entry);
    saveToStorage(STORAGE_KEY_QA, pairs);
    return entry;
};

export const updateQAPair = (id, updates) => {
    const pairs = getQAPairs();
    const idx = pairs.findIndex(p => p.id === id);
    if (idx === -1) return null;
    pairs[idx] = { ...pairs[idx], ...updates };
    saveToStorage(STORAGE_KEY_QA, pairs);
    return pairs[idx];
};

export const deleteQAPair = (id) => {
    const pairs = getQAPairs().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEY_QA, pairs);
};

export const toggleQAPair = (id) => {
    const pairs = getQAPairs();
    const item = pairs.find(p => p.id === id);
    if (item) {
        item.enabled = !item.enabled;
        saveToStorage(STORAGE_KEY_QA, pairs);
    }
};

// ── Import / Export ──

export const exportTrainingData = () => {
    return JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        instructions: getInstructions(),
        qaPairs: getQAPairs(),
    }, null, 2);
};

export const importTrainingData = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (!data || data.version !== 1) throw new Error('Invalid training data format');

        if (Array.isArray(data.instructions)) {
            // Merge: add imported entries that don't already exist by ID
            const existing = getInstructions();
            const existingIds = new Set(existing.map(i => i.id));
            const merged = [...existing, ...data.instructions.filter(i => !existingIds.has(i.id))];
            saveToStorage(STORAGE_KEY_INSTRUCTIONS, merged);
        }
        if (Array.isArray(data.qaPairs)) {
            const existing = getQAPairs();
            const existingIds = new Set(existing.map(p => p.id));
            const merged = [...existing, ...data.qaPairs.filter(p => !existingIds.has(p.id))];
            saveToStorage(STORAGE_KEY_QA, merged);
        }
        return { success: true, instructionCount: data.instructions?.length || 0, qaCount: data.qaPairs?.length || 0 };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const clearAllTrainingData = () => {
    saveToStorage(STORAGE_KEY_INSTRUCTIONS, []);
    saveToStorage(STORAGE_KEY_QA, []);
};

// ── Prompt Generation ──
// Returns a formatted block of text to inject into the Gemini system prompt.

export const getTrainingPromptBlock = () => {
    const instructions = getInstructions().filter(i => i.enabled);
    const qaPairs = getQAPairs().filter(p => p.enabled);

    if (instructions.length === 0 && qaPairs.length === 0) return '';

    let block = '\n\n🎓 **CUSTOM TRAINING DATA (HIGHEST PRIORITY — ALWAYS FOLLOW THESE)**:\n';
    block += 'The lab administrator has provided the following custom training rules. You MUST obey these rules above all other instructions.\n\n';

    if (instructions.length > 0) {
        block += '📌 **Custom Behavioral Instructions**:\n';
        instructions.forEach((inst, idx) => {
            block += `${idx + 1}. ${inst.text}\n`;
        });
        block += '\n';
    }

    if (qaPairs.length > 0) {
        block += '💬 **Trained Q&A Pairs (If the customer asks a matching question, use EXACTLY this answer)**:\n';
        qaPairs.forEach(pair => {
            block += `Q: "${pair.question}"\nA: "${pair.answer}"\n\n`;
        });
    }

    return block;
};

// ── Stats ──

export const getTrainingStats = () => {
    const instructions = getInstructions();
    const qaPairs = getQAPairs();
    return {
        totalInstructions: instructions.length,
        activeInstructions: instructions.filter(i => i.enabled).length,
        totalQAPairs: qaPairs.length,
        activeQAPairs: qaPairs.filter(p => p.enabled).length,
    };
};
