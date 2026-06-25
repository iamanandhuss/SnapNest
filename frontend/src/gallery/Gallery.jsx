import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Heart, LogOut } from 'lucide-react';

export default function Gallery() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [event, setEvent] = useState(null);
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchGallery = useCallback(async () => {
        try {
            // First verify auth
            const verifyRes = await fetch('/api/gallery/verify');
            if (verifyRes.status === 401) {
                navigate('/');
                return;
            }

            // Fetch gallery data
            const res = await fetch('/api/gallery/data');
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
                setClientName(data.client?.name || '');
                
                // Transform photos
                const transformedPhotos = (data.photos || []).map(p => {
                    return {
                        src: p.webContentLink, // Full size proxy
                        thumbnailSrc: p.thumbnailLink, // Thumbnail proxy
                        width: 1024,
                        height: 768,
                        ...p
                    };
                });
                setPhotos(transformedPhotos);

                // Pre-select any previously selected photos
                const preSelected = new Set();
                transformedPhotos.forEach((p, idx) => {
                    if (p.selected) preSelected.add(idx);
                });
                setSelected(preSelected);
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGallery();
    }, [fetchGallery]);

    const toggleSelect = async (idx) => {
        const photo = photos[idx];
        const isSelected = selected.has(idx);
        const newSelected = new Set(selected);
        
        if (isSelected) {
            newSelected.delete(idx);
        } else {
            newSelected.add(idx);
        }
        
        // Optimistic UI update
        setSelected(newSelected);

        try {
            const res = await fetch('/api/gallery/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo_id: photo.id, selected: !isSelected })
            });
            if (!res.ok) throw new Error('Failed to update selection');
        } catch (err) {
            console.error('Error saving selection:', err);
            alert('Failed to save selection. Please try again.');
            // Revert state
            setSelected(selected);
        }
    };

    const handleSelectAll = async () => {
        const newSelected = new Set(photos.map((_, i) => i));
        setSelected(newSelected);
        
        // Save to backend in parallel
        try {
            await Promise.all(photos.map(photo => 
                fetch('/api/gallery/select', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photo_id: photo.id, selected: true })
                })
            ));
        } catch (err) {
            console.error('Error selecting all:', err);
            alert('Some selections failed to save.');
        }
    };

    const handleClearSelection = async () => {
        setSelected(new Set());
        
        try {
            await Promise.all(photos.map(photo => 
                fetch('/api/gallery/select', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photo_id: photo.id, selected: false })
                })
            ));
        } catch (err) {
            console.error('Error clearing selections:', err);
            alert('Some selections failed to clear.');
        }
    };

    const handleLogout = () => {
        document.cookie = 'client_token=; Max-Age=0; path=/';
        navigate('/');
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading gallery...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{event?.name || 'Photo Gallery'}</h1>
                            <p className="mt-2 text-slate-600">
                                Welcome, <span className="font-semibold">{clientName}</span> · Selected {selected.size}/{photos.length} photos
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Photo Grid */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
                    <div className="relative">
                        {photos.length === 0 ? (
                            <p className="text-center text-slate-600 py-12">No photos available</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {photos.map((photo, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setLightboxIndex(idx);
                                            setLightboxOpen(true);
                                        }}
                                        className={`group relative overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${
                                            selected.has(idx)
                                                ? 'border-red-400 ring-2 ring-red-200'
                                                : 'border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        <img
                                            src={photo.thumbnailSrc || photo.src}
                                            alt={photo.name}
                                            className="h-48 w-full object-cover"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelect(idx);
                                            }}
                                            className={`absolute top-2 right-2 rounded-full p-2 transition-all ${
                                                selected.has(idx)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/80 text-slate-900 opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                            <Heart size={18} fill={selected.has(idx) ? 'currentColor' : 'none'} />
                                        </button>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightbox */}
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={photos.map(p => ({ src: p.src }))}
                    on={{
                        view: ({ index }) => setLightboxIndex(index),
                    }}
                    toolbar={{
                        buttons: [
                            <button
                                key="like"
                                type="button"
                                className="yarl__button"
                                onClick={() => toggleSelect(lightboxIndex)}
                            >
                                <Heart 
                                    size={24} 
                                    color={selected.has(lightboxIndex) ? '#ef4444' : '#ffffff'} 
                                    fill={selected.has(lightboxIndex) ? '#ef4444' : 'none'} 
                                />
                            </button>,
                            "close"
                        ],
                    }}
                />

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end">
                    <div className="flex gap-3">
                        <button
                            onClick={handleSelectAll}
                            className="rounded-lg bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-800"
                        >
                            Select All
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="rounded-lg border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
