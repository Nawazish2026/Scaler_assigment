"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = exports.updateEventType = exports.createEventType = exports.getAllEventTypes = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllEventTypes = async (req, res, next) => {
    try {
        // For now, assuming we want all event types. 
        // In a real app with auth, filtering by req.user.id would happen here.
        // If a userId query param is passed, use it.
        const userId = req.query.userId;
        const whereClause = userId ? { userId } : {};
        const eventTypes = await prisma_1.default.eventType.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        res.json(eventTypes);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllEventTypes = getAllEventTypes;
const createEventType = async (req, res, next) => {
    try {
        let { name, durationMinutes, slug: providedSlug, userId } = req.body;
        if (!name || !durationMinutes) {
            res.status(400).json({ error: 'Missing required fields: name, durationMinutes' });
            return;
        }
        // If no userId is provided, use the first user in the database (demo mode)
        if (!userId) {
            const defaultUser = await prisma_1.default.user.findFirst();
            if (!defaultUser) {
                res.status(500).json({ error: 'No default user found. Please seed the database.' });
                return;
            }
            userId = defaultUser.id;
        }
        if (durationMinutes <= 0) {
            res.status(400).json({ error: 'Duration must be positive' });
            return;
        }
        // Generate slug if not provided
        let slug = providedSlug;
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            res.status(400).json({ error: 'Invalid slug format' });
            return;
        }
        // Check uniqueness
        const existing = await prisma_1.default.eventType.findUnique({
            where: { slug },
        });
        if (existing) {
            res.status(409).json({ error: 'Slug already exists' });
            return;
        }
        const eventType = await prisma_1.default.eventType.create({
            data: {
                name,
                durationMinutes: Number(durationMinutes),
                slug,
                userId,
            },
        });
        res.status(201).json(eventType);
    }
    catch (error) {
        next(error);
    }
};
exports.createEventType = createEventType;
const updateEventType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, durationMinutes, slug } = req.body;
        // Check existence
        const existing = await prisma_1.default.eventType.findUnique({ where: { id: id } });
        if (!existing) {
            res.status(404).json({ error: 'Event type not found' });
            return;
        }
        if (slug) {
            // Validate slug format
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                res.status(400).json({ error: 'Invalid slug format' });
                return;
            }
            const duplicate = await prisma_1.default.eventType.findUnique({ where: { slug } });
            if (duplicate && duplicate.id !== id) {
                res.status(409).json({ error: 'Slug already taken' });
                return;
            }
        }
        const updated = await prisma_1.default.eventType.update({
            where: { id: id },
            data: {
                name,
                durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
                slug,
            },
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateEventType = updateEventType;
const deleteEventType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.eventType.findUnique({ where: { id: id } });
        if (!existing) {
            res.status(404).json({ error: 'Event type not found' });
            return;
        }
        await prisma_1.default.eventType.delete({ where: { id: id } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEventType = deleteEventType;
