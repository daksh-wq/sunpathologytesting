import React, { useState, useRef, useEffect } from 'react';
import { generateResponseStream } from '../services/geminiService';



export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        setMessages([
            { role: 'ai', text: "Namaste, Welcome to Sun Pathology Laboratory. I am Sheetal, the AI assistant. How can I help you today?" }
        ]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async (e) => {
        e?.preventDefault();
        
        const userText = inputValue.trim();
        if (!userText || isThinking) return;

        setInputValue('');
        
        // Add user message to UI
        const newHistory = [...messages, { role: 'user', text: userText }];
        setMessages(newHistory);
        setIsThinking(true);

        try {
            // Get streaming response from Gemini
            const stream = generateResponseStream(userText, newHistory, false);
            
            let fullAiResponse = "";
            setMessages(prev => [...prev, { role: 'ai', text: fullAiResponse, isStreaming: true }]);

            for await (const token of stream) {
                fullAiResponse += token;
                
                // Update the last message (the AI's active streaming message)
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: 'ai', text: fullAiResponse, isStreaming: true };
                    return newArr;
                });
            }

            // Stream complete, lock the final message
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1] = { role: 'ai', text: fullAiResponse, isStreaming: false };
                return newArr;
            });

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "[Error: Unable to reach Gemini Model. Please check API key limitations.]" }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxWidth: '800px', margin: '0 auto', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ padding: '20px', background: '#2563eb', color: 'white', textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>💬 LLM Chat Console</h2>
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
            <form onSubmit={handleSend} style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
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
