import db from '../config/db.js';
import drive from '../config/googleDrive.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerClient = async (req, res) => {
    const { name, password } = req.body;
    const { eventId } = req.params;

    if (!name || !password) return res.status(400).json({ error: "Name and password required." });

    db.get(`SELECT id FROM clients WHERE event_id = ? AND name = ?`, [eventId, name], async (err, row) => {
        if (err) return res.status(500).json({ error: "Database error." });
        if (row) return res.status(400).json({ error: "Name already taken for this event." });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO clients (event_id, name, password) VALUES (?, ?, ?)`,
            [eventId, name, hashedPassword],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                
                const token = jwt.sign({ id: this.lastID, name, eventId }, process.env.JWT_SECRET, { expiresIn: '12h' });
                res.cookie('client_token', token, { httpOnly: true, secure: false, maxAge: 12 * 3600000 });
                res.json({ success: true });
            }
        );
    });
};

export const loginClient = (req, res) => {
    const { name, password } = req.body;
    const { eventId } = req.params;

    db.get(`SELECT * FROM clients WHERE event_id = ? AND name = ?`, [eventId, name], async (err, client) => {
        if (err || !client) return res.status(400).json({ error: "Invalid credentials." });

        const valid = await bcrypt.compare(password, client.password);
        if (!valid) return res.status(400).json({ error: "Invalid credentials." });

        const token = jwt.sign({ id: client.id, name: client.name, eventId }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.cookie('client_token', token, { httpOnly: true, secure: false, maxAge: 12 * 3600000 });
        res.json({ success: true });
    });
};

export const verifyClientAuth = (req, res) => {
    // If the middleware passes, they are authenticated
    res.json({ authenticated: true, client: req.client });
};

export const getGallery = (req, res) => {
    const clientId = req.client.id;
    
    db.get(`
        SELECT c.id as client_id, c.name as client_name, c.event_id, e.name as event_name, e.drive_folder_id 
        FROM clients c 
        JOIN events e ON c.event_id = e.id 
        WHERE c.id = ?
    `, [clientId], async (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Gallery not found." });

        try {
            const driveRes = await drive.files.list({
                q: `'${row.drive_folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png')`,
                fields: 'files(id, name, thumbnailLink, webContentLink)',
                pageSize: 1000
            });

            db.all(`SELECT photo_id FROM selections WHERE client_id = ?`, [row.client_id], (err, selectionRows) => {
                const selectedSet = new Set(selectionRows ? selectionRows.map(r => r.photo_id) : []);

                const photos = driveRes.data.files ? driveRes.data.files.map(file => ({
                    id: file.id,
                    name: file.name,
                    thumbnailLink: `/api/images/${file.id}/thumbnail`,
                    webContentLink: `/api/images/${file.id}`,
                    selected: selectedSet.has(file.id)
                })) : [];

                res.json({
                    event: { id: row.event_id, name: row.event_name },
                    client: { name: row.client_name, id: row.client_id },
                    photos
                });
            });
        } catch (driveErr) {
            console.error("Drive Error:", driveErr.message);
            res.status(500).json({ error: "Failed connecting with Google Drive." });
        }
    });
};

export const selectPhoto = (req, res) => {
    const { photo_id, selected } = req.body;
    const clientId = req.client.id;
        
    if (selected) {
        db.run(`INSERT INTO selections (client_id, photo_id) VALUES (?, ?) ON CONFLICT DO NOTHING`, [clientId, photo_id], (err) => {
            res.json({ success: !err });
        });
    } else {
        db.run(`DELETE FROM selections WHERE client_id = ? AND photo_id = ?`, [clientId, photo_id], (err) => {
            res.json({ success: !err });
        });
    }
};
