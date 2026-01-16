import { PrismaClient, MeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Cleanup existing data
  await prisma.meeting.deleteMany();
  await prisma.dayAvailability.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  // Create User
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Create Availability
  const availability = await prisma.availability.create({
    data: {
      userId: user.id,
      timeZone: 'Asia/Kolkata',
      days: {
        create: [0, 1, 2, 3, 4].map((dayOffset) => ({
          dayOfWeek: dayOffset + 1, // Mon (1) to Fri (5)
          startTime: '09:00',
          endTime: '17:00',
        })),
      },
    },
  });

  console.log(`Created availability for user: ${user.name}`);

  // Create Event Types
  const eventTypes = await Promise.all([
    prisma.eventType.create({
      data: {
        name: 'Coffee Chat',
        durationMinutes: 15,
        slug: 'coffee-chat',
        userId: user.id,
      },
    }),
    prisma.eventType.create({
      data: {
        name: 'Technical Interview',
        durationMinutes: 60,
        slug: 'tech-interview',
        userId: user.id,
      },
    }),
    prisma.eventType.create({
      data: {
        name: 'Consultation',
        durationMinutes: 45,
        slug: 'consultation',
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${eventTypes.length} event types`);

  // Create Meetings
  const today = new Date();

  // Past Meeting
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 1);
  pastDate.setHours(10, 0, 0, 0);
  const pastEndDate = new Date(pastDate);
  pastEndDate.setMinutes(pastDate.getMinutes() + 15);

  const pastMeeting = await prisma.meeting.create({
    data: {
      eventTypeId: eventTypes[0].id,
      inviteeName: 'John Doe',
      inviteeEmail: 'john@example.com',
      startDateTime: pastDate,
      endDateTime: pastEndDate,
      status: MeetingStatus.BOOKED, // Ensure this enum exists in schema
    },
  });

  // Upcoming Meeting
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 1);
  futureDate.setHours(14, 0, 0, 0);
  const futureEndDate = new Date(futureDate);
  futureEndDate.setMinutes(futureDate.getMinutes() + 60);

  const upcomingMeeting = await prisma.meeting.create({
    data: {
      eventTypeId: eventTypes[1].id,
      inviteeName: 'Jane Smith',
      inviteeEmail: 'jane@example.com',
      startDateTime: futureDate,
      endDateTime: futureEndDate,
      status: MeetingStatus.BOOKED,
    },
  });

  console.log(`Created meetings: ${pastMeeting.id} (past), ${upcomingMeeting.id} (upcoming)`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
