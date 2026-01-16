import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query; // 'upcoming' | 'past'
    const now = new Date();

    let whereClause: any = {};
    let orderBy: any = {};

    if (type === 'upcoming') {
      whereClause = {
        startDateTime: {
          gte: now,
        },
      };
      orderBy = { startDateTime: 'asc' };
    } else if (type === 'past') {
      whereClause = {
        startDateTime: {
          lt: now,
        },
      };
      orderBy = { startDateTime: 'desc' };
    } else {
      // Default or all? Requirement implies specific filters.
      // Let's default to all ordered by date desc if no type specified, or strict validation.
      // Requirement: "GET /api/meetings?type=upcoming"
      // If no type, let's return all, ordered by recent.
      orderBy = { startDateTime: 'desc' };
    }

    const meetings = await prisma.meeting.findMany({
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
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: id as string },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id: id as string },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json(updatedMeeting);
  } catch (error) {
    next(error);
  }
};
