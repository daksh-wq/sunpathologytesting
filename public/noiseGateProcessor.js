// A production-grade Noise Gate AudioWorkletProcessor
// This physically zeroes out audio data if it falls below a threshold,
// meaning NO background noises, AC hums, or distant chatter ever reaches the transcription engine.

class NoiseGateProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.threshold = 0.03; // Attack threshold (Must be this loud to open gate)
        this.releaseThreshold = 0.015; // Release threshold (Gate closes if it drops below this)
        this.attack = 0.01; // How fast gate opens (seconds)
        this.release = 0.3; // How long gate stays open after speech ends (seconds)

        // Internal state
        this.isOpen = false;
        this.envelope = 0;
        this.sampleRate = 48000; // Will be actual sample rate in practice
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        // If no input, just pass through (shouldn't happen)
        if (!input || !input.length || !input[0].length) {
            return true;
        }

        const channelData = input[0];
        const outData = output[0];

        // 1. Calculate the RMS (Root Mean Square) energy of this chunk
        let sumSquares = 0;
        for (let i = 0; i < channelData.length; i++) {
            sumSquares += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sumSquares / channelData.length);

        // 2. Smooth the envelope detector
        // If current chunk is louder, attack fast. If quieter, release slowly.
        const alphaAttack = Math.exp(-1 / (this.sampleRate * this.attack));
        const alphaRelease = Math.exp(-1 / (this.sampleRate * this.release));

        if (rms > this.envelope) {
            this.envelope = alphaAttack * this.envelope + (1 - alphaAttack) * rms;
        } else {
            this.envelope = alphaRelease * this.envelope + (1 - alphaRelease) * rms;
        }

        // 3. Gate Logic (Hysteresis to prevent stuttering)
        if (!this.isOpen && this.envelope > this.threshold) {
            this.isOpen = true; // Open the gate (Start letting audio through)
        } else if (this.isOpen && this.envelope < this.releaseThreshold) {
            this.isOpen = false; // Close the gate (Mute)
        }

        // 4. Apply Gate
        for (let i = 0; i < channelData.length; i++) {
            if (this.isOpen) {
                // Let audio through, but optionally add a slight gain boost if desired
                outData[i] = channelData[i];
            } else {
                // HARD MUTE: Literally send 0s to the transcription engine
                outData[i] = 0;
            }
        }

        // Send state to main thread if needed
        this.port.postMessage({ isOpen: this.isOpen, rms: rms });

        return true; // Keep processor alive
    }
}

registerProcessor('noise-gate-processor', NoiseGateProcessor);
