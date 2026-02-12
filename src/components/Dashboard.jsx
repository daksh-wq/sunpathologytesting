// Dashboard - Professional UI with SVG icons
import React, { useState } from 'react';
import { useCall } from '../context/CallContext';
import { format } from 'date-fns';

// SVG Icons
const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const TimerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="2" x2="14" y2="2" />
        <line x1="12" y1="14" x2="12" y2="8" />
        <circle cx="12" cy="14" r="8" />
    </svg>
)

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const InboxIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
)

const ChevronIcon = ({ expanded }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

// Category labels
const categoryLabels = {
    REPORT: 'Report',
    LOCATION: 'Location',
    TIMING: 'Timing',
    TESTS: 'Tests',
    HOME_COLLECTION: 'Home Collection',
    GENERAL: 'General',
    OTHER: 'Other'
};

function Dashboard() {
    const { callLogs, getStatistics, clearLogs } = useCall();
    const [expandedCall, setExpandedCall] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const stats = getStatistics();

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (isoString) => {
        try {
            return format(new Date(isoString), 'MMM dd, HH:mm');
        } catch {
            return '-';
        }
    };

    const handleClearLogs = () => {
        clearLogs();
        setShowClearConfirm(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Call Dashboard</h1>
                    <p>Monitor call logs and analytics</p>
                </div>
                {callLogs.length > 0 && (
                    <button className="clear-btn" onClick={() => setShowClearConfirm(true)}>
                        <TrashIcon />
                        <span>Clear Logs</span>
                    </button>
                )}
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Clear All Logs?</h3>
                        <p>This action cannot be undone. All call history will be permanently deleted.</p>
                        <div className="modal-buttons">
                            <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleClearLogs}>
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon"><PhoneIcon /></div>
                    <div className="label">Total Calls</div>
                    <div className="value">{stats.totalCalls}</div>
                </div>

                <div className="stat-card">
                    <div className="icon"><CalendarIcon /></div>
                    <div className="label">Today's Calls</div>
                    <div className="value">{stats.todayCalls}</div>
                </div>

                <div className="stat-card">
                    <div className="icon"><ClockIcon /></div>
                    <div className="label">Avg. Duration</div>
                    <div className="value">{formatDuration(stats.avgDuration)}</div>
                </div>

                <div className="stat-card">
                    <div className="icon"><TimerIcon /></div>
                    <div className="label">Total Time</div>
                    <div className="value">{formatDuration(stats.totalDuration)}</div>
                </div>
            </div>

            {/* Call History */}
            <div className="call-history">
                <div className="call-history-header">
                    <h2>Call History</h2>
                </div>

                {callLogs.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon"><InboxIcon /></div>
                        <h3>No call logs yet</h3>
                        <p>Call history will appear here after you make your first call</p>
                    </div>
                ) : (
                    <div className="calls-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Call ID</th>
                                    <th>Time</th>
                                    <th>Duration</th>
                                    <th>Category</th>
                                    <th>Transcript</th>
                                </tr>
                            </thead>
                            <tbody>
                                {callLogs.map((call) => (
                                    <React.Fragment key={call.id}>
                                        <tr>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {call.id}
                                            </td>
                                            <td>{formatTimestamp(call.startTime)}</td>
                                            <td>{formatDuration(call.duration)}</td>
                                            <td>
                                                <span className={`category-tag ${(call.category || 'general').toLowerCase()}`}>
                                                    {categoryLabels[call.category] || 'General'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="expand-btn"
                                                    onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                                                >
                                                    <ChevronIcon expanded={expandedCall === call.id} />
                                                    <span>{expandedCall === call.id ? 'Hide' : 'View'}</span>
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedCall === call.id && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: 0 }}>
                                                    <div className="transcript-expand">
                                                        {call.transcript && call.transcript.length > 0 ? (
                                                            call.transcript.map((msg, idx) => (
                                                                <div key={idx} style={{ marginBottom: '8px' }}>
                                                                    <strong style={{ color: msg.role === 'ai' ? 'var(--primary-light)' : 'var(--secondary)' }}>
                                                                        {msg.role === 'ai' ? 'Praveen: ' : 'User: '}
                                                                    </strong>
                                                                    {msg.text}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <em style={{ color: 'var(--text-muted)' }}>No transcript available</em>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
