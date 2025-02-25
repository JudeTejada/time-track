'use client';

import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);
import { TimeTrackingPDF } from '@/lib/generatePdf';
import dynamic from 'next/dynamic';

// Update TimeEntry interface
interface TimeEntry {
  id: number;
  date: Date; // Add this line
  startTime: Date;
  endTime: Date;
  lunchTime: number;
  isHoliday: boolean;
  holidayName?: string;
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add this helper at the top of the file after imports
const formatDateToPH = (date: Date) => {
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add these helper functions at the top after imports
const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const groupEntriesByWeek = (entries: TimeEntry[]) => {
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const key = `${year}-W${week}`;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  // Sort entries within each week by date
  Object.keys(grouped).forEach(key => {
    grouped[key].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  return grouped;
};

export function Dashboard({ timeEntries }: { timeEntries: TimeEntry[] }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [open, setOpen] = useState(false);

  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Add this line
    startTime: '',
    endTime: '',
    lunchTime: '',
    isHoliday: false,
    holidayName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: new Date(formData.date),
          startTime: new Date(`${formData.date}T${formData.startTime}`),
          endTime: new Date(`${formData.date}T${formData.endTime}`),
          lunchTime: parseInt(formData.lunchTime),
          isHoliday: formData.isHoliday,
          holidayName: formData.holidayName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add time entry');
      }

      setOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        lunchTime: '',
        holidayName: '',
        isHoliday: false
      });
    } catch (error) {
      console.error('Error adding time entry:', error);
    }
  };

  // Update quick check in
  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    const today = new Date();
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: today,
          startTime: new Date(today.setHours(8, 0, 0, 0)),
          endTime: new Date(today.setHours(17, 0, 0, 0)),
          lunchTime: 60
        })
      });

      router.refresh();

      if (!response.ok) {
        throw new Error('Failed to add time entry');
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className='p-3 md:p-8'>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className='flex items-center justify-between mb-8 flex-col md:flex-row'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Time Tracking Dashboard
        </h1>
        <div className='flex gap-4 flex-col w-full md:flex-row md:justify-end md:w-auto'>
          <Button
            onClick={handleCheckIn}
            variant='secondary'
            disabled={isCheckingIn}
            className='w-full md:w-auto'
          >
            {isCheckingIn ? 'Checking In...' : 'Quick Check In'}
          </Button>
          <PDFDownloadLink
            document={<TimeTrackingPDF entries={timeEntries} />}
            fileName='time-tracking-report.pdf'
            className='w-full md:w-auto'
          >
            {({ loading }) => (
              <Button variant='outline' disabled={loading} className='w-full md:w-auto'>
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='w-full md:w-auto'>Add Time Entry</Button>
            </DialogTrigger>
            <DialogContent className='w-[95vw] max-w-md mx-auto md:w-full'>
              <DialogHeader>
                <DialogTitle>Add New Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <label htmlFor='date' className='text-sm font-medium block'>
                    Date
                  </label>
                  <Input
                    id='date'
                    type='date'
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='startTime' className='text-sm font-medium block'>
                    Start Time
                  </label>
                  <Input
                    id='startTime'
                    type='time'
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='endTime' className='text-sm font-medium block'>
                    End Time
                  </label>
                  <Input
                    id='endTime'
                    type='time'
                    required
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='lunchTime' className='text-sm font-medium block'>
                    Lunch Time (minutes)
                  </label>
                  <Input
                    id='lunchTime'
                    type='number'
                    required
                    value={formData.lunchTime}
                    onChange={handleInputChange}
                    min='0'
                    className='w-full'
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 mb-2'>
                    <input
                      type='checkbox'
                      id='isHoliday'
                      checked={formData.isHoliday}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          isHoliday: e.target.checked
                        }))
                      }
                      className='h-5 w-5'
                    />
                    <label htmlFor='isHoliday' className='text-sm font-medium'>
                      Is Holiday?
                    </label>
                  </div>

                  {formData.isHoliday && (
                    <Input
                      id='holidayName'
                      type='text'
                      placeholder='Holiday Name'
                      value={formData.holidayName}
                      onChange={handleInputChange}
                      className='w-full'
                    />
                  )}
                </div>
                <Button type='submit' className='w-full'>
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='rounded-md border'>
        {Object.entries(groupEntriesByWeek(timeEntries))
          .sort((a, b) => b[0].localeCompare(a[0])) // Sort weeks in descending order
          .map(([weekKey, weekEntries]) => (
            <div key={weekKey} className='mb-8'>
              <h2 className='text-lg font-semibold mb-4 px-4'>
                Week {weekKey}
              </h2>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='whitespace-nowrap'>Date</TableHead>
                      <TableHead className='whitespace-nowrap'>
                        Start Time
                      </TableHead>
                      <TableHead className='whitespace-nowrap'>
                        End Time
                      </TableHead>
                      <TableHead className='whitespace-nowrap'>
                        Lunch Break
                      </TableHead>
                      <TableHead className='whitespace-nowrap'>
                        Total Hours
                      </TableHead>
                      <TableHead className='whitespace-nowrap'>
                        Holiday
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekEntries.map(entry => {
                      const start = new Date(entry.startTime);
                      const end = new Date(entry.endTime);
                      const totalMinutes = entry.isHoliday
                        ? 0
                        : (end.getTime() - start.getTime()) / 1000 / 60 -
                          entry.lunchTime;
                      const totalHours = entry.isHoliday
                        ? '-'
                        : (totalMinutes / 60).toFixed(2);

                      return (
                        <TableRow key={entry.id}>
                          <TableCell className='whitespace-nowrap font-medium'>
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            {entry.isHoliday
                              ? '-'
                              : formatTime(entry.startTime)}
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            {entry.isHoliday ? '-' : formatTime(entry.endTime)}
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            {entry.isHoliday ? '-' : `${entry.lunchTime} mins`}
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            {entry.isHoliday ? '-' : `${totalHours} hrs`}
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            {entry.isHoliday && (
                              <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700'>
                                {entry.holidayName || 'Holiday'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className='bg-gray-50'>
                      <TableCell
                        colSpan={4}
                        className='font-medium whitespace-nowrap'
                      >
                        Weekly Total
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        className='font-medium whitespace-nowrap'
                      >
                        {weekEntries
                          .reduce((acc, entry) => {
                            if (entry.isHoliday) return acc;
                            const start = new Date(entry.startTime);
                            const end = new Date(entry.endTime);
                            const totalMinutes =
                              (end.getTime() - start.getTime()) / 1000 / 60 -
                              entry.lunchTime;
                            return acc + totalMinutes / 60;
                          }, 0)
                          .toFixed(2)}{' '}
                        hrs
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
      </div>

      <div className='mt-6 p-4 rounded-md border'>
        {(() => {
          // Get the first day worked
          const sortedEntries = [...timeEntries].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const firstDay =
            sortedEntries.length > 0 ? new Date(sortedEntries[0].date) : null;

          // Calculate leave days (holidays)
          const leaveDays = timeEntries.filter(entry => entry.isHoliday).length;

          const totalHoursWorked = timeEntries.reduce((acc, entry) => {
            if (entry.isHoliday) return acc;
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);
            const totalMinutes =
              (end.getTime() - start.getTime()) / 1000 / 60 - entry.lunchTime;
            return acc + totalMinutes / 60;
          }, 0);

          const remainingHours = 300 - totalHoursWorked;
          const hoursPerDay = 8; // Assuming 8 hours per workday
          const daysRendered = Math.floor(totalHoursWorked / hoursPerDay);
          const daysLeft = Math.ceil(remainingHours / hoursPerDay);

          // Calculate expected end date
          const today = new Date();
          const expectedEndDate = new Date(today);
          let addedDays = 0;
          let daysToAdd = daysLeft;

          while (addedDays < daysToAdd) {
            expectedEndDate.setDate(expectedEndDate.getDate() + 1);
            // Skip weekends
            if (
              expectedEndDate.getDay() !== 0 &&
              expectedEndDate.getDay() !== 6
            ) {
              addedDays++;
            }
          }

          return (
            <div className='space-y-2'>
              {firstDay && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium'>Started On:</span>
                  <span className='text-lg font-bold'>
                    {formatDateToPH(firstDay)}
                  </span>
                </div>
              )}
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Leave Days Taken:</span>
                <span className='text-lg font-bold text-orange-600'>
                  {leaveDays} days
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Total Hours Worked:</span>
                <span className='text-lg font-bold'>
                  {totalHoursWorked.toFixed(2)} hrs
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Remaining Hours:</span>
                <span className='text-lg font-bold text-blue-600'>
                  {remainingHours.toFixed(2)} hrs
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Days Rendered:</span>
                <span className='text-lg font-bold'>{daysRendered} days</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Days Left:</span>
                <span className='text-lg font-bold text-blue-600'>
                  {daysLeft} days
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Expected End Date:</span>
                <span className='text-lg font-bold text-green-600'>
                  {formatDateToPH(expectedEndDate)}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5 mt-2'>
                <div
                  className='bg-blue-600 h-2.5 rounded-full'
                  style={{ width: `${(totalHoursWorked / 300) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
