import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const navigate = useNavigate();

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/events');
            if (res.status === 401) return navigate('/admin');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setEvents(data);
            } else {
                console.error("Failed to fetch events:", data);
                setEvents([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]);
        }
    }, [navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEvents();
    }, [fetchEvents]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/admin/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: title, drive_url: url })
        });
        if (res.ok) {
            setTitle('');
            setUrl('');
            fetchEvents();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between border-b pb-4">
                    <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
                    <button onClick={async () => { await fetch('/api/admin/logout', {method: 'POST'}); navigate('/admin'); }} className="rounded-lg bg-rose-50 px-4 py-2 font-bold text-rose-600 hover:bg-rose-100">
                        Logout
                    </button>
                </div>

                <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Create Event</h2>
                    <form onSubmit={handleCreate} className="flex gap-4">
                        <input required placeholder="Event Name (e.g. Akhil & Priya Wedding)" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 rounded-lg border p-2 text-sm outline-none" />
                        <input required placeholder="Google Drive Folder URL or ID" value={url} onChange={e => setUrl(e.target.value)} className="flex-1 rounded-lg border p-2 text-sm outline-none" />
                        <button type="submit" className="rounded-lg bg-slate-900 px-6 font-bold text-white hover:bg-slate-800">Create</button>
                    </form>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map(ev => (
                        <div key={ev.id} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md">
                            <div>
                                <h3 className="mb-2 text-xl font-bold text-slate-900">{ev.name}</h3>
                                <p className="text-sm text-slate-500">Created: {new Date(ev.created_at).toLocaleDateString()}</p>
                                <p className="text-sm text-slate-500">Clients shared: {ev.client_count}</p>
                            </div>
                            <Link to={`/admin/events/${ev.id}`} className="mt-4 block rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-100">
                                Manage Event
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
