import express from 'express';
import { authenticateClient } from '../middleware/auth.js';
import { getGallery, selectPhoto, registerClient, loginClient, verifyClientAuth } from '../controllers/galleryController.js';

const router = express.Router();

router.post('/:eventId/register', registerClient);
router.post('/:eventId/login', loginClient);

router.get('/verify', authenticateClient, verifyClientAuth);
router.get('/data', authenticateClient, getGallery);
router.post('/select', authenticateClient, selectPhoto);

export default router;
