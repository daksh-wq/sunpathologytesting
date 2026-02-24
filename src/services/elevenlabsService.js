// ElevenLabs Text-to-Speech Service
// Uses multilingual voice for natural Hindi and Gujarati speech
import { audioService } from './audioService';

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Voice options for Indian languages
// Arvi - Best for natural Hindi/Gujarati conversations (lively, authentic, desi appeal)
const VOICE_ID_ARVI = "s6cZdgI3j07hf4frz4Q8"; // Arvi - Natural Hindi/Gujarati voice
// Aisha - Good for empathetic conversations
const VOICE_ID_AISHA = "mg9npuuaf8WJphS6E0Rt"; // Aisha - Friendly, empathetic
// Raju - Clear and warm, good for storytelling
const VOICE_ID_RAJU = "ErXwobaYiN019PkySvjV"; // Raju - Clear, natural, warm

// Default voice - Rachel (Standard pre-made voice that works on Free Tier API)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Detect if text is primarily Gujarati
const isGujarati = (text) => {
    // Gujarati Unicode range: \u0A80-\u0AFF
    const gujaratiRegex = /[\u0A80-\u0AFF]/g;
    const gujaratiMatches = text.match(gujaratiRegex) || [];
    // Consider it Gujarati if more than 30% of characters are Gujarati script
    return gujaratiMatches.length > text.length * 0.15;
};

// Convert text to speech using ElevenLabs with language optimization
export const synthesizeSpeech = async (text, voiceId = DEFAULT_VOICE_ID) => {
    try {
        const isGujaratiText = isGujarati(text);

        // Use 'eleven_v3' (Alpha) for proper Gujarati support
        // Falling back to 'eleven_flash_v2_5' for other languages
        const modelId = isGujaratiText ? "eleven_v3" : "eleven_flash_v2_5";

        // v3 doesn't support optimize_streaming_latency parameter yet
        const latencyParam = modelId === 'eleven_v3' ? '' : '?optimize_streaming_latency=3';
        const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}${latencyParam}`;

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

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: modelId,
                voice_settings: voiceSettings
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs error:', errorText);

            // Fallback to multilingual v2 if flash model fails
            if (modelId === "eleven_flash_v2_5") {
                console.log('Retrying with eleven_multilingual_v2...');
                return synthesizeSpeechFallback(text, voiceId, voiceSettings);
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
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: voiceSettings
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
