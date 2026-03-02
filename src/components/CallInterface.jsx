// Call Interface - Professional UI with SVG icons
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCall } from '../context/CallContext';
import { audioService } from '../services/audioService';
import { transcribeAudio, generateResponse } from '../services/geminiService';
import { synthesizeSpeech } from '../services/elevenlabsService';

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

// Welcome message - Raj introduces himself
const WELCOME_MESSAGE = "नमस्कार, सन पैथोलॉजी लैब में आपका स्वागत है। मैं राज हूँ, मैं आपकी कैसे सहायता कर सकता हूँ?";

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

    // Helper: Play response (Simultaneous: Speak + Listen for Barge-in)
    const playResponse = async (text) => {
        try {
            const audioBlob = await synthesizeSpeech(text);

            // 1. Start Listening (Mic open for barge-in)
            // Note: We do this BEFORE playing so we catch early interruptions
            startListening();

            // 2. Update Status to Speak (Visually)
            updateAiStatus('speaking');

            // 3. Play Audio
            await audioService.playAudio(audioBlob);

            // 4. Finished (Naturally or interrupted)
            // If natural finish, swap back to listening status explicitly
            updateAiStatus('listening');

        } catch (err) {
            console.warn('Playback interrupted or failed:', err);
            // Ensure we are in listening state
            updateAiStatus('listening');
        }
    };

    // Handle starting a call
    const handleStartCall = async () => {
        try {
            setError(null);
            setIsReported(false);
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
                await audioService.playAudio(welcomeAudioRef.current);
                // Start listening after welcome message
                startListening();
                updateAiStatus('listening');
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
        const handleSpeechStart = () => {
            if (aiStatus === 'speaking' || audioService.currentAudio) {
                console.log("Barge-in detected! Stopping playback.");
                audioService.stopPlayback();
                updateAiStatus('listening');
            }
        };

        audioService.startRecording(
            async () => {
                // Silence detected - process the speech
                await processUserSpeech();
            },
            600, // Silence threshold
            handleSpeechStart, // On Speech Start (Barge-in trigger)
            150  // Safeguard delay (150ms to allow instant barge-in without missing their voice)
        );
    }, [aiStatus, updateAiStatus]);

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

            // --- SEMANTIC BARGE-IN FILTER ---
            // STRICT RULE: Single-word utterances are ALWAYS rejected.
            // Two-word utterances are rejected if they match the ignored phrases list.
            const cleanText = userText.toLowerCase().trim().replace(/[.,!?-]/g, "");
            const words = cleanText.split(/\s+/).filter(w => w.length > 0);

            // STRICT: Reject ALL single-word transcriptions — no exceptions
            if (words.length <= 1) {
                console.log(`🚫 Single-word REJECTED (strict ban): "${userText}"`);
                startListening();
                return;
            }

            // Also reject 2-word phrases that are filler/acknowledgment
            const isIgnored = (words.length === 2 && words.every(w => IGNORED_PHRASES.includes(w)));

            if (isIgnored) {
                console.log(`🚫 Filler phrase ignored: "${userText}"`);
                startListening();
                return;
            }

            await addMessage('user', userText);

            // IMPORTANT: Use LOCAL context construction to include the new message IMMEDIATELY
            // React state 'transcript' won't update until next render, which is too late for this function.
            // Also use latestTranscriptRef to ensure we have the most up-to-date history from previous renders.
            const currentContext = [...latestTranscriptRef.current, { role: 'user', text: userText }];

            const aiResponse = await generateResponse(userText, currentContext);
            await addMessage('ai', aiResponse);

            // Speak response with barge-in
            await playResponse(aiResponse);

        } catch (err) {
            console.error('Processing error:', err);
            setError('Processing failed. Please try again.');
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
                return { text: 'Raj is speaking...', icon: <VolumeIcon /> };
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
                <p>Talk to Raj, our Hindi-speaking AI receptionist</p>
            </div>

            {/* Status Card */}
            <div className="call-status-card">
                <h2>{callState === 'idle' ? 'Ready to Connect' : 'Call in Progress'}</h2>
                <p>
                    {callState === 'idle'
                        ? 'Click the call button to speak with Raj'
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
                                    {msg.role === 'ai' ? <><BotIcon /> Raj</> : <><UserIcon /> You</>}
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
