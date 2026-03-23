'use client';

import { AttendanceRecord, calculateOTSummary } from '@/utils/otCalculator';

interface OTResultsProps {
  data: AttendanceRecord[];
  hourlyRate?: number;
}

export default function OTResults({ data, hourlyRate = 0 }: OTResultsProps) {
  if (data.length === 0) {
    return null;
  }

  const summary = calculateOTSummary(data);

  const exportToCSV = () => {
    // Prepare data for export
    type ExportRow = Record<string, string>;
    
    const exportData: ExportRow[] = data.map((record) => ({
      Date: record.date,
      'Time In': record.timeIn,
      'Time Out': record.timeOut,
      Days: record.days === '1' ? 'Full' : 'Half',
      'Normal OT (hrs)': record.normalOTHrs.toFixed(2),
      'Double OT (hrs)': record.doubleOTHrs.toFixed(2),
      'Off Day?': record.isOffDay ? 'Yes' : 'No',
    }));

    // Add empty row for spacing
    exportData.push({
      Date: '',
      'Time In': '',
      'Time Out': '',
      Days: '',
      'Normal OT (hrs)': '',
      'Double OT (hrs)': '',
      'Off Day?': '',
    });

    // Add summary row
    exportData.push({
      Date: 'SUMMARY',
      'Time In': '',
      'Time Out': '',
      Days: '',
      'Normal OT (hrs)': summary.totalNormalOT.toFixed(2),
      'Double OT (hrs)': summary.totalDoubleOT.toFixed(2),
      'Off Day?': '',
    });

    if (hourlyRate > 0) {
      const normalOTCost = (summary.totalNormalOT * hourlyRate).toFixed(2);
      const doubleOTCost = (summary.totalDoubleOT * hourlyRate * 2).toFixed(2);
      const totalCost = (
        summary.totalNormalOT * hourlyRate +
        summary.totalDoubleOT * hourlyRate * 2
      ).toFixed(2);

      exportData.push({
        Date: 'OT COST',
        'Time In': '',
        'Time Out': '',
        Days: `@ $${hourlyRate}/hr`,
        'Normal OT (hrs)': `$${normalOTCost}`,
        'Double OT (hrs)': `$${doubleOTCost}`,
        'Off Day?': `Total: $${totalCost}`,
      });
    }

    const headers = [
      'Date',
      'Time In',
      'Time Out',
      'Days',
      'Normal OT (hrs)',
      'Double OT (hrs)',
      'Off Day?',
    ] as const;

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = exportData.map((row) => headers.map((header) => escapeCSV(row[header] ?? '')).join(','));
    const csv = [headers.map((header) => escapeCSV(header)).join(','), ...rows].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OT-Report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Normal OT Card */}
        <div style={{
          background: 'white',
          border: '1px solid #dbeafe',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: '#2563eb',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📗</span>
            Normal OT
          </p>
          <p style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: '#2563eb',
            marginBottom: '0.25rem'
          }}>
            {summary.totalNormalOT.toFixed(2)}
          </p>
          <p style={{
            color: '#3b82f6',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>

        {/* Double OT Card */}
        <div style={{
          background: 'white',
          border: '1px solid #fee2e2',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>🔴</span>
            Double OT
          </p>
          <p style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: '#dc2626',
            marginBottom: '0.25rem'
          }}>
            {summary.totalDoubleOT.toFixed(2)}
          </p>
          <p style={{
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>

        {/* Total OT Card */}
        <div style={{
          background: 'white',
          border: '1px solid #dcfce7',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: '#16a34a',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            Total OT
          </p>
          <p style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: '#16a34a',
            marginBottom: '0.25rem'
          }}>
            {summary.totalOTHours.toFixed(2)}
          </p>
          <p style={{
            color: '#22c55e',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>
      </div>

      {/* Details Card */}
      <div style={{
        width: '100%',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.07)'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 900,
          color: '#1f2937',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          Summary Details
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
          >
            <span style={{
              color: '#4b5563',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>📅</span>
              Days Worked
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#2563eb'
            }}>
              {summary.totalDays}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
          >
            <span style={{
              color: '#4b5563',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔴</span>
              Off/Sunday Days
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#dc2626'
            }}>
              {summary.totalOffDays}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'linear-gradient(to right, #f0f9ff, #f0fdf4)',
            border: '2px solid #06b6d4',
            borderRadius: '0.5rem'
          }}>
            <span style={{
              color: '#0c4a6e',
              fontWeight: 600,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⏱️</span>
              Total OT Hours
            </span>
            <span style={{
              fontSize: '1.875rem',
              fontWeight: 900,
              background: 'linear-gradient(to right, #22d3ee, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {summary.totalOTHours.toFixed(2)} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportToCSV}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(to right, #16a34a, #059669)',
          color: 'white',
          fontWeight: 900,
          border: '1px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          transform: 'scale(1)',
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #047857)';
          e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #059669)';
          e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>📥</span>
        Export to CSV
      </button>
    </div>
  );
}
