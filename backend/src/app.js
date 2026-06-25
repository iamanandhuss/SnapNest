import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/adminRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { authorizeDrive } from './config/googleDrive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Try to authorize Google Drive
authorizeDrive();

// In production, we will serve the Vite built frontend
// Since app.js is in src/, dist is at ../../frontend/dist
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/images', imageRoutes);

// Single Page Application Fallback Routing for Vite
app.get(/^.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

export default app;
