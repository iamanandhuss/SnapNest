import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth: jwtClient });

const folders = ['1IKISMD5hJJDYHgVbaCTulBzZZ035iDZz', '1KNAtx7plDIpG2MW31EWNyoQSB2-X6Yhz'];

(async () => {
    for (const folderId of folders) {
        console.log(`\n--- Testing folder: ${folderId} ---`);
        try {
            const folder = await drive.files.get({ fileId: folderId, fields: 'id, name' });
            console.log("✅ Folder found! Name:", folder.data.name);

            const filesRes = await drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'files(id, name, mimeType, thumbnailLink)'
            });
            console.log(`✅ Total files found inside: ${filesRes.data.files.length}`);
            if (filesRes.data.files.length > 0) {
                 filesRes.data.files.forEach(f => {
                     console.log(`  - ${f.name} (${f.mimeType}) | thumbnail: ${!!f.thumbnailLink}`);
                 });
            }
        } catch (err) {
            console.error("❌ Error:", err.message);
        }
    }
})();
