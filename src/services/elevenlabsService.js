// ElevenLabs Text-to-Speech Service
// Uses multilingual voice for natural Hindi and Gujarati speech
import { audioService } from './audioService';

const PROXY_URL = '/api/elevenlabs';

// Voice options for Indian languages
// Arvi - Best for natural Hindi/Gujarati conversations (lively, authentic, desi appeal)
const VOICE_ID_ARVI = "s6cZdgI3j07hf4frz4Q8"; // Arvi - Natural Hindi/Gujarati voice
// Aisha - Good for empathetic conversations
const VOICE_ID_AISHA = "mg9npuuaf8WJphS6E0Rt"; // Aisha - Friendly, empathetic
// Raju - Clear and warm, good for storytelling
const VOICE_ID_RAJU = "ErXwobaYiN019PkySvjV"; // Raju - Clear, natural, warm

// Default voice - Sheetal (Using Aisha - Female/Empathetic voice ID)
const DEFAULT_VOICE_ID = "mg9npuuaf8WJphS6E0Rt"; // Aisha - Friendly, empathetic

// Detect if text is primarily Gujarati
const isGujarati = (text) => {
    // Gujarati Unicode range: \u0A80-\u0AFF
    const gujaratiRegex = /[\u0A80-\u0AFF]/g;
    const gujaratiMatches = text.match(gujaratiRegex) || [];
    // Consider it Gujarati if more than 30% of characters are Gujarati script
    return gujaratiMatches.length > text.length * 0.15;
};

// Convert numbers to English words to prevent TTS engines from mispronouncing digits in mixed-language text
const numberToWords = (num) => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num === 0) return 'zero';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    return num.toString(); // Fallback for very large numbers
};

const preprocessTextForTTS = (text) => {
    // Replace all isolated numbers with their word equivalents
    return text.replace(/\b\d+\b/g, (match) => {
        const num = parseInt(match, 10);
        return numberToWords(num);
    });
};

// Convert text to speech using ElevenLabs with language optimization
export const synthesizeSpeech = async (text, voiceId = DEFAULT_VOICE_ID) => {
    try {
        const processedText = preprocessTextForTTS(text);
        const isGujaratiText = isGujarati(processedText);

        // Use 'eleven_v3' (Alpha) for proper Gujarati support
        // Falling back to 'eleven_flash_v2_5' for other languages
        const modelId = isGujaratiText ? "eleven_v3" : "eleven_flash_v2_5";

        // Add streaming optimization to reduce generation latency even when requesting full blob
        const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        // Optimize voice settings based on language
        // Gujarati needs slightly different settings for clearer pronunciation
        const voiceSettings = isGujaratiText ? {
            stability: 0.50,        // Lower stability for more expressive/varied intonation in Gujarati
            similarity_boost: 0.80,
            style: 0.40,
            use_speaker_boost: true
        } : {
            stability: 0.60,        // Balanced for Hindi
            similarity_boost: 0.75,
            style: 0.30,
            use_speaker_boost: true
        };

        console.log(`TTS: ${isGujaratiText ? 'Gujarati' : 'Hindi'} detected, using model: ${modelId}`);

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voiceId,
                text: processedText,
                modelId,
                voiceSettings,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs proxy error:', errorText);

            // Fallback to multilingual v2 if flash model fails
            if (modelId === "eleven_flash_v2_5") {
                console.log('Retrying with eleven_multilingual_v2...');
                return synthesizeSpeechFallback(processedText, voiceId, voiceSettings);
            }
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        return audioBlob;
    } catch (error) {
        console.error('TTS error:', error);
        throw error;
    }
};

// Fallback synthesis with multilingual v2 model
const synthesizeSpeechFallback = async (text, voiceId, voiceSettings) => {
    // Removed optimize_streaming_latency to ensure full sentence completion
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            voiceId,
            text,
            modelId: 'eleven_multilingual_v2',
            voiceSettings,
        })
    });

    if (!response.ok) {
        throw new Error(`ElevenLabs fallback error: ${response.status}`);
    }

    return await response.blob();
};

// Synthesize and play in one call
export const speakText = async (text) => {
    const audioBlob = await synthesizeSpeech(text);
    await audioService.playAudio(audioBlob);
    return audioBlob;
};
