import React, { useState, useRef, useEffect } from 'react';
import { generateResponseStream } from '../services/geminiService';

export default function ChatInterface() {
    // Load sessions from localStorage or default to empty array
    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem('llm_chat_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Save sessions to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('llm_chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    // Initialize first session if none exists
    useEffect(() => {
        if (sessions.length === 0) {
            createNewSession();
        } else if (!activeSessionId) {
            setActiveSessionId(sessions[0].id);
        }
    }, [sessions.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const activeSession = sessions.find(s => s.id === activeSessionId) || { messages: [] };
    const messages = activeSession.messages;

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const createNewSession = () => {
        const newSession = {
            id: Date.now(),
            title: `Chat ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            messages: [{ role: 'ai', text: "Namaste, Welcome to Sun Pathology Laboratory. I am Sheetal, the AI assistant. How can I help you today?" }]
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        if (activeSessionId === id) {
            setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        }
    };

    const updateSessionMessages = (sessionId, newMessages) => {
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                // Auto-update title based on first user message
                let title = s.title;
                if (s.messages.length === 1 && newMessages.length > 1) {
                    const firstUserMsg = newMessages.find(m => m.role === 'user');
                    if (firstUserMsg) {
                        title = firstUserMsg.text.length > 20 ? firstUserMsg.text.substring(0, 20) + "..." : firstUserMsg.text;
                    }
                }
                return { ...s, messages: newMessages, title };
            }
            return s;
        }));
    };

    const handleSend = async (textToSubmit = null) => {
        const userText = typeof textToSubmit === 'string' ? textToSubmit.trim() : inputValue.trim();
        if (!userText || isThinking || !activeSessionId) return;

        setInputValue('');
        setIsThinking(true);
        
        // Add user message to UI
        const newHistory = [...messages, { role: 'user', text: userText }];
        updateSessionMessages(activeSessionId, newHistory);

        const currentActiveId = activeSessionId; // Capture ID for async safety

        try {
            const stream = generateResponseStream(userText, newHistory, false);
            
            let fullAiResponse = "";
            let currentMessages = [...newHistory, { role: 'ai', text: fullAiResponse, isStreaming: true }];
            updateSessionMessages(currentActiveId, currentMessages);

            for await (const token of stream) {
                fullAiResponse += token;
                
                // Update the last message
                currentMessages = [...newHistory, { role: 'ai', text: fullAiResponse, isStreaming: true }];
                updateSessionMessages(currentActiveId, currentMessages);
            }

            // Stream complete
            currentMessages = [...newHistory, { role: 'ai', text: fullAiResponse, isStreaming: false }];
            updateSessionMessages(currentActiveId, currentMessages);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessages = [...newHistory, { role: 'ai', text: "[Error: Unable to reach Gemini Model. Please check API key limitations.]" }];
            updateSessionMessages(currentActiveId, errorMessages);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSpamTest = () => {
        const spamMessage = "I am calling from HDFC bank. Do you want a credit card and car loan? I can offer you 0% interest rate right now! Buy crypto immediately!";
        handleSend(spamMessage);
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 100px)', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Sidebar (History) */}
            <div style={{ width: '280px', background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chats</h3>
                    <button 
                        onClick={createNewSession}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                        + New
                    </button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {sessions.map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => !isThinking && setActiveSessionId(session.id)}
                            style={{ 
                                padding: '12px', 
                                marginBottom: '8px',
                                background: activeSessionId === session.id ? '#334155' : 'transparent',
                                borderRadius: '8px',
                                cursor: isThinking ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: activeSessionId === session.id ? '4px solid #3b82f6' : '4px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                                {session.title}
                            </span>
                            <button 
                                onClick={(e) => deleteSession(e, session.id)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
                                title="Delete Chat"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            No history yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <div style={{ padding: '20px', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>LLM Chat Console</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleSpamTest}
                            disabled={isThinking}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: isThinking ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.875rem' }}
                            title="Sends a spam message to test the AI's safety guardrails"
                        >
                            Test Spam
                        </button>
                        <button 
                            onClick={createNewSession}
                            disabled={isThinking}
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: isThinking ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.875rem' }}
                        >
                            End Chat
                        </button>
                    </div>
                </div>

                {/* Chat History */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ 
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.role === 'user' ? '#2563eb' : '#ffffff',
                            color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            maxWidth: '85%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: msg.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                            borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                            lineHeight: '1.5',
                            fontSize: '15px'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '6px', fontWeight: 'bold' }}>
                                {msg.role === 'user' ? 'You' : 'Sheetal'}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        </div>
                    ))}
                    {isThinking && (
                        <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '0.875rem', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                    style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}
                >
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isThinking}
                        style={{ flex: 1, padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', color: '#0f172a' }}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || isThinking}
                        style={{ 
                            padding: '12px 28px', 
                            background: (inputValue.trim() && !isThinking) ? '#2563eb' : '#94a3b8', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            cursor: (inputValue.trim() && !isThinking) ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }}
                    >
                        Send
                    </button>
                </form>
            </div>

            <style>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #94a3b8;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
