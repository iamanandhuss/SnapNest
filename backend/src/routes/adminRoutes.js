import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import {
    login,
    logout,
    verifyAuth,
    getEvents,
    createEvent,
    getEvent,
    getEventPhotos,
    getEventClients,
    deleteClient,
    getClientFavorites
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', authenticateAdmin, verifyAuth);

router.get('/events', authenticateAdmin, getEvents);
router.post('/events', authenticateAdmin, createEvent);
router.get('/events/:id', authenticateAdmin, getEvent);
router.get('/events/:id/photos', authenticateAdmin, getEventPhotos);

router.get('/events/:id/clients', authenticateAdmin, getEventClients);
router.delete('/clients/:id', authenticateAdmin, deleteClient);
router.get('/clients/:id/favorites', authenticateAdmin, getClientFavorites);

export default router;
