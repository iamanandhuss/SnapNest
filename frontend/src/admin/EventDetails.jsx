import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Cog, Image, Link2, Copy, Check, Trash2 } from 'lucide-react';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [tab, setTab] = useState('photos');
    const [photos, setPhotos] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const fetchEventDetails = useCallback(async () => {
        try {
            const eventRes = await fetch(`/api/admin/events/${id}`);
            if (eventRes.status === 401) return navigate('/admin');
            
            const eventData = await eventRes.json();
            setEvent(eventData);

            // Fetch photos from Drive folder
            const photosRes = await fetch(`/api/admin/events/${id}/photos`);
            if (photosRes.ok) {
                const photosData = await photosRes.json();
                setPhotos(photosData || []);
            } else {
                setPhotos([]);
            }

            // Fetch clients for this event
            const clientsRes = await fetch(`/api/admin/events/${id}/clients`);
            if (clientsRes.ok) {
                const clientsData = await clientsRes.json();
                setClients(clientsData || []);
            }
        } catch (err) {
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEventDetails();
    }, [fetchEventDetails]);

    const copyInvitationLink = () => {
        const link = `${window.location.origin}/event/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeleteClient = async (clientId) => {
        if (!confirm('Remove this client and all their selections?')) return;
        try {
            const res = await fetch(`/api/admin/clients/${clientId}`, { method: 'DELETE' });
            if (res.ok) fetchEventDetails();
        } catch (err) {
            console.error('Error deleting client:', err);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!event) return <div className="flex h-screen items-center justify-center">Event not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <button onClick={() => navigate('/admin/dashboard')} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{event.name}</h1>
                            <p className="mt-2 text-slate-600">Event ID: {event.id}</p>
                        </div>
                        <button
                            onClick={copyInvitationLink}
                            className={`flex items-center gap-2 rounded-lg px-5 py-3 font-bold transition-all ${
                                copied
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Link Copied!' : 'Copy Invitation Link'}
                        </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
                        <Link2 size={16} className="text-slate-500" />
                        <code className="text-sm text-slate-600 select-all">{window.location.origin}/event/{id}</code>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-4 border-b border-slate-200">
                    <button
                        onClick={() => setTab('photos')}
                        className={`flex items-center gap-2 px-4 py-3 font-bold ${
                            tab === 'photos'
                                ? 'border-b-2 border-slate-900 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Image size={18} /> Photos ({photos.length})
                    </button>
                    <button
                        onClick={() => setTab('users')}
                        className={`flex items-center gap-2 px-4 py-3 font-bold ${
                            tab === 'users'
                                ? 'border-b-2 border-slate-900 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Users size={18} /> Clients ({clients.length})
                    </button>
                    <button
                        onClick={() => setTab('settings')}
                        className={`flex items-center gap-2 px-4 py-3 font-bold ${
                            tab === 'settings'
                                ? 'border-b-2 border-slate-900 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Cog size={18} /> Settings
                    </button>
                </div>

                {/* Photos Tab */}
                {tab === 'photos' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold text-slate-900">Event Photos</h2>
                        {photos.length === 0 ? (
                            <p className="text-slate-600">No photos found in this event's Drive folder.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="overflow-hidden rounded-lg border border-slate-200">
                                        {photo.thumbnailLink ? (
                                            <img src={photo.thumbnailLink} alt={photo.name} className="h-40 w-full object-cover" />
                                        ) : (
                                            <div className="h-40 w-full bg-slate-100 flex items-center justify-center">
                                                <span className="text-xs text-slate-500">No preview</span>
                                            </div>
                                        )}
                                        <p className="p-2 text-xs font-semibold text-slate-700 truncate">{photo.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {tab === 'users' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold text-slate-900">Registered Clients</h2>
                        <p className="mb-4 text-sm text-slate-500">
                            Clients who have registered using the invitation link will appear here.
                        </p>
                        {clients.length === 0 ? (
                            <p className="text-slate-600">No clients have registered yet. Share the invitation link above.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {clients.map((client) => (
                                    <div key={client.id} className="rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900">{client.name}</p>
                                                <p className="text-sm text-slate-600">Selected: {client.selection_count || 0} photos</p>
                                                <p className="mt-1 text-xs text-slate-400">Joined: {new Date(client.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClient(client.id);
                                                }}
                                                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                                title="Remove client"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/admin/clients/${client.id}/favorites`)}
                                            className="mt-4 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                        >
                                            View Favorites
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {tab === 'settings' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold text-slate-900">Event Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600">Drive Folder ID</label>
                                <input type="text" value={event.drive_folder_id} disabled className="mt-1 w-full rounded-lg border bg-slate-50 p-2 text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600">Created</label>
                                <input type="text" value={new Date(event.created_at).toLocaleString()} disabled className="mt-1 w-full rounded-lg border bg-slate-50 p-2 text-slate-700" />
                            </div>
                            <button className="mt-6 rounded-lg bg-rose-50 px-4 py-2 font-bold text-rose-600 hover:bg-rose-100">
                                Delete Event
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
