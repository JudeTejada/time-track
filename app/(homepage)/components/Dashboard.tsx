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

export function Dashboard({ timeEntries }: { timeEntries: TimeEntry[] }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [open, setOpen] = useState(false);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  console.log(timeEntries);

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
    <div className='p-8'>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Time Tracking Dashboard
        </h1>
        <div className='flex gap-2'>
          <Button
            onClick={handleCheckIn}
            variant='secondary'
            disabled={isCheckingIn}
          >
            {isCheckingIn ? 'Checking In...' : 'Quick Check In'}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Time Entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <label htmlFor='date' className='text-sm font-medium'>
                    Date
                  </label>
                  <Input
                    id='date'
                    type='date'
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='startTime' className='text-sm font-medium'>
                    Start Time
                  </label>
                  <Input
                    id='startTime'
                    type='time'
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='endTime' className='text-sm font-medium'>
                    End Time
                  </label>
                  <Input
                    id='endTime'
                    type='time'
                    required
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='lunchTime' className='text-sm font-medium'>
                    Lunch Time (minutes)
                  </label>
                  <Input
                    id='lunchTime'
                    type='number'
                    required
                    value={formData.lunchTime}
                    onChange={handleInputChange}
                    min='0'
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
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
                      className='h-4 w-4'
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Lunch Break</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Holiday</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map(entry => {
              const start = new Date(entry.startTime);
              const end = new Date(entry.endTime);
              const totalMinutes = entry.isHoliday
                ? 0
                : (end.getTime() - start.getTime()) / 1000 / 60 -
                  entry.lunchTime;
              const totalHours = entry.isHoliday
                ? '-'
                : (totalMinutes / 60).toFixed(2);

              console.log({ entry });
              return (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>
                    {entry.isHoliday ? '-' : formatTime(entry.startTime)}
                  </TableCell>
                  <TableCell>
                    {entry.isHoliday ? '-' : formatTime(entry.endTime)}
                  </TableCell>
                  <TableCell>
                    {entry.isHoliday ? '-' : `${entry.lunchTime} mins`}
                  </TableCell>
                  <TableCell>
                    {entry.isHoliday ? '-' : `${totalHours} hrs`}
                  </TableCell>
                  <TableCell>
                    {entry.isHoliday && (
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700'>
                        {entry.holidayName || 'Holiday'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className='mt-6 p-4 rounded-md border'>
        {(() => {
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
            if (expectedEndDate.getDay() !== 0 && expectedEndDate.getDay() !== 6) {
              addedDays++;
            }
          }

          return (
            <div className='space-y-2'>
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
                <span className='text-lg font-bold'>
                  {daysRendered} days
                </span>
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
