// api/sarvam.js — Secure Vercel serverless proxy for Sarvam AI Speech-to-Text
// The SARVAM_API_KEY env var is server-side only (no VITE_ prefix) and never sent to the browser.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.SARVAM_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: missing SARVAM_API_KEY' });
    }

    // The client sends a multipart/form-data body with the audio file.
    // We need to forward it as-is to Sarvam with our secret key injected in the header.
    // Vercel parses the body by default; we need raw passthrough.
    // Strategy: read raw body and forward with Content-Type from client.

    try {
        // Collect raw body chunks
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks);

        const upstream = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
                'api-subscription-key': API_KEY,
                'Content-Type': req.headers['content-type'], // forward multipart boundary
            },
            body: rawBody,
        });

        const data = await upstream.json();

        if (!upstream.ok) {
            console.error('Sarvam error:', data);
            return res.status(upstream.status).json({ error: 'Sarvam STT error', details: data });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error('Sarvam proxy error:', err);
        return res.status(502).json({ error: 'Sarvam service unavailable' });
    }
}

// Disable Vercel's body parsing so we get the raw multipart stream
export const config = {
    api: { bodyParser: false },
};
