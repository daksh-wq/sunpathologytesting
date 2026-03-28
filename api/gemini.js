// api/gemini.js — Secure Vercel serverless proxy for Gemini API
// GEMINI_API_KEY is server-side only (no VITE_ prefix). Never sent to the browser.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server misconfiguration: missing GEMINI_API_KEY' });
    }

    const { stream: useStream, body } = req.body;

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];

    for (const model of models) {
        const endpoint = useStream
            ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${API_KEY}`
            : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        let upstream;
        try {
            upstream = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (netErr) {
            console.error(`Network error on model ${model}:`, netErr);
            continue;
        }

        if (upstream.status === 404) continue; // model not available, try next
        if (upstream.status === 429) {
            return res.status(429).json({ error: 'Rate limited. Please retry shortly.' });
        }
        if (!upstream.ok) {
            const errData = await upstream.json().catch(() => ({}));
            return res.status(upstream.status).json({ error: errData?.error?.message || 'Gemini error' });
        }

        if (useStream) {
            // Pipe the SSE stream directly back to the client
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = upstream.body.getReader();
            const write = (chunk) => new Promise((resolve) => res.write(chunk, resolve));

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    await write(value);
                }
            } finally {
                res.end();
            }
            return;
        } else {
            const data = await upstream.json();
            return res.status(200).json(data);
        }
    }

    return res.status(502).json({ error: 'All Gemini models unavailable. Please try again.' });
}
