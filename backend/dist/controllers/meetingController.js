"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMeeting = exports.getMeetings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getMeetings = async (req, res, next) => {
    try {
        const { type } = req.query; // 'upcoming' | 'past'
        const now = new Date();
        let whereClause = {};
        let orderBy = {};
        if (type === 'upcoming') {
            whereClause = {
                startDateTime: {
                    gte: now,
                },
            };
            orderBy = { startDateTime: 'asc' };
        }
        else if (type === 'past') {
            whereClause = {
                startDateTime: {
                    lt: now,
                },
            };
            orderBy = { startDateTime: 'desc' };
        }
        else {
            // Default or all? Requirement implies specific filters.
            // Let's default to all ordered by date desc if no type specified, or strict validation.
            // Requirement: "GET /api/meetings?type=upcoming"
            // If no type, let's return all, ordered by recent.
            orderBy = { startDateTime: 'desc' };
        }
        const meetings = await prisma_1.default.meeting.findMany({
            where: whereClause,
            orderBy,
            include: {
                eventType: {
                    select: {
                        name: true,
                        durationMinutes: true,
                        slug: true,
                    }
                }
            }
        });
        res.json(meetings);
    }
    catch (error) {
        next(error);
    }
};
exports.getMeetings = getMeetings;
const cancelMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: id },
        });
        if (!meeting) {
            res.status(404).json({ error: 'Meeting not found' });
            return;
        }
        const updatedMeeting = await prisma_1.default.meeting.update({
            where: { id: id },
            data: {
                status: 'CANCELLED',
            },
        });
        res.json(updatedMeeting);
    }
    catch (error) {
        next(error);
    }
};
exports.cancelMeeting = cancelMeeting;
