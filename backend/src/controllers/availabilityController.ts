import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'Missing userId query parameter' });
      return;
    }

    const availability = await prisma.availability.findUnique({
      where: { userId },
      include: {
        days: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    res.json(availability || null);
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, timeZone, days } = req.body;

    if (!userId || !timeZone || !Array.isArray(days)) {
      res.status(400).json({ error: 'Missing required fields: userId, timeZone, days (array)' });
      return;
    }

    // Validate time format (basic check)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const day of days) {
      if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) {
        res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
        return;
      }
      if (day.dayOfWeek < 0 || day.dayOfWeek > 6) {
        res.status(400).json({ error: 'Invalid dayOfWeek (0-6)' });
        return;
      }
    }

    // Transaction: Upsert Availability -> Delete old days -> Create new days
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure availability record exists
      const availability = await tx.availability.upsert({
        where: { userId },
        update: { timeZone },
        create: { userId, timeZone },
      });

      // 2. Delete existing day rules
      await tx.dayAvailability.deleteMany({
        where: { availabilityId: availability.id },
      });

      // 3. Insert new rules
      if (days.length > 0) {
        await tx.dayAvailability.createMany({
          data: days.map((day: any) => ({
            availabilityId: availability.id,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime, // Fixed typo in previous plan
          })),
        });
      }

      return tx.availability.findUnique({
        where: { id: availability.id },
        include: { days: { orderBy: { dayOfWeek: 'asc' } } },
      });
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
