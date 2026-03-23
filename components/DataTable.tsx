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
        color: 'var(--text-muted)',
        padding: '2rem'
      }}>
        <p>No data yet. Upload an attendance sheet to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: 'var(--primary)' }}>◦</span>
        Attendance Data
      </h2>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)'
      }}>
        {/* Table Container */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #f8fafc, #eef2f7)',
                borderBottom: '1px solid var(--border)'
              }}>
                <th style={{
                  padding: '0.75rem',
                  width: '72px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Date</th>
                <th style={{
                  padding: '0.75rem',
                  width: '96px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Time In</th>
                <th style={{
                  padding: '0.75rem',
                  width: '96px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Time Out</th>
                <th style={{
                  padding: '0.75rem',
                  width: '84px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Type</th>
                <th style={{
                  padding: '0.75rem',
                  width: '104px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Normal OT</th>
                <th style={{
                  padding: '0.75rem',
                  width: '108px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>Double OT</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? '#fbfcfe' : 'white',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f2f6fb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fbfcfe' : 'white'}
                >
                  <td style={{
                    padding: '0.75rem',
                    fontWeight: 600,
                    color: offDays.has(record.date) ? 'var(--primary)' : 'var(--text)'
                  }}>
                    {record.date}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'timeIn' ? '#eef2ff' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'timeIn' ? '2px solid var(--primary)' : undefined
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
                          background: '#f8fafc',
                          border: '1px solid var(--primary)',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                        placeholder="09:30"
                      />
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{record.timeIn}</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'timeOut' ? '#eef2ff' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'timeOut' ? '2px solid var(--primary)' : undefined
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
                          background: '#f8fafc',
                          border: '1px solid var(--primary)',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                        placeholder="18:30"
                      />
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{record.timeOut}</span>
                    )}
                  </td>
                  <td 
                    style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: editingCell?.row === idx && editingCell?.col === 'days' ? '#eef2ff' : undefined,
                      borderLeft: editingCell?.row === idx && editingCell?.col === 'days' ? '2px solid var(--primary)' : undefined
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
                          background: '#f8fafc',
                          border: '1px solid var(--primary)',
                          borderRadius: '0.25rem',
                          padding: '0.5rem',
                          color: 'var(--text)',
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
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          background: '#eef2f7',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer'
                        }}
                      >
                        {record.days === '1' ? 'Full' : 'Half'}
                      </span>
                    )}
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: 'var(--text)'
                  }}>
                    {record.normalOTHrs.toFixed(2)}h
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: 'var(--text)'
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
