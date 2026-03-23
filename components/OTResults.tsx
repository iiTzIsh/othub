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
    <div className="ot-results" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Stats Cards */}
      <div className="kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        {/* Normal OT Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Normal OT
          </p>
          <p className="kpi-value" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: '0.25rem'
          }}>
            {summary.totalNormalOT.toFixed(2)}
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>

        {/* Double OT Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Double OT
          </p>
          <p className="kpi-value" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: '0.25rem'
          }}>
            {summary.totalDoubleOT.toFixed(2)}
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>

        {/* Total OT Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Total OT
          </p>
          <p className="kpi-value" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--primary)',
            marginBottom: '0.25rem'
          }}>
            {summary.totalOTHours.toFixed(2)}
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>hours</p>
        </div>
      </div>

      {/* Details Card */}
      <div style={{
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ color: 'var(--primary)' }}>◦</span>
          Summary Details
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
          >
            <span style={{
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: 'var(--primary)' }}>•</span>
              Days Worked
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)'
            }}>
              {summary.totalDays}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
          >
            <span style={{
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: 'var(--primary)' }}>•</span>
              Off/Sunday Days
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)'
            }}>
              {summary.totalOffDays}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'var(--primary-soft)',
            border: '1px solid #c7d2fe',
            borderRadius: '0.5rem'
          }}>
            <span style={{
              color: 'var(--text)',
              fontWeight: 600,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: 'var(--primary)' }}>•</span>
              Total OT Hours
            </span>
            <span className="summary-total" style={{
              fontSize: 'clamp(1.3rem, 4.2vw, 1.875rem)',
              fontWeight: 800,
              color: 'var(--primary)'
            }}>
              {summary.totalOTHours.toFixed(2)} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        className="export-btn"
        onClick={exportToCSV}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: 'white',
          fontWeight: 700,
          border: '1px solid rgba(30, 58, 138, 0.45)',
          borderRadius: '0.5rem',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
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
          e.currentTarget.style.background = 'linear-gradient(135deg, #0b1220, #1e40af)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.25)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0f172a, #1e3a8a)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>↓</span>
        Export to CSV
      </button>
    </div>
  );
}
