import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    getInstructions, addInstruction, updateInstruction, deleteInstruction, toggleInstruction,
    getQAPairs, addQAPair, updateQAPair, deleteQAPair, toggleQAPair,
    exportTrainingData, importTrainingData, clearAllTrainingData, getTrainingStats
} from '../services/trainingDataService';

// ── SVG Icons ──
const PlusIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
);
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const UploadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
);
const BrainIcon = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 .68.12 1.33.34 1.93A4.5 4.5 0 0 0 2 13.5 4.5 4.5 0 0 0 6 18h1v2a2 2 0 0 0 4 0v-2"/>
        <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 .68-.12 1.33-.34 1.93A4.5 4.5 0 0 1 22 13.5 4.5 4.5 0 0 1 18 18h-1v2a2 2 0 0 1-4 0v-2"/>
        <path d="M12 2v20"/>
    </svg>
);
const ClipboardIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
);
const MessageSquareIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);
const AlertTriangleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
const CheckCircleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);
const InfoIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
);
const XCircleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);

export default function TrainModelPanel({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('instructions');
    const [instructions, setInstructions] = useState([]);
    const [qaPairs, setQAPairs] = useState([]);
    const [stats, setStats] = useState({ totalInstructions: 0, activeInstructions: 0, totalQAPairs: 0, activeQAPairs: 0 });
    const [newInstruction, setNewInstruction] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editQuestion, setEditQuestion] = useState('');
    const [editAnswer, setEditAnswer] = useState('');
    const [notification, setNotification] = useState(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const fileInputRef = useRef(null);

    const refreshData = useCallback(() => {
        setInstructions(getInstructions());
        setQAPairs(getQAPairs());
        setStats(getTrainingStats());
    }, []);

    useEffect(() => { if (isOpen) refreshData(); }, [isOpen, refreshData]);

    const showNotif = (text, type = 'success') => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // ── Instruction handlers ──
    const handleAddInstruction = () => {
        if (!newInstruction.trim()) return;
        addInstruction(newInstruction);
        setNewInstruction('');
        refreshData();
        showNotif('Instruction added successfully');
    };
    const handleDeleteInstruction = (id) => { deleteInstruction(id); refreshData(); showNotif('Instruction removed', 'info'); };
    const handleToggleInstruction = (id) => { toggleInstruction(id); refreshData(); };
    const handleStartEditInstruction = (inst) => { setEditingId(inst.id); setEditText(inst.text); };
    const handleSaveEditInstruction = (id) => {
        if (!editText.trim()) return;
        updateInstruction(id, { text: editText.trim() });
        setEditingId(null); setEditText(''); refreshData(); showNotif('Instruction updated');
    };

    // ── Q&A handlers ──
    const handleAddQA = () => {
        if (!newQuestion.trim() || !newAnswer.trim()) return;
        addQAPair(newQuestion, newAnswer, newCategory);
        setNewQuestion(''); setNewAnswer(''); setNewCategory('General');
        refreshData(); showNotif('Q&A pair added successfully');
    };
    const handleDeleteQA = (id) => { deleteQAPair(id); refreshData(); showNotif('Q&A pair removed', 'info'); };
    const handleToggleQA = (id) => { toggleQAPair(id); refreshData(); };
    const handleStartEditQA = (pair) => { setEditingId(pair.id); setEditQuestion(pair.question); setEditAnswer(pair.answer); };
    const handleSaveEditQA = (id) => {
        if (!editQuestion.trim() || !editAnswer.trim()) return;
        updateQAPair(id, { question: editQuestion.trim(), answer: editAnswer.trim() });
        setEditingId(null); setEditQuestion(''); setEditAnswer(''); refreshData(); showNotif('Q&A pair updated');
    };

    // ── Import/Export ──
    const handleExport = () => {
        const data = exportTrainingData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sheetal_training_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotif('Training data exported');
    };
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = importTrainingData(ev.target.result);
            if (result.success) { refreshData(); showNotif(`Imported ${result.instructionCount} instructions & ${result.qaCount} Q&A pairs`); }
            else showNotif(`Import failed: ${result.error}`, 'error');
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const handleClearAll = () => { clearAllTrainingData(); refreshData(); setShowConfirmClear(false); showNotif('All training data cleared', 'info'); };

    if (!isOpen) return null;

    const CATEGORIES = ['General', 'Pricing', 'Tests', 'Location', 'Timing', 'Policy', 'Greeting', 'Complaint'];
    const CATEGORY_COLORS = {
        General: '#6366f1', Pricing: '#10b981', Tests: '#f59e0b', Location: '#3b82f6',
        Timing: '#8b5cf6', Policy: '#ef4444', Greeting: '#06b6d4', Complaint: '#f97316'
    };

    return (
        <>
            <style>{`
                /* ─── OVERLAY ─── */
                .tp-overlay {
                    position: fixed; inset: 0; z-index: 1000;
                    background: rgba(2, 6, 23, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    animation: tpFade 0.2s ease;
                    padding: 16px;
                }
                @keyframes tpFade { from{opacity:0} to{opacity:1} }

                /* ─── PANEL ─── */
                .tp-panel {
                    background: linear-gradient(180deg, #0c1222 0%, #111827 100%);
                    border: 1px solid rgba(99, 102, 241, 0.15);
                    border-radius: 20px;
                    width: 100%; max-width: 680px;
                    height: 88vh; max-height: 720px;
                    display: flex; flex-direction: column;
                    overflow: hidden;
                    box-shadow:
                        0 0 0 1px rgba(99, 102, 241, 0.08),
                        0 24px 64px -12px rgba(0, 0, 0, 0.6),
                        0 0 120px -40px rgba(99, 102, 241, 0.12);
                    animation: tpSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes tpSlide { from{transform:translateY(20px) scale(0.98);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }

                /* ─── HEADER ─── */
                .tp-header {
                    padding: 24px 28px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    display: flex; align-items: center; justify-content: space-between;
                    flex-shrink: 0;
                    background: linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, transparent 100%);
                }
                .tp-header-left { display: flex; align-items: center; gap: 14px; }
                .tp-header-icon {
                    width: 44px; height: 44px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
                    font-size: 1.3rem;
                }
                .tp-header-text h2 { color: #f8fafc; font-size: 1.2rem; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
                .tp-header-text p { color: #64748b; font-size: 0.8rem; margin: 3px 0 0; font-weight: 400; }
                .tp-close {
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
                    color: #64748b; border-radius: 10px;
                    width: 38px; height: 38px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s; font-size: 1.2rem; line-height: 1;
                }
                .tp-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: rgba(255,255,255,0.12); }

                /* ─── TABS ─── */
                .tp-tabs {
                    display: flex; padding: 0 28px; flex-shrink: 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.15);
                }
                .tp-tab {
                    padding: 14px 20px;
                    background: none; border: none;
                    color: #475569; font-size: 0.84rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                    border-bottom: 2px solid transparent;
                    display: flex; align-items: center; gap: 8px;
                    letter-spacing: 0.01em;
                }
                .tp-tab:hover { color: #94a3b8; }
                .tp-tab.active { color: #a78bfa; border-bottom-color: #7c3aed; }
                .tp-tab-badge {
                    background: rgba(124,58,237,0.2); color: #a78bfa;
                    padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;
                    min-width: 20px; text-align: center;
                }
                .tp-tab-icon { font-size: 1rem; }

                /* ─── CONTENT ─── */
                .tp-content {
                    flex: 1; overflow-y: auto; padding: 24px 28px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(99,102,241,0.2) transparent;
                }
                .tp-content::-webkit-scrollbar { width: 5px; }
                .tp-content::-webkit-scrollbar-track { background: transparent; }
                .tp-content::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }

                /* ─── ADD FORM ─── */
                .tp-form {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 18px;
                    margin-bottom: 24px;
                    transition: border-color 0.2s;
                }
                .tp-form:focus-within { border-color: rgba(124,58,237,0.3); }
                .tp-form-label {
                    font-size: 0.72rem; font-weight: 600; color: #475569;
                    text-transform: uppercase; letter-spacing: 0.06em;
                    margin-bottom: 10px; display: block;
                }
                .tp-input, .tp-textarea {
                    width: 100%; padding: 11px 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; color: #e2e8f0;
                    font-size: 0.88rem; font-family: 'Inter', -apple-system, sans-serif;
                    outline: none; transition: all 0.2s;
                }
                .tp-input:focus, .tp-textarea:focus {
                    border-color: rgba(124,58,237,0.4);
                    background: rgba(255,255,255,0.06);
                    box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
                }
                .tp-input::placeholder, .tp-textarea::placeholder { color: #334155; }
                .tp-textarea { resize: vertical; min-height: 54px; line-height: 1.5; }
                .tp-form-actions {
                    display: flex; gap: 10px; margin-top: 12px;
                    align-items: center; justify-content: flex-end;
                }
                .tp-form-actions select {
                    padding: 8px 12px; background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px; color: #94a3b8;
                    font-size: 0.8rem; font-family: inherit;
                    outline: none; cursor: pointer; transition: border-color 0.2s;
                }
                .tp-form-actions select:focus { border-color: rgba(124,58,237,0.4); }
                .tp-btn-add {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white; border: none; padding: 9px 20px;
                    border-radius: 10px; font-weight: 600; font-size: 0.82rem;
                    cursor: pointer; display: flex; align-items: center; gap: 6px;
                    white-space: nowrap; transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(99,102,241,0.25);
                }
                .tp-btn-add:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.35); transform: translateY(-1px); }
                .tp-btn-add:active { transform: translateY(0); }
                .tp-btn-add:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }

                /* ─── ITEM CARDS ─── */
                .tp-item {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px; padding: 16px 18px;
                    margin-bottom: 10px; transition: all 0.2s;
                    position: relative;
                }
                .tp-item:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }
                .tp-item.disabled { opacity: 0.35; }
                .tp-item-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
                .tp-item-body { flex: 1; min-width: 0; }
                .tp-item-num {
                    color: #4f46e5; font-size: 0.7rem; font-weight: 700;
                    background: rgba(79,70,229,0.1); width: 22px; height: 22px;
                    border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;
                    margin-right: 10px; flex-shrink: 0; vertical-align: middle;
                }
                .tp-item-text {
                    color: #cbd5e1; font-size: 0.87rem; line-height: 1.6;
                    word-break: break-word; display: inline; vertical-align: middle;
                }
                .tp-item-actions { display: flex; gap: 3px; flex-shrink: 0; }
                .tp-icon-btn {
                    background: transparent; border: none;
                    color: #475569; border-radius: 7px;
                    width: 32px; height: 32px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.15s;
                }
                .tp-icon-btn:hover { background: rgba(255,255,255,0.06); color: #94a3b8; }
                .tp-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

                /* Toggle Switch */
                .tp-toggle {
                    position: relative; width: 36px; height: 20px;
                    background: #1e293b; border-radius: 12px;
                    cursor: pointer; transition: background 0.25s;
                    border: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                .tp-toggle.on { background: #4f46e5; border-color: #6366f1; }
                .tp-toggle::after {
                    content: ''; position: absolute;
                    top: 2px; left: 2px;
                    width: 14px; height: 14px;
                    background: white; border-radius: 50%;
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
                .tp-toggle.on::after { transform: translateX(16px); }

                /* Q&A specific */
                .tp-qa-q { color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin-bottom: 8px; }
                .tp-qa-q strong { color: #6366f1; font-weight: 700; margin-right: 6px; }
                .tp-qa-a {
                    color: #64748b; font-size: 0.82rem; line-height: 1.5;
                    padding: 10px 14px; background: rgba(79,70,229,0.04);
                    border-left: 3px solid rgba(99,102,241,0.25);
                    border-radius: 0 8px 8px 0;
                }
                .tp-qa-a strong { color: #10b981; font-weight: 700; margin-right: 6px; }
                .tp-badge {
                    display: inline-block; padding: 3px 9px;
                    border-radius: 6px; font-size: 0.66rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.04em;
                    margin-bottom: 8px;
                }

                /* Edit inline */
                .tp-edit-row { display: flex; gap: 8px; margin-top: 10px; }
                .tp-edit-row textarea {
                    flex: 1; padding: 9px 12px;
                    background: rgba(255,255,255,0.04);
                    border: 1.5px solid rgba(124,58,237,0.4);
                    border-radius: 8px; color: #e2e8f0;
                    font-size: 0.84rem; font-family: inherit;
                    resize: vertical; outline: none; min-height: 38px;
                    line-height: 1.5;
                }
                .tp-edit-row textarea:focus {
                    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
                }
                .tp-btn-save {
                    background: #059669; border: none; color: white;
                    border-radius: 8px; padding: 7px 16px;
                    cursor: pointer; font-size: 0.78rem; font-weight: 600;
                    display: flex; align-items: center; gap: 4px;
                    transition: all 0.15s; white-space: nowrap;
                }
                .tp-btn-save:hover { background: #10b981; }
                .tp-btn-cancel {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    color: #64748b; border-radius: 8px; padding: 7px 14px;
                    cursor: pointer; font-size: 0.78rem; font-weight: 600;
                    transition: all 0.15s;
                }
                .tp-btn-cancel:hover { color: #94a3b8; border-color: rgba(255,255,255,0.15); }

                /* ─── FOOTER ─── */
                .tp-footer {
                    padding: 16px 28px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex; justify-content: space-between; align-items: center;
                    flex-shrink: 0; gap: 12px; flex-wrap: wrap;
                    background: rgba(0,0,0,0.1);
                }
                .tp-footer-stats { color: #475569; font-size: 0.78rem; font-weight: 500; }
                .tp-footer-stats span { color: #7c3aed; font-weight: 700; }
                .tp-footer-actions { display: flex; gap: 6px; flex-wrap: wrap; }
                .tp-btn-ghost {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    color: #64748b; padding: 8px 14px; border-radius: 9px;
                    font-size: 0.76rem; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; gap: 5px;
                    transition: all 0.2s; white-space: nowrap;
                }
                .tp-btn-ghost:hover { border-color: rgba(255,255,255,0.12); color: #94a3b8; background: rgba(255,255,255,0.05); }
                .tp-btn-ghost.danger:hover { border-color: rgba(239,68,68,0.3); color: #ef4444; background: rgba(239,68,68,0.05); }

                /* ─── EMPTY STATE ─── */
                .tp-empty { text-align: center; padding: 56px 24px; }
                .tp-empty-icon {
                    width: 64px; height: 64px; margin: 0 auto 16px;
                    background: rgba(99,102,241,0.06);
                    border: 1px solid rgba(99,102,241,0.1);
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    color: #6366f1;
                }
                .tp-empty-icon svg { width: 28px; height: 28px; }
                .tp-empty h4 { color: #475569; font-size: 0.92rem; font-weight: 600; margin: 0 0 6px; }
                .tp-empty p { color: #334155; font-size: 0.82rem; line-height: 1.5; margin: 0; }

                /* ─── NOTIFICATION ─── */
                .tp-notif {
                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                    z-index: 2000; padding: 12px 24px; border-radius: 12px;
                    font-size: 0.84rem; font-weight: 600;
                    animation: tpNotifIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
                    white-space: nowrap;
                    display: flex; align-items: center; gap: 8px;
                }
                .tp-notif.success { background: linear-gradient(135deg, #059669, #10b981); color: white; }
                .tp-notif.info { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; }
                .tp-notif.error { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; }
                @keyframes tpNotifIn { from{transform:translateX(-50%) translateY(-16px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }

                /* ─── CONFIRM DIALOG ─── */
                .tp-confirm-overlay {
                    position: fixed; inset: 0; z-index: 1500;
                    background: rgba(2,6,23,0.7); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                }
                .tp-confirm-box {
                    background: linear-gradient(180deg, #111827, #0f172a);
                    border: 1px solid rgba(239,68,68,0.15);
                    border-radius: 18px; padding: 32px; max-width: 380px; text-align: center;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
                    animation: tpSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .tp-confirm-box h3 { color: #f1f5f9; font-size: 1.05rem; font-weight: 700; margin: 0 0 8px; display: flex; align-items: center; gap: 8px; justify-content: center; }
                .tp-confirm-box h3 svg { color: #f59e0b; flex-shrink: 0; }
                .tp-confirm-box p { color: #64748b; font-size: 0.84rem; margin: 0 0 24px; line-height: 1.5; }
                .tp-confirm-btns { display: flex; gap: 10px; justify-content: center; }
                .tp-confirm-btns button {
                    padding: 10px 24px; border-radius: 10px; font-weight: 600;
                    font-size: 0.84rem; cursor: pointer; border: none; transition: all 0.15s;
                }
                .tp-confirm-btns .cancel-btn { background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); }
                .tp-confirm-btns .cancel-btn:hover { background: rgba(255,255,255,0.1); }
                .tp-confirm-btns .danger-btn { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
                .tp-confirm-btns .danger-btn:hover { box-shadow: 0 4px 16px rgba(239,68,68,0.4); }

                /* ─── MOBILE ─── */
                @media (max-width: 640px) {
                    .tp-overlay { padding: 0; }
                    .tp-panel { max-width: 100%; height: 100%; border-radius: 0; }
                    .tp-header { padding: 18px 16px 16px; }
                    .tp-tabs { padding: 0 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
                    .tp-tab { padding: 14px 16px; }
                    .tp-content { padding: 16px; }
                    .tp-footer { padding: 14px 16px; flex-direction: column; gap: 16px; }
                    .tp-footer-stats { text-align: center; }
                    .tp-footer-actions { width: 100%; justify-content: space-between; gap: 8px; display: grid; grid-template-columns: 1fr 1fr 1fr; }
                    .tp-btn-ghost { justify-content: center; width: 100%; padding: 8px 4px; font-size: 0.72rem; }
                    
                    /* Form responsive */
                    .tp-form-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; width: 100%; }
                    .tp-form-actions select { width: 100%; }
                    .tp-btn-add { justify-content: center; width: 100%; }
                    
                    /* List responsive */
                    .tp-item-row { flex-direction: column; gap: 12px; }
                    .tp-item-actions { width: 100%; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
                    .tp-edit-row { flex-direction: column; align-items: stretch; }
                    .tp-edit-row button { justify-content: center; width: 100%; }
                }
            `}</style>

            {notification && (
                <div className={`tp-notif ${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircleIcon /> : notification.type === 'error' ? <XCircleIcon /> : <InfoIcon />} {notification.text}
                </div>
            )}

            {showConfirmClear && (
                <div className="tp-confirm-overlay" onClick={() => setShowConfirmClear(false)}>
                    <div className="tp-confirm-box" onClick={e => e.stopPropagation()}>
                        <h3><AlertTriangleIcon /> Clear All Training Data?</h3>
                        <p>This will permanently delete all custom instructions and Q&A pairs. This cannot be undone.</p>
                        <div className="tp-confirm-btns">
                            <button className="cancel-btn" onClick={() => setShowConfirmClear(false)}>Cancel</button>
                            <button className="danger-btn" onClick={handleClearAll}>Yes, Clear All</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="tp-overlay" onClick={onClose}>
                <div className="tp-panel" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="tp-header">
                        <div className="tp-header-left">
                            <div className="tp-header-icon"><BrainIcon size={24} /></div>
                            <div className="tp-header-text">
                                <h2>Train Model</h2>
                                <p>Teach Sheetal how to respond to customers</p>
                            </div>
                        </div>
                        <button className="tp-close" onClick={onClose} title="Close">✕</button>
                    </div>

                    {/* Tabs */}
                    <div className="tp-tabs">
                        <button className={`tp-tab${activeTab === 'instructions' ? ' active' : ''}`} onClick={() => setActiveTab('instructions')}>
                            <ClipboardIcon /> Instructions
                            {stats.totalInstructions > 0 && <span className="tp-tab-badge">{stats.totalInstructions}</span>}
                        </button>
                        <button className={`tp-tab${activeTab === 'qa' ? ' active' : ''}`} onClick={() => setActiveTab('qa')}>
                            <MessageSquareIcon /> Q&A Pairs
                            {stats.totalQAPairs > 0 && <span className="tp-tab-badge">{stats.totalQAPairs}</span>}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="tp-content">
                        {activeTab === 'instructions' && (
                            <>
                                <div className="tp-form">
                                    <span className="tp-form-label">New Behavioral Instruction</span>
                                    <textarea
                                        className="tp-textarea"
                                        value={newInstruction}
                                        onChange={e => setNewInstruction(e.target.value)}
                                        placeholder='e.g., "Always recommend Full Body Checkup for patients over 40"'
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddInstruction(); } }}
                                    />
                                    <div className="tp-form-actions">
                                        <button className="tp-btn-add" onClick={handleAddInstruction} disabled={!newInstruction.trim()}>
                                            <PlusIcon /> Add Instruction
                                        </button>
                                    </div>
                                </div>

                                {instructions.length === 0 ? (
                                    <div className="tp-empty">
                                        <div className="tp-empty-icon"><ClipboardIcon /></div>
                                        <h4>No instructions yet</h4>
                                        <p>Add behavioral rules to control how Sheetal<br />responds to customers in conversations.</p>
                                    </div>
                                ) : (
                                    instructions.map((inst, idx) => (
                                        <div key={inst.id} className={`tp-item${!inst.enabled ? ' disabled' : ''}`}>
                                            <div className="tp-item-row">
                                                <div className="tp-item-body">
                                                    {editingId === inst.id ? (
                                                        <>
                                                            <div className="tp-edit-row">
                                                                <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus />
                                                            </div>
                                                            <div className="tp-edit-row">
                                                                <button className="tp-btn-save" onClick={() => handleSaveEditInstruction(inst.id)}><CheckIcon /> Save</button>
                                                                <button className="tp-btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="tp-item-num">{idx + 1}</span>
                                                            <span className="tp-item-text">{inst.text}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="tp-item-actions">
                                                    <div className={`tp-toggle${inst.enabled ? ' on' : ''}`} onClick={() => handleToggleInstruction(inst.id)} title={inst.enabled ? 'Enabled — click to disable' : 'Disabled — click to enable'} />
                                                    {editingId !== inst.id && (
                                                        <button className="tp-icon-btn" onClick={() => handleStartEditInstruction(inst)} title="Edit"><EditIcon /></button>
                                                    )}
                                                    <button className="tp-icon-btn danger" onClick={() => handleDeleteInstruction(inst.id)} title="Delete"><TrashIcon /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {activeTab === 'qa' && (
                            <>
                                <div className="tp-form">
                                    <span className="tp-form-label">New Q&A Training Pair</span>
                                    <input
                                        className="tp-input"
                                        type="text"
                                        value={newQuestion}
                                        onChange={e => setNewQuestion(e.target.value)}
                                        placeholder='Question: e.g., "What is the lab WhatsApp number?"'
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <textarea
                                        className="tp-textarea"
                                        value={newAnswer}
                                        onChange={e => setNewAnswer(e.target.value)}
                                        placeholder='Answer: e.g., "Our WhatsApp number is 079 6700 6700"'
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddQA(); } }}
                                    />
                                    <div className="tp-form-actions">
                                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div style={{ flex: 1 }} />
                                        <button className="tp-btn-add" onClick={handleAddQA} disabled={!newQuestion.trim() || !newAnswer.trim()}>
                                            <PlusIcon /> Add Q&A Pair
                                        </button>
                                    </div>
                                </div>

                                {qaPairs.length === 0 ? (
                                    <div className="tp-empty">
                                        <div className="tp-empty-icon"><MessageSquareIcon /></div>
                                        <h4>No Q&A pairs yet</h4>
                                        <p>Add question → answer mappings and Sheetal<br />will use these exact answers when asked.</p>
                                    </div>
                                ) : (
                                    qaPairs.map(pair => (
                                        <div key={pair.id} className={`tp-item${!pair.enabled ? ' disabled' : ''}`}>
                                            <div className="tp-item-row">
                                                <div className="tp-item-body">
                                                    <span
                                                        className="tp-badge"
                                                        style={{ background: `${CATEGORY_COLORS[pair.category] || '#6366f1'}18`, color: CATEGORY_COLORS[pair.category] || '#6366f1' }}
                                                    >
                                                        {pair.category}
                                                    </span>
                                                    {editingId === pair.id ? (
                                                        <>
                                                            <div className="tp-edit-row">
                                                                <textarea value={editQuestion} onChange={e => setEditQuestion(e.target.value)} placeholder="Question" autoFocus />
                                                            </div>
                                                            <div className="tp-edit-row">
                                                                <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} placeholder="Answer" />
                                                            </div>
                                                            <div className="tp-edit-row">
                                                                <button className="tp-btn-save" onClick={() => handleSaveEditQA(pair.id)}><CheckIcon /> Save</button>
                                                                <button className="tp-btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="tp-qa-q"><strong>Q:</strong> {pair.question}</div>
                                                            <div className="tp-qa-a"><strong>A:</strong> {pair.answer}</div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="tp-item-actions">
                                                    <div className={`tp-toggle${pair.enabled ? ' on' : ''}`} onClick={() => handleToggleQA(pair.id)} title={pair.enabled ? 'Enabled' : 'Disabled'} />
                                                    {editingId !== pair.id && (
                                                        <button className="tp-icon-btn" onClick={() => handleStartEditQA(pair)} title="Edit"><EditIcon /></button>
                                                    )}
                                                    <button className="tp-icon-btn danger" onClick={() => handleDeleteQA(pair.id)} title="Delete"><TrashIcon /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="tp-footer">
                        <div className="tp-footer-stats">
                            <span>{stats.activeInstructions}</span> instructions · <span>{stats.activeQAPairs}</span> Q&A pairs active
                        </div>
                        <div className="tp-footer-actions">
                            <button className="tp-btn-ghost" onClick={handleExport}><DownloadIcon /> Export</button>
                            <button className="tp-btn-ghost" onClick={() => fileInputRef.current?.click()}><UploadIcon /> Import</button>
                            <button className="tp-btn-ghost danger" onClick={() => setShowConfirmClear(true)}><TrashIcon /> Clear</button>
                            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
