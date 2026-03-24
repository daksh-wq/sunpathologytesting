// Sarvam AI Speech-to-Text Service
// Uses saaras:v3 model for accurate, low-latency multilingual transcription

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const API_URL = "https://api.sarvam.ai/speech-to-text";

export const transcribeAudio = async (audioBlob) => {
    try {
        const formData = new FormData();
        // Sarvam expects the audio file to be named
        formData.append('file', audioBlob, 'audio.webm');
        
        // Recommended state-of-the-art model
        formData.append('model', 'saaras:v3');

        // Optional parameters: language Code (if known). Not required out-of-the-box for saaras:v3
        // formData.append('prompt', 'Transcribe the audio accurately in its spoken language.');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'api-subscription-key': API_KEY,
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Sarvam STT failed:', errorText);
            throw new Error(`Sarvam STT API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Typical structure from Sarvam.ai saaras:v3 is { transcript: "..." }
        let transcription = data.transcript || "";

        // Fallback filter just in case
        transcription = transcription.trim();

        if (!transcription) {
            throw new Error("Empty or noise-only transcription from Sarvam");
        }

        return transcription;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};
