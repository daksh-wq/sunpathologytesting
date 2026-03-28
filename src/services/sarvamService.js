// Sarvam AI Speech-to-Text Service
// Calls our own /api/sarvam proxy — no API key is exposed in the browser.

const PROXY_URL = '/api/sarvam';

export const transcribeAudio = async (audioBlob) => {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'saaras:v3');

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            // No Authorization header — the proxy adds the secret key server-side
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Sarvam STT proxy failed:', errorText);
            throw new Error(`Sarvam STT error: ${response.status}`);
        }

        const data = await response.json();
        let transcription = (data.transcript || '').trim();

        if (!transcription) {
            throw new Error('Empty or noise-only transcription from Sarvam');
        }

        return transcription;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};
