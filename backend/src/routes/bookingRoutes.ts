import { Router } from 'express';
import { getEventBySlug, getAvailableSlots, bookMeeting } from '../controllers/bookingController';

const router = Router();

router.get('/event/:slug', getEventBySlug);
router.get('/event/:slug/slots', getAvailableSlots);
router.post('/event/:slug/book', bookMeeting);

export default router;
