import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, LogIn, UserPlus } from 'lucide-react';

export default function ClientAuth() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'register'
                ? `/api/gallery/${eventId}/register`
                : `/api/gallery/${eventId}/login`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                navigate('/gallery');
            } else {
                setError(data.error || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <Camera size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Photo Gallery</h1>
                    <p className="mt-2 text-slate-400">
                        {mode === 'login'
                            ? 'Sign in to view and select your photos'
                            : 'Create an account to get started'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
                    {/* Mode Toggle */}
                    <div className="mb-6 flex rounded-lg bg-white/5 p-1">
                        <button
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all ${
                                mode === 'login'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <LogIn size={16} /> Sign In
                        </button>
                        <button
                            onClick={() => { setMode('register'); setError(''); }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all ${
                                mode === 'register'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <UserPlus size={16} /> Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-white/30 focus:bg-white/10"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-white/30 focus:bg-white/10"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-white py-3 font-bold text-slate-900 transition-all hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    {mode === 'login'
                        ? "Don't have an account? Click Create Account above."
                        : "Already have an account? Click Sign In above."}
                </p>
            </div>
        </div>
    );
}
