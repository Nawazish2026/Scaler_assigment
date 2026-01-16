import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

import eventTypeRoutes from './routes/eventTypeRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import bookingRoutes from './routes/bookingRoutes';
import meetingRoutes from './routes/meetingRoutes';

const app = express();

// CORS Configuration - Allow frontend origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all in dev, specific domain in prod
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
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
