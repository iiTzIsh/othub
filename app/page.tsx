'use client';

import { useState, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import DataTable from '@/components/DataTable';
import OffDaysCalendar from '@/components/OffDaysCalendar';
import OTResults from '@/components/OTResults';
import { AttendanceRecord, calculateMultipleRecords } from '@/utils/otCalculator';
import { parseOCRText, parseJSONResponse } from '@/utils/ocrUtils';

export default function Home() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [offDays, setOffDays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const handleImageUpload = useCallback(
    async (base64: string) => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Extraction failed');
        }

        // Parse the extracted text
        let records = parseOCRText(result.text);

        if (records.length === 0) {
          try {
            records = parseJSONResponse(result.text);
          } catch (e) {
            // Handle parse error silently
          }
        }

        if (records.length === 0) {
          setError('❌ No attendance records found in the image. Please try another image.');
          setIsLoading(false);
          return;
        }

        // Add isOffDay flag and calculate OT
        const withOffDayFlag = records.map((record) => ({
          ...record,
          isOffDay: offDays.has(record.date),
          normalOTHrs: 0,
          doubleOTHrs: 0,
        }));

        const calculated = calculateMultipleRecords(withOffDayFlag);
        setData(calculated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`❌ ${message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [offDays]
  );

  const handleOffDaysChange = (newOffDays: Set<string>) => {
    setOffDays(newOffDays);

    // Recalculate with new off days
    if (data.length > 0) {
      const updated = data.map((record) => ({
        ...record,
        isOffDay: newOffDays.has(record.date),
      }));
      const recalculated = calculateMultipleRecords(updated);
      setData(recalculated);
    }
  };

  const handleDataChange = (newData: AttendanceRecord[]) => {
    setData(newData);
  };

  return (
    <main>
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">OT Desk</h1>
          <p className="app-subtitle">Attendance and overtime analysis workspace</p>
        </div>
      </header>

      <div className="app-container">
        {/* Error Alert */}
        {error && (
          <div className="alert">
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>!</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="layout-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-stack">
              <div className="panel">
                <ImageUploader onUpload={handleImageUpload} isLoading={isLoading} />
              </div>

              <div className="panel">
                <OffDaysCalendar onOffDaysChange={handleOffDaysChange} month={month} year={year} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="main-stack">
            {/* Table */}
            <div className="panel">
              <DataTable data={data} onChange={handleDataChange} offDays={offDays} />
            </div>

            {/* Results */}
            {data.length > 0 && (
              <>
                <div className="section-divider"></div>
                <OTResults data={data} hourlyRate={0} />
              </>
            )}

            {/* Empty State */}
            {data.length === 0 && (
              <div className="empty-state">
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                  No Data Yet
                </h3>
                <p>Upload an attendance sheet to start the analysis.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        {data.length > 0 && (
          <p className="footer-note">HR Team Workspace</p>
        )}
      </div>
    </main>
  );
}
