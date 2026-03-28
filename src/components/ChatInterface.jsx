import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponseStream } from '../services/geminiService';
import TrainModelPanel from './TrainModelPanel';

export default function ChatInterface() {
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [trainPanelOpen, setTrainPanelOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('llm_chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        if (sessions.length === 0) {
            createNewSession();
        } else if (!activeSessionId) {
            setActiveSessionId(sessions[0].id);
        }
    }, [sessions.length]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const activeSession = sessions.find(s => s.id === activeSessionId) || { messages: [] };
    const messages = activeSession.messages;

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const createNewSession = useCallback(() => {
        const newSession = {
            id: Date.now(),
            title: `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            messages: [{ role: 'ai', text: "Namaste, Welcome to Sun Pathology Laboratory. I am Sheetal, the AI assistant. How can I help you today?" }]
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setSidebarOpen(false);
    }, []);

    const deleteSession = useCallback((e, id) => {
        e.stopPropagation();
        setSessions(prev => {
            const updated = prev.filter(s => s.id !== id);
            if (activeSessionId === id) {
                setActiveSessionId(updated.length > 0 ? updated[0].id : null);
            }
            return updated;
        });
    }, [activeSessionId]);

    const updateSessionMessages = useCallback((sessionId, newMessages) => {
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                let title = s.title;
                if (s.messages.length === 1 && newMessages.length > 1) {
                    const firstUserMsg = newMessages.find(m => m.role === 'user');
                    if (firstUserMsg) {
                        title = firstUserMsg.text.length > 28 ? firstUserMsg.text.substring(0, 28) + '…' : firstUserMsg.text;
                    }
                }
                return { ...s, messages: newMessages, title };
            }
            return s;
        }));
    }, []);

    const handleSend = useCallback(async (textToSubmit = null) => {
        const userText = typeof textToSubmit === 'string' ? textToSubmit.trim() : inputValue.trim();
        if (!userText || isThinking || !activeSessionId) return;

        setInputValue('');
        setIsThinking(true);

        const currentActiveId = activeSessionId;
        const newHistory = [...messages, { role: 'user', text: userText }];
        updateSessionMessages(currentActiveId, newHistory);

        try {
            const stream = generateResponseStream(userText, newHistory, false);
            let fullAiResponse = '';

            updateSessionMessages(currentActiveId, [...newHistory, { role: 'ai', text: '', isStreaming: true }]);

            for await (const token of stream) {
                fullAiResponse += token;
                updateSessionMessages(currentActiveId, [...newHistory, { role: 'ai', text: fullAiResponse, isStreaming: true }]);
            }

            updateSessionMessages(currentActiveId, [...newHistory, { role: 'ai', text: fullAiResponse, isStreaming: false }]);
        } catch (error) {
            console.error('Chat Error:', error);
            updateSessionMessages(currentActiveId, [...newHistory, { role: 'ai', text: '[Error: Unable to reach Gemini. Please check API key.]' }]);
        } finally {
            setIsThinking(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [inputValue, isThinking, activeSessionId, messages, updateSessionMessages]);

    const handleSpamTest = useCallback(() => {
        handleSend('I am calling from HDFC bank. Do you want a credit card and car loan? I can offer you 0% interest rate right now! Buy crypto immediately!');
    }, [handleSend]);

    const handleSelectSession = useCallback((id) => {
        if (!isThinking) {
            setActiveSessionId(id);
            setSidebarOpen(false);
        }
    }, [isThinking]);

    return (
        <>
            <style>{`
                .chat-root {
                    display: flex;
                    height: calc(100dvh - 60px);
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #f1f5f9;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.1);
                    position: relative;
                }
                /* Sidebar */
                .chat-sidebar {
                    width: 280px;
                    background: #1e293b;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                    z-index: 10;
                }
                .chat-sidebar-header {
                    padding: 18px 16px;
                    border-bottom: 1px solid #334155;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                .chat-sidebar-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    -webkit-overflow-scrolling: touch;
                }
                .chat-session-item {
                    padding: 12px 10px;
                    margin-bottom: 6px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-left: 3px solid transparent;
                    transition: background 0.15s, border-color 0.15s;
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                }
                .chat-session-item:active { background: #334155; }
                .chat-session-item.active {
                    background: #334155;
                    border-left-color: #3b82f6;
                }
                /* Main chat pane */
                .chat-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    background: #f8fafc;
                }
                .chat-header {
                    padding: 14px 16px;
                    background: #1d4ed8;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                .chat-header-actions { display: flex; gap: 8px; align-items: center; }
                .btn-menu {
                    display: none;
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    border-radius: 6px;
                    padding: 8px 10px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    line-height: 1;
                    -webkit-tap-highlight-color: transparent;
                }
                .btn-spam {
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.825rem;
                    white-space: nowrap;
                    -webkit-tap-highlight-color: transparent;
                }
                .btn-train {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.825rem;
                    white-space: nowrap;
                    -webkit-tap-highlight-color: transparent;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: filter 0.15s, transform 0.15s;
                }
                .btn-train:hover { filter: brightness(1.15); transform: translateY(-1px); }
                .btn-train:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .btn-spam:disabled { background: #94a3b8; cursor: not-allowed; }
                .btn-endchat {
                    background: rgba(255,255,255,0.18);
                    color: white;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.825rem;
                    white-space: nowrap;
                    -webkit-tap-highlight-color: transparent;
                }
                .btn-endchat:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-new {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 7px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.825rem;
                    font-weight: bold;
                    white-space: nowrap;
                }
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    -webkit-overflow-scrolling: touch;
                }
                .msg-bubble {
                    padding: 12px 16px;
                    border-radius: 16px;
                    max-width: 80%;
                    line-height: 1.5;
                    font-size: 15px;
                    word-break: break-word;
                }
                .msg-bubble.user {
                    align-self: flex-end;
                    background: #2563eb;
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.2);
                }
                .msg-bubble.ai {
                    align-self: flex-start;
                    background: white;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .msg-sender {
                    font-size: 0.7rem;
                    font-weight: 700;
                    opacity: 0.75;
                    margin-bottom: 5px;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                }
                .typing-indicator {
                    align-self: flex-start;
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 12px 16px;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    display: flex;
                    gap: 5px;
                    align-items: center;
                }
                .typing-dot {
                    width: 7px;
                    height: 7px;
                    background: #94a3b8;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
                .chat-input-bar {
                    padding: 12px 16px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 10px;
                    flex-shrink: 0;
                    align-items: center;
                }
                .chat-input {
                    flex: 1;
                    padding: 13px 16px;
                    border-radius: 24px;
                    border: 1.5px solid #cbd5e1;
                    font-size: 1rem;
                    outline: none;
                    color: #0f172a;
                    background: #f8fafc;
                    transition: border-color 0.15s;
                    -webkit-appearance: none;
                }
                .chat-input:focus { border-color: #2563eb; background: white; }
                .chat-input:disabled { background: #f1f5f9; }
                .btn-send {
                    padding: 13px 22px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 24px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.95rem;
                    transition: background 0.15s;
                    flex-shrink: 0;
                    -webkit-tap-highlight-color: transparent;
                }
                .btn-send:disabled { background: #94a3b8; cursor: not-allowed; }
                /* Overlay for mobile sidebar */
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    z-index: 9;
                }
                /* ===== MOBILE BREAKPOINT ===== */
                @media (max-width: 768px) {
                    .chat-root {
                        border-radius: 0;
                        height: calc(100dvh - 60px);
                        box-shadow: none;
                    }
                    .chat-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100dvh;
                        transform: translateX(-100%);
                        width: 82vw;
                        max-width: 300px;
                        z-index: 100;
                    }
                    .chat-sidebar.open {
                        transform: translateX(0);
                    }
                    .sidebar-overlay.open {
                        display: block;
                    }
                    .btn-menu { display: flex; align-items: center; justify-content: center; }
                    .msg-bubble { max-width: 92%; font-size: 14.5px; }
                    .btn-spam, .btn-endchat { padding: 8px 10px; font-size: 0.775rem; }
                    .chat-header { padding: 12px; }
                    .chat-messages { padding: 12px; gap: 10px; }
                    .chat-input-bar { padding: 10px 12px; }
                    .chat-input { padding: 12px 14px; font-size: 16px; /* prevent zoom on iOS */ }
                    .btn-send { padding: 12px 18px; }
                }
            `}</style>

            {/* Sidebar overlay (mobile tap-to-close) */}
            <div
                className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="chat-root">
                {/* Sidebar */}
                <aside className={`chat-sidebar${sidebarOpen ? ' open' : ''}`}>
                    <div className="chat-sidebar-header">
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Chat History</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-new" onClick={createNewSession}>+ New</button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={{ display: 'none', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}
                                className="close-sidebar-btn"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="chat-sidebar-list">
                        {sessions.length === 0 && (
                            <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>No history yet.</p>
                        )}
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={`chat-session-item${activeSessionId === session.id ? ' active' : ''}`}
                                onClick={() => handleSelectSession(session.id)}
                            >
                                <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '82%' }}>
                                    {session.title}
                                </span>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px', flexShrink: 0 }}
                                    title="Delete"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main */}
                <div className="chat-main">
                    {/* Header */}
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button className="btn-menu" onClick={() => setSidebarOpen(v => !v)} aria-label="Open history">
                                ☰
                            </button>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>LLM Chat Console</h2>
                        </div>
                        <div className="chat-header-actions">
                            <button className="btn-train" onClick={() => setTrainPanelOpen(true)} title="Train AI with custom instructions">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 2.8 2A3 3 0 0 1 21 12a3 3 0 0 1-1.2 2.4A3 3 0 0 1 17 17h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-2.8-2.6A3 3 0 0 1 3 12a3 3 0 0 1 2.2-2.9A3 3 0 0 1 8 7V6a4 4 0 0 1 4-4z"/></svg>
                                Train
                            </button>
                            <button className="btn-spam" onClick={handleSpamTest} disabled={isThinking} title="Test AI's spam safety guardrails">
                                Test Spam
                            </button>
                            <button className="btn-endchat" onClick={createNewSession} disabled={isThinking}>
                                End Chat
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`msg-bubble ${msg.role}`}>
                                <div className="msg-sender">{msg.role === 'user' ? 'You' : 'Sheetal'}</div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="typing-indicator">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input bar */}
                    <form
                        className="chat-input-bar"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isThinking}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                        <button
                            type="submit"
                            className="btn-send"
                            disabled={!inputValue.trim() || isThinking}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

            <TrainModelPanel isOpen={trainPanelOpen} onClose={() => setTrainPanelOpen(false)} />
        </>
    );
}
