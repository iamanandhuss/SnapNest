import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            navigate('/admin/dashboard');
        } else {
            alert('Invalid login credentials');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
                <h1 className="mb-6 text-center text-2xl font-black text-slate-900">Admin Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="w-full rounded-lg border p-2.5 outline-none focus:border-slate-800"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border p-2.5 outline-none focus:border-slate-800"
                        />
                    </div>
                    <button type="submit" className="w-full rounded-lg bg-slate-900 p-3 font-bold text-white hover:bg-slate-800">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
