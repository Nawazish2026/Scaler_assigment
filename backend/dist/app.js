"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const eventTypeRoutes_1 = __importDefault(require("./routes/eventTypeRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const app = (0, express_1.default)();
// CORS Configuration - Allow frontend origins
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Allow all in dev, specific domain in prod
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/event-types', eventTypeRoutes_1.default);
app.use('/api/availability', availabilityRoutes_1.default);
app.use('/api/booking', bookingRoutes_1.default);
app.use('/api/meetings', meetingRoutes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
