import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

import eventTypeRoutes from './routes/eventTypeRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import bookingRoutes from './routes/bookingRoutes';
import meetingRoutes from './routes/meetingRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/meetings', meetingRoutes);

// Error handling
app.use(errorHandler);

export default app;
