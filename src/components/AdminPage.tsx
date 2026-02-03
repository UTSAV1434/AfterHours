import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Timings {
    postingWindowStart: number;
    postingWindowEnd: number;
    nightModeStart: number;
    nightModeEnd: number;
}

export function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [timings, setTimings] = useState<Timings>({
        postingWindowStart: 0,
        postingWindowEnd: 5,
        nightModeStart: 0,
        nightModeEnd: 6,
    });
    const navigate = useNavigate();

    const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-70a0f2b1`;

    const formatHour = (hour: number) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour < 12) return `${hour} AM`;
        return `${hour - 12} PM`;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (password !== 'apyx123') {
                throw new Error('Invalid password');
            }

            setIsAuthenticated(true);
            fetchTimings();
        } catch (err) {
            setAuthError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchTimings = () => {
        const stored = localStorage.getItem('night_thoughts_timings');
        if (stored) {
            try {
                setTimings(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse timings', e);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            localStorage.setItem('night_thoughts_timings', JSON.stringify(timings));

            // Dispatch a custom event so App.tsx can react immediately
            window.dispatchEvent(new Event('timingsUpdated'));

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving timings:', err);
            alert('Failed to save timings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2a 100%)' }}>
                <div
                    className="relative w-full max-w-md backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-3">⚙️</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                        <p className="text-gray-400 text-sm">Enter admin password to continue</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                placeholder="Admin password"
                                required
                            />
                        </div>

                        {authError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                                {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                                boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                            }}
                        >
                            {loading ? 'Verifying...' : 'Access Admin Panel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Back to Home
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2a 100%)' }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚙️</span>
                        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                        ← Back
                    </button>
                </div>

                {/* Timing Settings Card */}
                <div
                    className="backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <span>🕐</span> App Timing Settings
                    </h2>

                    {/* Posting Window */}
                    <div className="mb-8 p-5 rounded-2xl bg-gray-800/30 border border-gray-700/30">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span>✍️</span> Posting Window
                            <span className="text-xs text-gray-500 font-normal ml-2">(When users can create posts)</span>
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Start Time</span>
                                    <span className="text-indigo-400 font-medium">{formatHour(timings.postingWindowStart)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="23"
                                    value={timings.postingWindowStart}
                                    onChange={(e) => setTimings({ ...timings, postingWindowStart: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>End Time</span>
                                    <span className="text-indigo-400 font-medium">{formatHour(timings.postingWindowEnd)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="23"
                                    value={timings.postingWindowEnd}
                                    onChange={(e) => setTimings({ ...timings, postingWindowEnd: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Night Mode Background */}
                    <div className="mb-8 p-5 rounded-2xl bg-gray-800/30 border border-gray-700/30">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span>🌙</span> Night Mode Background
                            <span className="text-xs text-gray-500 font-normal ml-2">(Starry sky vs Video background)</span>
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Night Mode Start</span>
                                    <span className="text-purple-400 font-medium">{formatHour(timings.nightModeStart)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="23"
                                    value={timings.nightModeStart}
                                    onChange={(e) => setTimings({ ...timings, nightModeStart: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Night Mode End</span>
                                    <span className="text-purple-400 font-medium">{formatHour(timings.nightModeEnd)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="23"
                                    value={timings.nightModeEnd}
                                    onChange={(e) => setTimings({ ...timings, nightModeEnd: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                            background: saveSuccess
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                            boxShadow: saveSuccess
                                ? '0 10px 30px -10px rgba(16, 185, 129, 0.5)'
                                : '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                        }}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <span>✓</span> Saved Successfully!
                            </>
                        ) : (
                            <>
                                <span>💾</span> Save Changes
                            </>
                        )}
                    </button>

                    {/* Info Note */}
                    <p className="mt-4 text-xs text-gray-500 text-center">
                        Changes will take effect immediately for all users after saving.
                    </p>
                </div>
            </div>
        </div>
    );
}
