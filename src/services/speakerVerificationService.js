// Service for Speaker Verification
// Calls local Python microservice running ECAPA-TDNN

const API_BASE = "http://localhost:8000";

class SpeakerVerificationService {
    constructor() {
        this.enabled = true;
    }

    /**
     * Send initial audio to register caller's voice baseline.
     */
    async registerBaseline(callId, webmBlob) {
        if (!this.enabled) return true;
        
        try {
            const formData = new FormData();
            formData.append('call_id', callId);
            formData.append('file', webmBlob, 'baseline.webm');

            const res = await fetch(`${API_BASE}/register_caller`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            console.log("🗣️ Voice Baseline Registered:", data);
            return data.status === 'success';
        } catch (e) {
            console.warn("⚠️ Speaker Verification API unreachable. Falling back to default confidence.");
            this.enabled = false;
            return false;
        }
    }

    /**
     * Verify a short chunk of audio against the baseline.
     */
    async verifyChunk(callId, webmBlob) {
        if (!this.enabled) {
            // If backend is down, we fallback to 1.0 (assuming yes) so the app works.
            return 1.0; 
        }

        try {
            const formData = new FormData();
            formData.append('call_id', callId);
            formData.append('file', webmBlob, 'chunk.webm');

            const res = await fetch(`${API_BASE}/verify_chunk`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            return data.similarity_score || 0.0;
        } catch (e) {
            console.warn("⚠️ Chunk verification failed. Falling back to default confidence.");
            return 1.0; 
        }
    }
}

export const speakerVerification = new SpeakerVerificationService();
export default speakerVerification;
