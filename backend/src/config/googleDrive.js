import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth: jwtClient });

export const authorizeDrive = async () => {
    try {
        await jwtClient.authorize();
        console.log('Google service account authorized.');
    } catch (err) {
        console.error('Google auth failed. Ensure the service account has access to target Drive folders', err);
    }
};

export default drive;
