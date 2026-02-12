// Call Context - State management for call sessions
import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { classifyQuery } from '../services/geminiService';

const CallContext = createContext(null);

// Get call logs from localStorage
const getStoredCallLogs = () => {
    try {
        const stored = localStorage.getItem('sunPathologyCallLogs');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save call logs to localStorage
const saveCallLogs = (logs) => {
    try {
        localStorage.setItem('sunPathologyCallLogs', JSON.stringify(logs));
    } catch (error) {
        console.error('Failed to save call logs:', error);
    }
};

export function CallProvider({ children }) {
    const [callState, setCallState] = useState('idle'); // idle, connecting, active, processing
    const [currentCall, setCurrentCall] = useState(null);
    const [transcript, setTranscript] = useState([]);
    const [callLogs, setCallLogs] = useState(getStoredCallLogs);
    const [aiStatus, setAiStatus] = useState('idle'); // idle, listening, processing, speaking

    // Start a new call
    const startCall = useCallback(() => {
        const callId = `CALL-${uuidv4().slice(0, 8).toUpperCase()}`;
        const newCall = {
            id: callId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            transcript: [],
            category: 'GENERAL',
            status: 'active'
        };

        setCurrentCall(newCall);
        setTranscript([]);
        setCallState('connecting');

        return callId;
    }, []);

    // Add message to transcript
    const addMessage = useCallback(async (role, text) => {
        const message = {
            id: uuidv4(),
            role, // 'user' or 'ai'
            text,
            timestamp: new Date().toISOString()
        };

        setTranscript(prev => [...prev, message]);

        // Update category if user message
        if (role === 'user') {
            const category = await classifyQuery(text);
            setCurrentCall(prev => prev ? { ...prev, category } : null);
        }

        return message;
    }, []);

    // Set AI status
    const updateAiStatus = useCallback((status) => {
        setAiStatus(status);
    }, []);

    // Set call state to active (after welcome message)
    const activateCall = useCallback(() => {
        setCallState('active');
    }, []);

    // End the current call
    const endCall = useCallback(() => {
        if (!currentCall) return;

        const endTime = new Date();
        const startTime = new Date(currentCall.startTime);
        const duration = Math.floor((endTime - startTime) / 1000); // seconds

        const completedCall = {
            ...currentCall,
            endTime: endTime.toISOString(),
            duration,
            transcript: transcript,
            status: 'completed'
        };

        // Add to logs
        const updatedLogs = [completedCall, ...callLogs].slice(0, 100); // Keep last 100 calls
        setCallLogs(updatedLogs);
        saveCallLogs(updatedLogs);

        // Reset state
        setCurrentCall(null);
        setTranscript([]);
        setCallState('idle');
        setAiStatus('idle');

        return completedCall;
    }, [currentCall, transcript, callLogs]);

    // Get statistics
    const getStatistics = useCallback(() => {
        const logs = callLogs;
        const totalCalls = logs.length;
        const totalDuration = logs.reduce((sum, call) => sum + (call.duration || 0), 0);
        const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

        // Category breakdown
        const categories = {};
        logs.forEach(call => {
            const cat = call.category || 'GENERAL';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        // Get today's calls
        const today = new Date().toISOString().split('T')[0];
        const todayCalls = logs.filter(call =>
            call.startTime && call.startTime.startsWith(today)
        ).length;

        return {
            totalCalls,
            todayCalls,
            avgDuration,
            totalDuration,
            categories
        };
    }, [callLogs]);

    // Clear all logs
    const clearLogs = useCallback(() => {
        setCallLogs([]);
        localStorage.removeItem('sunPathologyCallLogs');
    }, []);

    const value = {
        // State
        callState,
        currentCall,
        transcript,
        callLogs,
        aiStatus,

        // Actions
        startCall,
        addMessage,
        endCall,
        activateCall,
        updateAiStatus,
        getStatistics,
        clearLogs,
        setCallState
    };

    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    );
}

export function useCall() {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
}

export default CallContext;
