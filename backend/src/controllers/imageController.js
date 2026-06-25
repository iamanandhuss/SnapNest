import drive from '../config/googleDrive.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '../../../image-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

/**
 * Serves a Drive file — from disk cache if available, otherwise downloads from Drive
 * and caches simultaneously via manual data events (no double-pipe issue).
 */
async function serveFile(fileId, res) {
    const cachedPath = path.join(CACHE_DIR, `${fileId}.jpg`);

    // ✅ Serve instantly from cache on subsequent requests
    if (fs.existsSync(cachedPath)) {
        res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
        return fs.createReadStream(cachedPath).pipe(res);
    }

    // 🌐 First request: download from Drive
    const driveRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });

    const cacheStream = fs.createWriteStream(cachedPath);
    const stream = driveRes.data;

    // Manually tee the stream into both the HTTP response and the disk cache
    stream.on('data', (chunk) => {
        res.write(chunk);
        cacheStream.write(chunk);
    });

    stream.on('end', () => {
        res.end();
        cacheStream.end();
        console.log(`✅ Cached: ${fileId}`);
    });

    stream.on('error', (err) => {
        console.error(`❌ Stream error for ${fileId}:`, err.message);
        cacheStream.destroy();
        // Delete incomplete cache file
        if (fs.existsSync(cachedPath)) fs.unlinkSync(cachedPath);
        if (!res.headersSent) res.status(500).end();
    });
}

// GET /api/images/:fileId/thumbnail
export const proxyThumbnail = async (req, res) => {
    try {
        await serveFile(req.params.fileId, res);
    } catch (err) {
        console.error('Thumbnail error:', err.message);
        if (!res.headersSent) res.status(404).json({ error: 'Image not found' });
    }
};

// GET /api/images/:fileId  (full size for lightbox)
export const proxyImage = async (req, res) => {
    try {
        await serveFile(req.params.fileId, res);
    } catch (err) {
        console.error('Image proxy error:', err.message);
        if (!res.headersSent) res.status(404).json({ error: 'Image not found' });
    }
};
