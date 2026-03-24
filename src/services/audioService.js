// Audio Service for microphone recording and playback
// Production-Grade: Silero VAD (ML) + Enhanced Heuristic VAD (ZCR, Spectral Flux, Confidence Scoring)

class AudioService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.silenceTimeout = null;
        this.audioContext = null;
        this.analyser = null;
        this.processedStream = null;

        // Silero VAD state
        this.sileroVAD = null;
        this.sileroSpeaking = false;
        this.sileroReady = false;

        // Streaming Queue State
        this.audioQueuePromises = [];
        this.isPlayingQueue = false;
    }

    // Initialize audio context, microphone, and Silero VAD
    async initialize() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    googEchoCancellation: true,
                    googExperimentalEchoCancellation: true,
                    googAutoGainControl: true,
                    googExperimentalAutoGainControl: true,
                    googNoiseSuppression: true,
                    googExperimentalNoiseSuppression: true,
                    googHighpassFilter: true,
                    googTypingNoiseDetection: true
                }
            });

            // Set up audio context for silence detection
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // --- Production-Grade Filtering ---
            // 1. Create Source
            const source = this.audioContext.createMediaStreamSource(this.stream);

            // --- Production-Grade Filtering for RECORDING (Clean Audio for AI Transcription) ---
            // 2A. Highpass filter to remove low-frequency rumbles (wind, AC, desk bumps, street rumble)
            const lowcutFilter = this.audioContext.createBiquadFilter();
            lowcutFilter.type = 'highpass';
            lowcutFilter.frequency.value = 85;

            // 2B. Lowpass filter to remove high-frequency hiss/static/electronic whine
            const highcutFilter = this.audioContext.createBiquadFilter();
            highcutFilter.type = 'lowpass';
            highcutFilter.frequency.value = 5500;

            // 2C. Dynamics Compressor (Normalize volume, push down loud background bumps, lift quiet voices)
            const compressor = this.audioContext.createDynamicsCompressor();
            compressor.threshold.value = -35;
            compressor.knee.value = 12;
            compressor.ratio.value = 4;
            compressor.attack.value = 0.05;
            compressor.release.value = 0.25;

            // 2E. Hard Noise Gate (Custom AudioWorklet)
            // Completely mutes audio below a certain threshold to prevent Gemini from transcribing background TV/Chatter
            try {
                await this.audioContext.audioWorklet.addModule('/noiseGateProcessor.js');
                const noiseGate = new AudioWorkletNode(this.audioContext, 'noise-gate-processor');

                // 2D. Final Output Node for Recording
                const destination = this.audioContext.createMediaStreamDestination();

                // Connect Recording Chain with Noise Gate
                source.connect(lowcutFilter);
                lowcutFilter.connect(highcutFilter);
                highcutFilter.connect(compressor);
                compressor.connect(noiseGate);
                noiseGate.connect(destination);

                // Save processed stream for the MediaRecorder
                this.processedStream = destination.stream;
            } catch (e) {
                console.warn("Could not load Noise Gate Worklet, falling back to standard compressor", e);
                // 2D. Final Output Node for Recording
                const destination = this.audioContext.createMediaStreamDestination();

                // Connect Recording Chain (Fallback without Noise Gate)
                source.connect(lowcutFilter);
                lowcutFilter.connect(highcutFilter);
                highcutFilter.connect(compressor);
                compressor.connect(destination);

                this.processedStream = destination.stream;
            }

            // --- VAD Analysis Filtering (Focus ONLY on exact Voice Band) ---
            const vadBandpassFilter = this.audioContext.createBiquadFilter();
            vadBandpassFilter.type = 'bandpass';
            vadBandpassFilter.frequency.value = 1700; // Center frequency
            vadBandpassFilter.Q.value = 1.0; // Width of the band

            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.4; // Smooth out jitter

            // Connect VAD Chain
            source.connect(vadBandpassFilter);
            vadBandpassFilter.connect(analyser); // Analyze the FILTERED audio

            this.analyser = analyser;

            // 4. Initialize Silero VAD (ML-based, Layer 1)
            await this._initSileroVAD();

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            throw new Error('माइक्रोफोन एक्सेस नहीं मिला। कृपया अनुमति दें।');
        }
    }

    // Initialize Silero VAD - Production ML-based voice activity detection
    async _initSileroVAD() {
        try {
            const vadModule = await import('@ricky0123/vad-web');
            const MicVAD = vadModule.MicVAD;

            this.sileroVAD = await MicVAD.new({
                // Use the user's existing stream for consistency
                stream: this.stream,
                // Speech detection callbacks
                onSpeechStart: () => {
                    this.sileroSpeaking = true;
                    console.log("🧠 Silero VAD: Speech DETECTED");
                },
                onSpeechEnd: () => {
                    this.sileroSpeaking = false;
                    console.log("🧠 Silero VAD: Speech ENDED");
                },
                onVADMisfire: () => {
                    this.sileroSpeaking = false;
                    console.log("🧠 Silero VAD: MISFIRE (too short / noise)");
                },
                // Tuning parameters
                positiveSpeechThreshold: 0.95,  // EXTREMELY High threshold for confident speech
                negativeSpeechThreshold: 0.40,  // Drops out of speech mode very aggressively if voice lowers
                redemptionFrames: 12,           // Tolerate longer pauses/breaths mid-sentence
                minSpeechFrames: 8,             // Require longer sustained speech (prevents short distant shouts)
                preSpeechPadFrames: 5,          // Frames to include before speech starts
            });

            // Start the VAD (it runs independently using AudioWorklet)
            this.sileroVAD.start();
            this.sileroReady = true;
            console.log("✅ Silero VAD initialized and running");
        } catch (error) {
            console.warn("⚠️ Silero VAD failed to initialize, falling back to heuristic-only mode:", error.message);
            this.sileroReady = false;
            // System still works with heuristic-only VAD
        }
    }

    // Start recording audio - Decreased silence threshold for faster replies
    startRecording(onSilenceDetected, silenceThreshold = 800, onSpeechStart = null, safeguardDelay = 1000) {
        if (!this.stream) {
            throw new Error('Audio not initialized');
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try { this.mediaRecorder.stop(); } catch (e) { }
        }
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }

        this.audioChunks = [];
        this.isRecording = true;

        // Use the noise-cleaned processed stream if available, otherwise fallback to raw stream
        const recordingStream = this.processedStream || this.stream;

        this.mediaRecorder = new MediaRecorder(recordingStream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.start(100); // Collect in 100ms chunks

        // Start silence detection
        this.detectSilence(onSilenceDetected, silenceThreshold, onSpeechStart, safeguardDelay);
    }

    // =====================================================================
    // PRODUCTION-GRADE SILENCE / BARGE-IN DETECTION
    // 2-Layer approach: Silero VAD (ML) + Heuristic VAD (ZCR, Flux, Energy)
    // =====================================================================
    detectSilence(onSilenceDetected, threshold, onSpeechStart, safeguardDelay) {
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeDomainData = new Uint8Array(bufferLength);
        let silenceStart = null;
        this._currentIsSpeaking = false;
        this._currentBargeInTriggered = false; // Track if barge-in has fired
        this._currentBargeInCooldownEnd = 0; // Cooldown timer for rejected barge-ins
        this._currentConsecutiveSpeechFrames = 0;
        this._currentAvgConfidence = 0;

        // Safety: Ignore audio for the first 'safeguardDelay' ms (prevent self-echo)
        const recordingStartTime = Date.now();

        // --- Advanced VAD Config ---
        // Frequency range for Human Voice: ~300Hz to 3400Hz
        // FFT Size 512 -> Bin width = 48000 / 512 = ~93.75 Hz
        const VOICE_BIN_START = 3;  // ~280 Hz
        const VOICE_BIN_END = 36;   // ~3375 Hz

        // Dynamic Noise Floor Tracking
        let noiseFloor = 25; // Sensible baseline. Distant sounds won't easily wake it up.
        const NOISE_LEARNING_RATE = 0.05; // Faster adaptation to steady noise

        // Thresholds (relative to noise floor)
        const SPEECH_RATIO = 2.5; // Voice must be 2.5x louder than background
        const BARGE_IN_RATIO = 4.0; // Interruptions must be noticeably loud

        // Temporal Smoothing
        this._currentConsecutiveSpeechFrames = 0;
        let consecutiveSilenceFrames = 0;
        const SPEECH_START_FRAMES = 5;  // ~100ms sustained sound to start speech
        const SPEECH_END_FRAMES = 25;   // ~500ms silence to end speech segment (was 35)

        // --- PRODUCTION: Instant Barge-In ---
        // 7 Frames * ~20ms = ~140ms of CONTINUOUS speech required.
        // Drops/clicks still won't trigger this, but human speech triggers instantly.
        const BARGE_IN_FRAMES = 7;

        // Transient Rejection Logic
        let previousEnergy = 0;

        // --- NEW: Spectral Flux tracking ---
        let previousFrequencyData = new Float32Array(bufferLength);

        // --- NEW: Confidence scoring history ---
        let confidenceHistory = [];
        const CONFIDENCE_WINDOW = 10; // Track last 10 confidence values

        const checkAudio = () => {
            if (!this.isRecording) return;

            // IGNORE all audio during safeguard period or when Bot is speaking (prevent self-interruption from echo)
            if (Date.now() - recordingStartTime < safeguardDelay || this.currentAudio !== null) {
                // If bot is speaking, reset all tracking so it doesn't instantly trigger when done
                if (this.currentAudio !== null) {
                    this._currentConsecutiveSpeechFrames = 0;
                    consecutiveSilenceFrames = 0;
                    confidenceHistory = [];
                    this._currentBargeInTriggered = false;
                    this._currentBargeInCooldownEnd = 0;
                }
                requestAnimationFrame(checkAudio);
                return;
            }

            // Get both frequency and time-domain data
            this.analyser.getByteFrequencyData(frequencyData);
            this.analyser.getByteTimeDomainData(timeDomainData);

            // ============================================================
            // LAYER 1: Silero VAD Gate (ML-based)
            // If Silero is running and says "no speech", reject immediately.
            // This catches ~99% of false triggers from background noise.
            // ============================================================
            if (this.sileroReady && !this.sileroSpeaking) {
                // Silero says no speech — reset counters
                this._currentConsecutiveSpeechFrames = 0;
                confidenceHistory = [];
                this._currentBargeInTriggered = false;

                if (this._currentIsSpeaking) {
                    consecutiveSilenceFrames++;
                    if (consecutiveSilenceFrames >= SPEECH_END_FRAMES) {
                        this._currentIsSpeaking = false; // Speech ended
                        silenceStart = Date.now();

                        // Set timeout for final silence detection (End of Turn)
                        this.silenceTimeout = setTimeout(() => {
                            if (this.isRecording && onSilenceDetected && !this._currentIsSpeaking) {
                                console.log("🛑 Silence Timeout (Silero mode) - Processing Speech");
                                onSilenceDetected();
                            }
                        }, threshold);
                    }
                }

                requestAnimationFrame(checkAudio);
                return;
            }

            // ============================================================
            // LAYER 2: Enhanced Heuristic VAD
            // If Silero approves (or isn't available), run multi-factor analysis
            // ============================================================

            // --- 2A: Energy Analysis (Voice Band Only) ---
            let voiceEnergy = 0;
            for (let i = VOICE_BIN_START; i < VOICE_BIN_END; i++) {
                voiceEnergy += frequencyData[i];
            }
            const averageVoiceEnergy = voiceEnergy / (VOICE_BIN_END - VOICE_BIN_START);

            // --- 2B: Impulse Rejection (The "Bracelet / Click" Fix) ---
            // If energy jumps > 5x instantly, it's likely a mechanical click, not speech.
            const isTransient = (averageVoiceEnergy > 40) && (averageVoiceEnergy > previousEnergy * 5);
            previousEnergy = averageVoiceEnergy;

            if (isTransient) {
                console.log("🚫 Transient Rejected (Click/Pop detected)");
                this._currentConsecutiveSpeechFrames = 0;
                requestAnimationFrame(checkAudio);
                return;
            }

            // --- 2C: Zero-Crossing Rate (ZCR) ---
            // Voiced speech (sustained vowels) has LOW ZCR (0.02-0.25)
            // Noise, clicks, hiss has HIGH ZCR (> 0.4)
            let zeroCrossings = 0;
            for (let i = 1; i < timeDomainData.length; i++) {
                // 128 is the zero-point for unsigned byte audio data
                const prev = timeDomainData[i - 1] - 128;
                const curr = timeDomainData[i] - 128;
                if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
                    zeroCrossings++;
                }
            }
            const zcr = zeroCrossings / (timeDomainData.length - 1);

            // ZCR Score: Best in range 0.02-0.30 (voiced speech)
            let zcrScore;
            if (zcr < 0.02) {
                zcrScore = 0.3; // Very low — likely silence or DC
            } else if (zcr <= 0.30) {
                zcrScore = 1.0; // Ideal voiced speech range
            } else if (zcr <= 0.45) {
                zcrScore = 0.4; // Borderline — could be unvoiced consonants
            } else {
                zcrScore = 0.1; // High ZCR — likely noise / clicks
            }

            // --- 2D: Spectral Flux ---
            // Speech changes gradually; clicks/impacts change instantly
            let spectralFlux = 0;
            for (let i = VOICE_BIN_START; i < VOICE_BIN_END; i++) {
                const diff = frequencyData[i] - previousFrequencyData[i];
                spectralFlux += diff * diff;
            }
            spectralFlux = Math.sqrt(spectralFlux / (VOICE_BIN_END - VOICE_BIN_START));

            // Store current frame for next comparison
            for (let i = 0; i < bufferLength; i++) {
                previousFrequencyData[i] = frequencyData[i];
            }

            // Flux Score: Lower = more speech-like (gradual changes)
            // High flux = transient / impact noise
            let fluxScore;
            if (spectralFlux < 15) {
                fluxScore = 1.0; // Very gradual — strong speech indicator
            } else if (spectralFlux < 30) {
                fluxScore = 0.7; // Moderate — probably speech with emphasis
            } else if (spectralFlux < 60) {
                fluxScore = 0.3; // High — suspicious, could be noise
            } else {
                fluxScore = 0.05; // Extremely high — almost certainly an impact/click
            }

            // --- 2E: Dynamic Noise Floor Update ---
            if (averageVoiceEnergy < noiseFloor * 1.5) {
                noiseFloor = (noiseFloor * (1 - NOISE_LEARNING_RATE)) + (averageVoiceEnergy * NOISE_LEARNING_RATE);
            }
            // Keep bounds realistic so it never requires > 255 volume to detect speech
            noiseFloor = Math.max(20, Math.min(noiseFloor, 45));

            // --- 2F: Energy Score ---
            const currentSpeechThreshold = noiseFloor * SPEECH_RATIO;
            const currentBargeInThreshold = noiseFloor * BARGE_IN_RATIO;

            let energyScore;
            if (averageVoiceEnergy > currentBargeInThreshold) {
                energyScore = 1.0; // Very loud — strong speech
            } else if (averageVoiceEnergy > currentSpeechThreshold) {
                // Linear interpolation between speech and barge-in threshold
                energyScore = 0.4 + 0.6 * ((averageVoiceEnergy - currentSpeechThreshold) / (currentBargeInThreshold - currentSpeechThreshold));
            } else {
                energyScore = 0.0; // Below speech threshold
            }

            // --- 2G: Temporal Score ---
            // Builds up as more consecutive frames qualify
            const temporalScore = Math.min(1.0, this._currentConsecutiveSpeechFrames / BARGE_IN_FRAMES);

            // ============================================================
            // MULTI-FACTOR CONFIDENCE SCORE
            // ============================================================
            const confidence = (energyScore * 0.30) + (zcrScore * 0.25) + (fluxScore * 0.20) + (temporalScore * 0.25);

            // Track confidence history
            confidenceHistory.push(confidence);
            if (confidenceHistory.length > CONFIDENCE_WINDOW) {
                confidenceHistory.shift();
            }

            // Average confidence over window (smoothing)
            this._currentAvgConfidence = confidenceHistory.reduce((a, b) => a + b, 0) / confidenceHistory.length;

            // --- State Machine ---
            // Must beat the relative threshold AND an absolute raw minimum energy (e.g., 75 out of 255)
            // Distant voices typically log very low absolute energy (<40) even if the room is quiet.
            const isLoud = averageVoiceEnergy > currentSpeechThreshold && averageVoiceEnergy > 45;

            if (isLoud && energyScore > 0.45) {
                consecutiveSilenceFrames = 0;
                this._currentConsecutiveSpeechFrames++;

                if (!this._currentIsSpeaking && this._currentConsecutiveSpeechFrames >= SPEECH_START_FRAMES) {
                    // Valid Speech Started
                    this._currentIsSpeaking = true;
                    silenceStart = null;
                    if (this.silenceTimeout) {
                        clearTimeout(this.silenceTimeout);
                        this.silenceTimeout = null;
                    }
                }

                // Evaluate Barge-In trigger while speaking
                if (this._currentIsSpeaking && onSpeechStart && !this._currentBargeInTriggered && Date.now() > this._currentBargeInCooldownEnd) {
                    const bargeInConfidenceThreshold = this._currentConsecutiveSpeechFrames < 10 ? 0.80 : 0.65;

                    if (this._currentConsecutiveSpeechFrames >= BARGE_IN_FRAMES && this._currentAvgConfidence >= bargeInConfidenceThreshold) {
                        console.log(
                            `✅ INSTANT BARGE-IN TRIGGERED | Confidence: ${(this._currentAvgConfidence * 100).toFixed(1)}% | ` +
                            `Energy: ${energyScore.toFixed(2)} | ZCR: ${zcr.toFixed(3)} (${zcrScore.toFixed(2)}) | ` +
                            `Flux: ${spectralFlux.toFixed(1)} (${fluxScore.toFixed(2)}) | ` +
                            `Frames: ${this._currentConsecutiveSpeechFrames} | Silero: ${this.sileroReady ? (this.sileroSpeaking ? 'SPEECH' : 'SILENT') : 'N/A'}`
                        );
                        this._currentBargeInTriggered = true;
                        
                        // Pass exact properties for Multi-Stage verification
                        const currentChunk = this.audioChunks.length > 0 ? new Blob(this.audioChunks, { type: 'audio/webm' }) : null;
                        const speechDuration = this._currentConsecutiveSpeechFrames * (1000 / 60);

                        onSpeechStart({
                            probability: this._currentAvgConfidence,
                            duration: speechDuration,
                            blob: currentChunk
                        });
                    } else if (this._currentConsecutiveSpeechFrames === BARGE_IN_FRAMES && this._currentAvgConfidence < bargeInConfidenceThreshold) {
                        console.log(
                            `🚫 REJECTED (Low Confidence) | Confidence: ${(this._currentAvgConfidence * 100).toFixed(1)}% ` +
                            `(need ${(bargeInConfidenceThreshold * 100).toFixed(0)}%) | ` +
                            `Energy: ${energyScore.toFixed(2)} | ZCR: ${zcr.toFixed(3)} | Flux: ${spectralFlux.toFixed(1)}`
                        );
                    }
                }
            } else {
                // Quiet
                this._currentConsecutiveSpeechFrames = 0;
                confidenceHistory = [];
                // Do not reset bargeInTriggered here until the pipeline fully decides.

                if (this._currentIsSpeaking) {
                    consecutiveSilenceFrames++;
                    if (consecutiveSilenceFrames >= SPEECH_END_FRAMES) {
                        this._currentIsSpeaking = false; // Speech ended
                        silenceStart = Date.now();

                        // Set timeout for final silence detection (End of Turn)
                        this.silenceTimeout = setTimeout(() => {
                            if (this.isRecording && onSilenceDetected && !this._currentIsSpeaking) {
                                console.log("🛑 Silence Timeout - Processing Speech");
                                onSilenceDetected();
                            }
                        }, threshold);
                    }
                }
            }

            requestAnimationFrame(checkAudio);
        };

        checkAudio();
    }

    // Pipeline Helpers for Double Verification
    getCurrentSpeechStatus() {
        const currentChunk = this.audioChunks && this.audioChunks.length > 0 ? new Blob(this.audioChunks, { type: 'audio/webm' }) : null;
        return {
            isSpeaking: this._currentIsSpeaking || false,
            duration: (this._currentConsecutiveSpeechFrames || 0) * (1000 / 60),
            probability: this._currentAvgConfidence || 0,
            blob: currentChunk
        };
    }

    resetBargeInTrigger(cooldownMs = 800) {
        this._currentBargeInTriggered = false;
        this._currentBargeInCooldownEnd = Date.now() + cooldownMs;
    }

    // Stop recording and return audio blob
    async stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.isRecording = false;

            if (this.silenceTimeout) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = null;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    enqueueAudioPromise(promise, onQueueEmpty) {
        this.audioQueuePromises.push(promise);
        // Store callback to notify when queue finishes
        this.onQueueEmpty = onQueueEmpty || this.onQueueEmpty;
        
        if (!this.isPlayingQueue) {
            this.playQueue();
        }
    }

    async playQueue() {
        this.isPlayingQueue = true;
        while (this.audioQueuePromises.length > 0) {
            const nextPromise = this.audioQueuePromises.shift();
            try {
                const audioBlob = await nextPromise;
                // If barge-in happened while waiting for TTS, abort playback
                if (!this.isPlayingQueue) break;
                
                await this.playAudio(audioBlob);
            } catch (err) {
                console.error("Queue playback error", err);
            }
        }
        this.isPlayingQueue = false;
        
        // Notify that the whole stream of chunks finished naturally
        if (this.onQueueEmpty && !this.currentAudio) {
            this.onQueueEmpty();
        }
    }

    // Stop current playback
    stopPlayback() {
        this.audioQueuePromises = []; // Clear pending chunks entirely
        this.isPlayingQueue = false;
        if (this.currentAudio) {
            console.log("🛑 Stopping Playback (Barge-in)");
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            if (this.playAudioResolve) {
                this.playAudioResolve(); // explicitly resolve promise
                this.playAudioResolve = null;
            }
            this.currentAudio = null;
        }
    }

    // Play audio blob
    async playAudio(audioBlob) {
        return new Promise((resolve, reject) => {
            // Stop any existing playback
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.playAudioResolve = resolve;

            // Slightly speed up audio to sound more human-like and upbeat (1.1x)
            audio.playbackRate = 1.1;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                if (this.playAudioResolve) {
                    this.playAudioResolve();
                    this.playAudioResolve = null;
                }
            };

            audio.onerror = (error) => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                this.playAudioResolve = null;
                reject(error);
            };

            audio.play().catch(err => {
                // Handle autoplay block or interruptions
                reject(err);
            });
        });
    }

    // Cleanup resources
    cleanup() {
        this.isRecording = false;

        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.processedStream) {
            this.processedStream.getTracks().forEach(track => track.stop());
            this.processedStream = null;
        }

        // Stop Silero VAD
        if (this.sileroVAD) {
            try {
                this.sileroVAD.pause();
            } catch (e) {
                // Silero may already be stopped
            }
            this.sileroVAD = null;
            this.sileroReady = false;
            this.sileroSpeaking = false;
        }

        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // Get recording state
    getIsRecording() {
        return this.isRecording;
    }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;
