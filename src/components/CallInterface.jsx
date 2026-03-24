// Call Interface - Professional UI with SVG icons
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCall } from '../context/CallContext';
import { audioService } from '../services/audioService';
import { generateResponseStream } from '../services/geminiService';
import { transcribeAudio } from '../services/sarvamService';
import { synthesizeSpeech } from '../services/elevenlabsService';
import { speakerVerification } from '../services/speakerVerificationService';

// SVG Icons
const PhoneIcon = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

const PhoneOffIcon = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
)

const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
)

const LoaderIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
)

const VolumeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
)

const UserIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const BotIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
)

const AlertIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

// Welcome message - Sheetal introduces herself
const WELCOME_MESSAGE = "નમસ્તે, સન પેથોલોજી લેબમાં તમારું સ્વાગત છે. હું શીતલ છું, હું તમારી કેવી રીતે મદદ કરી શકું?";

function CallInterface() {
    const {
        callState,
        currentCall,
        transcript,
        aiStatus,
        startCall,
        addMessage,
        endCall,
        activateCall,
        updateAiStatus,
        setCallState
    } = useCall();

    const [error, setError] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isReported, setIsReported] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [baselineRegistered, setBaselineRegistered] = useState(false);
    const transcriptRef = useRef(null);
    const latestTranscriptRef = useRef(transcript); // Track latest transcript for closures
    const timerRef = useRef(null);
    const welcomeAudioRef = useRef(null);

    // Pre-load welcome audio for instant start
    useEffect(() => {
        const preloadWelcome = async () => {
            try {
                const blob = await synthesizeSpeech(WELCOME_MESSAGE);
                welcomeAudioRef.current = blob;
            } catch (err) {
                console.error("Failed to preload welcome audio:", err);
            }
        };
        preloadWelcome();
    }, []);

    // Auto-scroll transcript
    // Sync ref with transcript state
    useEffect(() => {
        latestTranscriptRef.current = transcript;
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    // Call duration timer
    useEffect(() => {
        if (callState === 'active' && currentCall) {
            timerRef.current = setInterval(() => {
                const start = new Date(currentCall.startTime);
                const now = new Date();
                setCallDuration(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setCallDuration(0);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [callState, currentCall]);

    // Format duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper: Play complete response (Used for welcome fallback)
    const playResponse = async (text) => {
        try {
            const audioBlob = await synthesizeSpeech(text);
            startListening();
            updateAiStatus('speaking');
            audioService.enqueueAudioPromise(Promise.resolve(audioBlob), () => {
                updateAiStatus('listening');
            });
        } catch (err) {
            console.warn('Playback interrupted or failed:', err);
            updateAiStatus('listening');
        }
    };

    // Handle starting a call
    const handleStartCall = async () => {
        try {
            setError(null);
            setIsReported(false);
            setBaselineRegistered(false); // Reset for new call
            startCall();

            // Initialize audio
            await audioService.initialize();
            setCallState('active');

            // Play welcome message WITHOUT barge-in (Intro must complete)
            updateAiStatus('speaking');
            await addMessage('ai', WELCOME_MESSAGE);
            activateCall();

            // Play pre-loaded or fresh audio
            if (welcomeAudioRef.current) {
                startListening(); // Open mic for barge in during welcome message!
                updateAiStatus('speaking');
                audioService.enqueueAudioPromise(Promise.resolve(welcomeAudioRef.current), () => {
                    updateAiStatus('listening');
                });
            } else {
                await playResponse(WELCOME_MESSAGE);
            }

        } catch (err) {
            console.error('Call start error:', err);
            setError(err.message || 'Failed to start call. Please check microphone permissions.');
            setCallState('idle');
        }
    };

    // Start listening for user speech (Manual trigger or retry)
    const startListening = useCallback(() => {
        // We set status to listening initially, but if we are playing response, 
        // the playResponse function will override this to 'speaking' shortly after.
        // If this is a standalone listen (retry), it stays 'listening'.
        if (aiStatus !== 'speaking') {
            updateAiStatus('listening');
        }

        // Handle Barge-in: User starts speaking while bot is talking
        const handleSpeechStart = async (bargeInData) => {
            if (aiStatus === 'speaking' || audioService.currentAudio || audioService.isPlayingQueue || audioService.audioQueuePromises.length > 0) {
                if (!bargeInData) {
                    console.log("Legacy Barge-in detected! Stopping playback.");
                    audioService.stopPlayback();
                    updateAiStatus('listening');
                    return;
                }

                console.log(`🔍 Barge-in Phase 1: Prob: ${bargeInData.probability.toFixed(2)}`);

                let similarity1 = 1.0;
                // Only verify if baseline was already registered
                if (bargeInData.blob && currentCall && currentCall.id) {
                    similarity1 = await speakerVerification.verifyChunk(currentCall.id, bargeInData.blob);
                }

                if (similarity1 < 0.3) { // Fast fail for completely wrong speaker
                    console.log("🚫 Barge-in rejected Phase 1. Wrong speaker.");
                    audioService.resetBargeInTrigger(); 
                    return;
                }

                // Wait 200ms for Phase 2 Verification
                await new Promise(r => setTimeout(r, 200));

                const currentStatus = audioService.getCurrentSpeechStatus();
                // Enforce Minimum Duration rules (Step 5)
                if (!currentStatus.isSpeaking || currentStatus.duration < 300) {
                     console.log(`🚫 Barge-in rejected Phase 2. Duration too short (${currentStatus.duration.toFixed(0)} ms).`);
                     audioService.resetBargeInTrigger();
                     return;
                }

                let similarity2 = 1.0;
                if (currentStatus.blob && currentCall && currentCall.id) {
                    similarity2 = await speakerVerification.verifyChunk(currentCall.id, currentStatus.blob);
                }

                const avgSimilarity = (similarity1 + similarity2) / 2;
                
                // Final Confidence Score Computation (Step 7)
                const duration_score = Math.min(1.0, currentStatus.duration / 400); 
                const context_score = 0.5; // Interruptions naturally lower context score

                const confidence = (0.4 * avgSimilarity) + (0.3 * currentStatus.probability) + (0.2 * duration_score) + (0.1 * context_score);

                console.log(`🎯 Final Confidence: ${confidence.toFixed(2)} (Sim: ${avgSimilarity.toFixed(2)}, Prob: ${currentStatus.probability.toFixed(2)}, Dur: ${duration_score.toFixed(2)})`);

                if (confidence > 0.65) {
                     console.log("✅ Verified Double Barge-in! Stopping playback.");
                     audioService.stopPlayback();
                     updateAiStatus('listening');
                } else {
                     console.log("🚫 Barge-in rejected. Low final confidence.");
                     audioService.resetBargeInTrigger();
                }
            }
        };

        audioService.startRecording(
            async () => {
                // Silence detected - process the speech
                await processUserSpeech();
            },
            500, // ULTRA-LOW silence threshold for real-time latency
            handleSpeechStart, // On Speech Start (Barge-in trigger)
            150  // Safeguard delay (150ms to allow instant barge-in without missing their voice)
        );
    }, [aiStatus, updateAiStatus, currentCall]);

    // Semantic Filter: Ignore these phrases as "Barge-in"
    // We use exact word matching to avoid false positives (e.g. "aa" matching "aaj")
    const IGNORED_PHRASES = [
        "hmm", "humm", "hmmm", "achha", "acha", "thik", "thik hai", "ok", "okay", "han", "haan", "ha", "haa",
        "hello", "hi", "suniye", "sun", "sunao", "bol", "bolo", "oh", "ohh", "ooh", "aa", "aah", "ahh", "ouch",
        "हम्म", "हम", "अच्छा", "ठीक", "ठीक है", "हाँ", "हा", "हलो", "नमस्ते", "सुनिए", "ओह", "आह", "आ"
    ];

    // Process user speech
    const processUserSpeech = async () => {
        try {
            updateAiStatus('processing');

            const audioBlob = await audioService.stopRecording();

            if (!audioBlob || audioBlob.size < 1000) {
                startListening();
                return;
            }

            const userText = await transcribeAudio(audioBlob);

            if (!userText || userText.trim().length < 2) {
                console.log("Empty transcription, resuming listening...");
                startListening();
                return;
            }

            // Register baseline for Caller Verification right after first speech
            if (!baselineRegistered && currentCall && currentCall.id) {
                console.log("Registering baseline caller voice...");
                speakerVerification.registerBaseline(currentCall.id, audioBlob)
                    .then(success => {})
                    .catch(e => console.error("Baseline verification error", e));
                setBaselineRegistered(true);
            }

            // Removed excessively strict single-word and affirmative bans
            // because they caused the AI to ignore valid user affirmatives like "yes", "ok", or "haan".

            // IMPORTANT: Build context BEFORE awaiting addMessage to guarantee no duplicate loops
            const currentContext = [...latestTranscriptRef.current, { role: 'user', text: userText }];

            // Add to UI
            await addMessage('user', userText);

            // Handle Streaming AI Response and Audio Chunking
            startListening(); // Open mic immediately for barge-in while generating
            updateAiStatus('speaking');

            let fullResponse = "";
            let currentSentenceQueue = "";
            let streamComplete = false;
            const stream = generateResponseStream(userText, currentContext);

            const checkDone = () => {
                if (streamComplete) updateAiStatus('listening');
            };

            // Native browser TTS Fallback to guarantee voices never fail
            const fallbackTTS = (text) => {
                return new Promise((resolve) => {
                    if (!window.speechSynthesis) return resolve(null);
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'hi-IN'; // Works for Gujarati/Hindi mix fallback
                    utterance.rate = 1.05;
                    utterance.onend = () => resolve(null);
                    utterance.onerror = () => resolve(null);
                    window.speechSynthesis.speak(utterance);
                });
            };

            for await (const token of stream) {
                fullResponse += token;
                currentSentenceQueue += token;

                if (/[.!?|।\n]/.test(token)) {
                    const textToSpeak = currentSentenceQueue.trim();
                    if (textToSpeak.length > 2) {
                        const ttsPromise = synthesizeSpeech(textToSpeak).catch(err => {
                            console.error("ElevenLabs totally failed. Firing native TTS fallback.", err);
                            return fallbackTTS(textToSpeak);
                        });
                        audioService.enqueueAudioPromise(ttsPromise, checkDone);
                    }
                    currentSentenceQueue = "";
                }
            }

            streamComplete = true; // Generator exhausted
            const leftover = currentSentenceQueue.trim();
            if (leftover.length > 1) {
                const ttsPromise = synthesizeSpeech(leftover).catch(err => {
                    return fallbackTTS(leftover);
                });
                audioService.enqueueAudioPromise(ttsPromise, checkDone);
            } else if (!audioService.isPlayingQueue) {
                // Stream exhausted naturally exactly on a chunk boundary
                checkDone();
            }

            if (fullResponse.trim()) {
                await addMessage('ai', fullResponse); // Add complete block to UI transcript
            }

        } catch (err) {
            console.error('Processing error:', err);
            setError('Processing failed. Please try again.');
            
            // Speak a graceful fallback error natively so the user knows what happened
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance("માફ કરજો, નેટવર્ક અથવા કનેક્શન ની સમસ્યા છે. જરા ફરીથી બોલશો?");
                utterance.lang = 'gu-IN';
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
            }
            
            startListening();
        }
    };



    // Handle ending call
    const handleEndCall = () => {
        audioService.cleanup();
        endCall();
    };

    // Get status text and icon
    const getStatusInfo = () => {
        switch (aiStatus) {
            case 'listening':
                return { text: 'Listening...', icon: <MicIcon /> };
            case 'processing':
                return { text: 'Processing...', icon: <LoaderIcon /> };
            case 'speaking':
                return { text: 'Sheetal is speaking...', icon: <VolumeIcon /> };
            default:
                return { text: 'Ready', icon: null };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="call-interface">
            {/* Header */}
            <div className="call-header">
                <h1>AI Voice Assistant</h1>
                <p>Talk to Sheetal, our Hindi-speaking AI receptionist</p>
            </div>

            {/* Status Card */}
            <div className="call-status-card">
                <h2>{callState === 'idle' ? 'Ready to Connect' : 'Call in Progress'}</h2>
                <p>
                    {callState === 'idle'
                        ? 'Click the call button to speak with Sheetal'
                        : statusInfo.text
                    }
                </p>

                {currentCall && (
                    <span className="call-id">ID: {currentCall.id}</span>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}
            </div>

            {/* Audio Waveform - Show when listening */}
            {callState !== 'idle' && aiStatus === 'listening' && (
                <div className="audio-waveform">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            )}

            {/* Status Indicator */}
            {callState !== 'idle' && (
                <div className="status-indicator">
                    <span className={`status-dot ${aiStatus}`}></span>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            )}

            {/* Call Button */}
            <div className="call-button-container">
                <button
                    className={`call-button ${callState !== 'idle' ? 'active' : ''}`}
                    onClick={callState === 'idle' ? handleStartCall : handleEndCall}
                >
                    {callState === 'idle' ? <PhoneIcon size={40} /> : <PhoneOffIcon size={40} />}
                </button>
                <p className="call-button-label">
                    {callState === 'idle' ? 'Start Call' : 'End Call'}
                </p>

                {/* Report Button - visible only when call is active */}
                {callState !== 'idle' && (
                    <button
                        className={`report-button ${isReported ? 'reported' : ''}`}
                        onClick={() => setIsReported(true)}
                        title={isReported ? "Reported" : "Report an issue with this call"}
                    >
                        <AlertIcon size={16} />
                        <span>{isReported ? 'Issue Reported' : 'Report Issue'}</span>
                    </button>
                )}
            </div>

            {/* Call Timer */}
            {callState !== 'idle' && (
                <div className="call-timer">
                    {formatDuration(callDuration)}
                </div>
            )}

            {/* Transcript Panel */}
            {transcript.length > 0 && (
                <div className="transcript-panel" ref={transcriptRef}>
                    <h3>Conversation Transcript</h3>
                    <div className="transcript-messages">
                        {transcript.map((msg) => (
                            <div key={msg.id} className={`transcript-message ${msg.role}`}>
                                <div className="sender">
                                    {msg.role === 'ai' ? <><BotIcon /> Sheetal</> : <><UserIcon /> You</>}
                                </div>
                                <div className="text">{msg.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bot Inputs - Admin Feedback Box */}
            {callState !== 'idle' && (
                <div className="bot-inputs-panel">
                    <h3>Bot Inputs (Admin Feedback)</h3>
                    <textarea
                        className="feedback-textarea"
                        placeholder="Write where the bot is wrong or needs improvement..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        disabled={feedbackSent}
                    />
                    <button
                        className="send-feedback-btn"
                        onClick={() => {
                            setFeedbackSent(true);
                            setFeedbackText('');
                            setTimeout(() => setFeedbackSent(false), 3000);
                        }}
                        disabled={!feedbackText.trim() || feedbackSent}
                    >
                        Send Feedback
                    </button>
                    {feedbackSent && (
                        <div className="feedback-popup">
                            Your input has been sent for training. Thank you!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CallInterface;
