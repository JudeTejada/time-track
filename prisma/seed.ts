import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startDate = new Date('2025-01-21');
  const currentDate = new Date();
  const entries = [];

  for (
    let date = startDate;
    date <= currentDate;
    date.setDate(date.getDate() + 1)
  ) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Check if it's January 29th
    const isJan29 = date.getMonth() === 0 && date.getDate() === 29;

    entries.push({
      startTime: new Date(new Date(date).setHours(8, 0, 0, 0)),
      endTime: new Date(new Date(date).setHours(17, 0, 0, 0)),
      lunchTime: 60,
      isHoliday: isJan29,
      holidayName: isJan29 ? 'Chinese New Year' : null,
      date: new Date(date),
      createdAt: new Date(date),
      updatedAt: new Date(date)
    });
  }

  await prisma.timeEntry.createMany({
    data: entries
  });

  console.log(`Created ${entries.length} time entries`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
