import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image } from 'lucide-react';

export default function ClientFavorites() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch(`/api/admin/clients/${clientId}/favorites`);
                if (res.status === 401) {
                    navigate('/admin');
                    return;
                }
                if (!res.ok) {
                    throw new Error('Failed to fetch client favorites');
                }
                const data = await res.json();
                setClient(data.client);
                setFavorites(data.favorites || []);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [clientId, navigate]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading favorites...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    if (!client) return <div className="flex h-screen items-center justify-center">Client not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <button 
                    onClick={() => navigate(`/admin/events/${client.event_id}`)} 
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={20} /> Back to Event
                </button>

                <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{client.name}'s Favorites</h1>
                            <p className="mt-2 text-slate-600">
                                Event ID: {client.event_id} · Selected {favorites.length} photos
                            </p>
                        </div>
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-500">
                            <Image size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-slate-900">Favorite Photos</h2>
                    {favorites.length === 0 ? (
                        <p className="text-slate-600">This client has not favorited any photos yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {favorites.map((photo) => (
                                <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                                    {photo.thumbnailLink ? (
                                        <img src={photo.thumbnailLink} alt={photo.name} className="h-48 w-full object-cover" />
                                    ) : (
                                        <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-xs text-slate-500">No preview</span>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{photo.name}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
