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
    <main style={{ minHeight: '100vh', backgroundColor: '#1f2937' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, #2563eb, #06b6d4)',
        padding: '2rem 1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        borderBottom: '4px solid #2563eb'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>⏰ OT Calculator</h1>
          <p style={{ color: '#dbeafe', fontSize: '1rem', fontWeight: 600 }}>Smart Attendance & Overtime Analysis</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Error Alert */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #dc2626',
            borderRadius: '0.5rem',
            display: 'flex',
            gap: '0.75rem',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#991b1b', fontWeight: 600 }}>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '1.25rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            {/* Upload Card */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem'
            }}>
              <ImageUploader onUpload={handleImageUpload} isLoading={isLoading} />
            </div>

            {/* Calendar Card */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
            }}>
              <OffDaysCalendar onOffDaysChange={handleOffDaysChange} month={month} year={year} />
            </div>
          </div>

          {/* Main Content */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Table */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
            }}>
              <DataTable data={data} onChange={handleDataChange} offDays={offDays} />
            </div>

            {/* Results */}
            {data.length > 0 && (
              <>
                <div style={{ borderTop: '2px solid #e5e7eb', margin: '1.5rem 0' }}></div>
                <OTResults data={data} hourlyRate={0} />
              </>
            )}

            {/* Empty State */}
            {data.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                border: '2px dashed #9ca3af'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>No Data Yet</h3>
                <p style={{ color: '#6b7280' }}>Upload an attendance sheet to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {data.length > 0 && (
          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #d1d5db',
            textAlign: 'center'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>HR Team</p>
          </div>
        )}
      </div>
    </main>
  );
}
