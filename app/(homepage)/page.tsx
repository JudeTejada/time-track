import { Suspense } from 'react';
import { Dashboard } from './components/Dashboard';
import { TableSkeleton } from './components/TableSkeleton';
import { TimeEntry } from '@prisma/client';
import prisma from '@/lib/prisma';

const getData = async (): Promise<TimeEntry[]> => {
  // const response = await fetch('/api/time-entries');
  // const data = await response.json();
  // return data;

  const timeEntries = await prisma.timeEntry.findMany({
    orderBy: {
      date: 'asc'
    }
  });

  return timeEntries;
};

export default async function Home() {
  const timeEntries = await getData();

  return (
    <Suspense fallback={<TableSkeleton />}>
      <Dashboard timeEntries={timeEntries} />
    </Suspense>
  );
}
