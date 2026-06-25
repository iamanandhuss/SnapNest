import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import drive from '../config/googleDrive.js';

export const login = (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
        if (err || !admin) return res.status(400).json({ error: "Admin credentials not found." });

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid password." });

        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('admin_token', token, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 12 * 3600000 });
        res.json({ success: true });
    });
};

export const logout = (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
};

export const verifyAuth = (req, res) => {
    res.json({ authenticated: true });
};

export const getEvents = (req, res) => {
    db.all(`
        SELECT e.*, 
               (SELECT COUNT(*) FROM clients WHERE event_id = e.id) as client_count
        FROM events e 
        ORDER BY e.created_at DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createEvent = (req, res) => {
    const { name, drive_url } = req.body;
    const folderIdMatch = drive_url.match(/folders\/([a-zA-Z0-9-_]+)/);
    const driveFolderId = folderIdMatch ? folderIdMatch[1] : drive_url;

    db.run(
        `INSERT INTO events (name, drive_folder_id) VALUES (?, ?)`,
        [name, driveFolderId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
};

export const getEvent = (req, res) => {
    db.get(`SELECT * FROM events WHERE id = ?`, [req.params.id], (err, event) => {
        if (err || !event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    });
};

export const getEventPhotos = async (req, res) => {
    db.get(`SELECT drive_folder_id FROM events WHERE id = ?`, [req.params.id], async (err, event) => {
        if (err || !event) return res.status(404).json({ error: "Event not found" });

        try {
            const driveRes = await drive.files.list({
                q: `'${event.drive_folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png')`,
                fields: 'files(id, name, thumbnailLink, webContentLink)',
                pageSize: 1000
            });
            const photos = driveRes.data.files ? driveRes.data.files.map(file => ({
                id: file.id,
                name: file.name,
                thumbnailLink: `/api/images/${file.id}/thumbnail`,
                webContentLink: `/api/images/${file.id}`
            })) : [];
            res.json(photos);
        } catch (error) {
            console.error("Drive API Error:", error.message);
            res.status(500).json({ error: "Failed to fetch photos from Drive" });
        }
    });
};

export const getEventClients = (req, res) => {
    db.all(`
        SELECT c.*, 
               (SELECT COUNT(*) FROM selections WHERE client_id = c.id) as selection_count
        FROM clients c 
        WHERE c.event_id = ?
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const deleteClient = (req, res) => {
    db.serialize(() => {
        db.run(`DELETE FROM selections WHERE client_id = ?`, [req.params.id]);
        db.run(`DELETE FROM clients WHERE id = ?`, [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
};

export const getClientFavorites = async (req, res) => {
    db.get(`SELECT c.*, e.drive_folder_id FROM clients c JOIN events e ON c.event_id = e.id WHERE c.id = ?`, [req.params.id], async (err, client) => {
        if (err || !client) return res.status(404).json({ error: "Client not found" });
        
        db.all(`SELECT photo_id FROM selections WHERE client_id = ?`, [req.params.id], async (err, selections) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const photoIds = new Set(selections.map(r => r.photo_id));
            try {
                const driveRes = await drive.files.list({
                    q: `'${client.drive_folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png')`,
                    fields: 'files(id, name, thumbnailLink, webContentLink)',
                    pageSize: 1000
                });
                
                const photos = driveRes.data.files
                    ? driveRes.data.files
                        .filter(file => photoIds.has(file.id))
                        .map(file => ({
                            id: file.id,
                            name: file.name,
                            thumbnailLink: `/api/images/${file.id}/thumbnail`,
                            webContentLink: `/api/images/${file.id}`
                        }))
                    : [];
                
                res.json({ client, favorites: photos });
            } catch (error) {
                console.error("Drive API Error:", error.message);
                res.status(500).json({ error: "Failed to fetch photos from Drive" });
            }
        });
    });
};
