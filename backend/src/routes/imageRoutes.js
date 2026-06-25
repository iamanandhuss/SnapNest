import express from 'express';
import { proxyImage, proxyThumbnail } from '../controllers/imageController.js';

const router = express.Router();

// Public routes for proxying images, but you could add auth middleware if needed
router.get('/:fileId', proxyImage);
router.get('/:fileId/thumbnail', proxyThumbnail);

export default router;
