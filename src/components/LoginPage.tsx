import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-70a0f2b1`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // Get existing users from local storage
            const users = JSON.parse(localStorage.getItem('night_thoughts_users') || '{}');
            const lowerUsername = username.toLowerCase();

            if (isLogin) {
                // Login logic
                const user = users[lowerUsername];
                if (!user || user.password !== password) {
                    throw new Error('Invalid username or password');
                }
                login(user.username, user.displayName);
            } else {
                // Register logic
                if (users[lowerUsername]) {
                    throw new Error('Username already taken');
                }

                if (username.length < 3) throw new Error('Username must be at least 3 characters');
                if (password.length < 4) throw new Error('Password must be at least 4 characters');

                // Save new user
                users[lowerUsername] = {
                    username: lowerUsername,
                    displayName: username, // Preserve original casing for display
                    password: password // In a real app never store passwords plainly! 
                };
                localStorage.setItem('night_thoughts_users', JSON.stringify(users));

                login(username, username);
            }

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2a 100%)' }}>
            {/* Animated stars background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 230px 80px, white, transparent),
            radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent)
          `,
                    backgroundSize: '400px 300px',
                    animation: 'twinkle 4s ease-in-out infinite',
                }}
            />
            <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

            <div
                className="relative w-full max-w-md backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.15)',
                    animation: 'float 6s ease-in-out infinite',
                }}
            >
                {/* Decorative glow */}
                <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
                />

                {/* Header */}
                <div className="text-center mb-8 relative">
                    <div className="text-5xl mb-3">🌙</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Night Thoughts</h1>
                    <p className="text-gray-400 text-sm">Share your midnight musings</p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-gray-800/50 rounded-xl p-1 mb-6 relative">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isLogin
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${!isLogin
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            placeholder="Enter your username"
                            required
                            minLength={3}
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            placeholder="Enter your password"
                            required
                            minLength={4}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                            boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Footer links */}
                <div className="mt-6 text-center relative">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-gray-500 text-xs hover:text-gray-400 transition-colors"
                    >
                        Admin Panel
                    </button>
                </div>
            </div>
        </div>
    );
}
