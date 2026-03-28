// api/elevenlabs.js — Secure Vercel serverless proxy for ElevenLabs TTS
// The ELEVENLABS_API_KEY env var is server-side only (no VITE_ prefix) and never sent to the browser.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: missing ELEVENLABS_API_KEY' });
    }

    const { voiceId, text, modelId, voiceSettings } = req.body;

    if (!voiceId || !text) {
        return res.status(400).json({ error: 'Missing required fields: voiceId, text' });
    }

    try {
        const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: modelId || 'eleven_flash_v2_5',
                voice_settings: voiceSettings || {
                    stability: 0.60,
                    similarity_boost: 0.75,
                    style: 0.30,
                    use_speaker_boost: true,
                },
            }),
        });

        if (!upstream.ok) {
            const errorText = await upstream.text();
            console.error('ElevenLabs error:', errorText);
            return res.status(upstream.status).json({ error: 'ElevenLabs API error', details: errorText });
        }

        // Stream audio binary back to client
        const audioBuffer = await upstream.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.byteLength);
        return res.status(200).send(Buffer.from(audioBuffer));
    } catch (err) {
        console.error('ElevenLabs proxy error:', err);
        return res.status(502).json({ error: 'ElevenLabs service unavailable' });
    }
}
