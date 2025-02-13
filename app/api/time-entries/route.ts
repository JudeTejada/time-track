import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const timeEntries = await prisma.timeEntry.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: body.startTime,
        endTime: body.endTime,
        lunchTime: body.lunchTime,
        isHoliday: body.isHoliday ?? false,
        holidayName: body.holidayName ?? '',
        date: body.date ,
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}