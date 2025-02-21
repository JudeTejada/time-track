import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { TimeEntry } from '@/app/(homepage)/components/Dashboard';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    marginBottom: 20
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableHeader: {
    backgroundColor: '#f0f0f0'
  },
  tableCell: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5
  },
  tableCellHeader: {
    fontWeight: 'bold'
  }
});

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const groupEntriesByMonth = (entries: TimeEntry[]) => {
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  // Sort entries within each month by date
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return grouped;
};

export const TimeTrackingPDF = ({ entries }: { entries: TimeEntry[] }) => {
  const groupedEntries = groupEntriesByMonth(entries);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {Object.entries(groupedEntries).map(([monthKey, monthEntries]) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long' });

          return (
            <View key={monthKey} style={styles.section}>
              <Text style={styles.monthTitle}>{`${monthName} ${year}`}</Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellHeader}>Date</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellHeader}>In</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellHeader}>Out</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellHeader}>Total Hours</Text>
                  </View>
                </View>

                {/* Table Body */}
                {monthEntries.map(entry => {
                  const start = new Date(entry.startTime);
                  const end = new Date(entry.endTime);
                  const totalMinutes = entry.isHoliday
                    ? 0
                    : (end.getTime() - start.getTime()) / 1000 / 60 - entry.lunchTime;
                  const totalHours = entry.isHoliday
                    ? '-'
                    : (totalMinutes / 60).toFixed(2);

                  return (
                    <View key={entry.id} style={styles.tableRow}>
                      <View style={styles.tableCell}>
                        <Text>{formatDate(new Date(entry.date))}</Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text>{entry.isHoliday ? '-' : formatTime(entry.startTime)}</Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text>{entry.isHoliday ? '-' : formatTime(entry.endTime)}</Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text>{entry.isHoliday ? '-' : `${totalHours} hrs`}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};