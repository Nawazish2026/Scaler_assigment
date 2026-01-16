import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const eventType = await prisma.eventType.findUnique({
      where: { slug: slug as string },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!eventType) {
      res.status(404).json({ error: 'Event type not found' });
      return;
    }

    res.json(eventType);
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Missing or invalid date parameter (YYYY-MM-DD)' });
      return;
    }

    // 1. Get Event Type and Owner
    const eventType = await prisma.eventType.findUnique({
      where: { slug: slug as string },
      include: { user: true }
    });

    if (!eventType) {
      res.status(404).json({ error: 'Event type not found' });
      return;
    }

    // 2. Get Host Availability
    const availability = await prisma.availability.findUnique({
      where: { userId: eventType.userId },
      include: { days: true }
    });

    if (!availability) {
      res.status(200).json([]); // No availability configured
      return;
    }

    // 3. Determine Day of Week (0-6)
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    const dayOfWeek = targetDate.getUTCDay(); // Assuming date param is YYYY-MM-DD (UTC-ish)

    // 4. Find Rule for this day
    const dayRule = availability.days.find(d => d.dayOfWeek === dayOfWeek);
    if (!dayRule) {
      res.status(200).json([]); // No availability for this day
      return;
    }

    // 5. Generate Slots
    const slots: string[] = [];
    const duration = eventType.durationMinutes;

    const [startHour, startMin] = dayRule.startTime.split(':').map(Number);
    const [endHour, endMin] = dayRule.endTime.split(':').map(Number);

    // Convert rule to minutes from midnight
    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    // 6. Fetch ALL existing meetings for this HOST (across all their event types)
    // This prevents the host from being double-booked across different event types
    const hostEventTypes = await prisma.eventType.findMany({
      where: { userId: eventType.userId },
      select: { id: true }
    });
    const hostEventTypeIds = hostEventTypes.map(et => et.id);

    // Define query range for the whole day
    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const conflictingMeetings = await prisma.meeting.findMany({
      where: {
        eventTypeId: { in: hostEventTypeIds }, // Check ALL host's event types
        status: 'BOOKED',
        startDateTime: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    // Loop through slots
    for (let time = startTotalMins; time + duration <= endTotalMins; time += duration) { // Simple interval, can allow flexible interval later
      const currentSlotStart = new Date(targetDate);
      currentSlotStart.setUTCHours(Math.floor(time / 60), time % 60, 0, 0);

      const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60000);

      // Check Exists
      const isConflict = conflictingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.startDateTime);
        const meetingEnd = new Date(meeting.endDateTime);

        // Check overlap
        return (currentSlotStart < meetingEnd && currentSlotEnd > meetingStart);
      });

      if (!isConflict) {
        slots.push(currentSlotStart.toISOString());
      }
    }

    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const bookMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { name, email, startDateTime } = req.body;

    if (!name || !email || !startDateTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const eventType = await prisma.eventType.findUnique({
      where: { slug: slug as string }
    });

    if (!eventType) {
      res.status(404).json({ error: 'Event type not found' });
      return;
    }

    // Determine End Time
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + eventType.durationMinutes * 60000);

    // Transactional Create with Overlap Check across ALL host's event types
    await prisma.$transaction(async (tx) => {
      // Get all event types for this host
      const hostEventTypes = await tx.eventType.findMany({
        where: { userId: eventType.userId },
        select: { id: true }
      });
      const hostEventTypeIds = hostEventTypes.map(et => et.id);

      // Check for overlapping meetings across ALL host's event types
      const conflict = await tx.meeting.findFirst({
        where: {
          eventTypeId: { in: hostEventTypeIds }, // Check ALL host's event types
          status: 'BOOKED',
          startDateTime: {
            lt: end,
          },
          endDateTime: {
            gt: start
          }
        }
      });

      if (conflict) {
        throw new Error('Slot already booked');
      }

      const meeting = await tx.meeting.create({
        data: {
          eventTypeId: eventType.id,
          inviteeName: name,
          inviteeEmail: email,
          startDateTime: start,
          endDateTime: end,
          status: 'BOOKED'
        }
      });

      res.status(201).json(meeting);
    });

  } catch (error: any) {
    if (error.message === 'Slot already booked') {
      res.status(409).json({ error: 'Slot already booked' });
    } else {
      next(error);
    }
  }
};
