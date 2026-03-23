'use client';

import { useState } from 'react';
import { AttendanceRecord, calculateDayOT } from '@/utils/otCalculator';

interface DataTableProps {
  data: AttendanceRecord[];
  onChange: (updatedData: AttendanceRecord[]) => void;
  offDays: Set<string>;
}

export default function DataTable({ data, onChange, offDays }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellClick = (
    rowIndex: number,
    column: keyof Omit<AttendanceRecord, 'normalOTHrs' | 'doubleOTHrs'>
  ) => {
    if (['normalOTHrs', 'doubleOTHrs'].includes(column)) return; // Read-only columns

    setEditingCell({ row: rowIndex, col: column });
    setEditValue(String(data[rowIndex][column]));
  };

  const handleSave = (rowIndex: number, column: string, value?: string) => {
    const newData = [...data];
    const record = newData[rowIndex];
    const valueToSave = value !== undefined ? value : editValue;

    // Validate and update
    if (column === 'days') {
      if (valueToSave === '1' || valueToSave === '1/2') {
        record.days = valueToSave as '1' | '1/2';
      } else {
        setEditingCell(null);
        return;
      }
    } else if (valueToSave.trim() === '') {
      setEditingCell(null);
      return; // Don't save empty values
    } else {
      (record as any)[column] = valueToSave;
    }

    // Recalculate OT
    const isOffDay = offDays.has(record.date);
    const updated = calculateDayOT({
      date: record.date,
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      days: record.days,
      isOffDay,
    });

    // Always update both values
    record.normalOTHrs = updated.normalOTHrs;
    record.doubleOTHrs = updated.doubleOTHrs;

    onChange(newData);
    setEditingCell(null);
    setEditValue(''); // Clear edit value
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave(editingCell!.row, editingCell!.col);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  if (data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#6b7280',
        padding: '2rem'
      }}>
        <p>📊 No data yet. Upload an attendance sheet to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 900,
        color: '#1f2937',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' , color: '#1f2937'}}>📋</span>
        Attendance Data
      </h2>

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
      }}>
        {/* Table Container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(to right, #374151, #1f2937)',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 900,
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 900,
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>Time In</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 900,
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>Time Out</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 900,
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'right',
                  fontWeight: 900,
                  color: '#2563eb',
                  fontSize: '0.875rem'
                }}>Normal OT</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'right',
                  fontWeight: 900,
                  color: '#dc2626',
                  fontSize: '0.875rem'
                }}>Double OT</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? '#f9fafb' : 'white',
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#f9fafb' : 'white'}
                >
                  <td style={{
                    padding: '1rem',
                    fontWeight: 600,
                    color: offDays.has(record.date) ? '#dc2626' : '#1f2937'
                  }}>
                    {record.date}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'timeIn' ? '#dbeafe' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'timeIn' ? '2px solid #2563eb' : undefined
                    }}
                    onClick={() => handleCellClick(idx, 'timeIn')}
                  >
                    {editingCell?.row === idx && editingCell?.col === 'timeIn' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(idx, 'timeIn')}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{
                          width: '100%',
                          background: '#f0f9ff',
                          border: '1px solid #2563eb',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                        placeholder="09:30"
                      />
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>{record.timeIn}</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'timeOut' ? '#dbeafe' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'timeOut' ? '2px solid #2563eb' : undefined
                    }}
                    onClick={() => handleCellClick(idx, 'timeOut')}
                  >
                    {editingCell?.row === idx && editingCell?.col === 'timeOut' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(idx, 'timeOut')}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{
                          width: '100%',
                          background: '#f0f9ff',
                          border: '1px solid #2563eb',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                        placeholder="18:30"
                      />
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>{record.timeOut}</span>
                    )}
                  </td>
                  <td 
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'days' ? '#dbeafe' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'days' ? '2px solid #2563eb' : undefined
                    }}
                    onClick={() => handleCellClick(idx, 'days')}
                  >
                    {editingCell?.row === idx && editingCell?.col === 'days' ? (
                      <select
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          handleSave(idx, 'days', e.target.value);
                        }}
                        autoFocus
                        style={{
                          background: '#f0f9ff',
                          border: '2px solid #2563eb',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          color: '#1f2937',
                          fontWeight: 600,
                          outline: 'none',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <option value="1">📅 Full (9h)</option>
                        <option value="1/2">⏰ Half (4h)</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          background: record.days === '1' ? '#dcfce7' : '#fef3c7',
                          color: record.days === '1' ? '#166534' : '#92400e',
                          border: record.days === '1' ? '1px solid #86efac' : '1px solid #fcd34d',
                          cursor: 'pointer'
                        }}
                      >
                        {record.days === '1' ? '📅 Full' : '⏰ Half'}
                      </span>
                    )}
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 900,
                    color: '#2563eb'
                  }}>
                    {record.normalOTHrs.toFixed(2)}h
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 900,
                    color: '#dc2626'
                  }}>
                    {record.doubleOTHrs.toFixed(2)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
}
