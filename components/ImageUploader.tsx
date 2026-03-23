'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
  onUpload: (base64: string) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onUpload, isLoading }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onUpload(base64);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <h2 style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.1rem', color: 'var(--primary)', lineHeight: 1 }}>↑</span>
        Upload Sheet
      </h2>

      {preview ? (
        <>
          <div style={{
            position: 'relative',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border)'
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                height: '12rem',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
            <button
              onClick={() => {
                setPreview(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#0f172a',
                color: 'white',
                borderRadius: '50%',
                padding: '0.375rem',
                border: 'none',
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.25)',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.25), transparent)',
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0.75rem',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.55), transparent)',
              pointerEvents: 'none'
            }}>
              <p style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>Image Uploaded</p>
            </div>
          </div>

          {/* Processing Status Indicator */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
            background: isLoading ? 'var(--surface-alt)' : 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.1rem',
              color: isLoading ? 'var(--text-muted)' : 'var(--primary)',
              animation: isLoading ? 'spin 1.2s linear infinite' : 'none'
            }}>
              {isLoading ? '↻' : '✓'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '0.875rem',
                margin: '0 0 0.25rem 0'
              }}>
                {isLoading ? 'Processing Image...' : 'Processing Complete!'}
              </p>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                margin: 0
              }}>
                {isLoading 
                  ? 'Extracting data' 
                  : 'Data has been loaded to the table below'}
              </p>
            </div>
            {isLoading && (
              <div style={{
                width: '4rem',
                height: '0.25rem',
                background: '#dbe3ef',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #64748b, #0f172a)',
                  animation: 'pulseBar 2s ease-in-out infinite',
                  width: '30%'
                }}></div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              position: 'relative',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              padding: '2rem',
              border: `2px dashed ${isDragActive ? '#1e3a8a' : '#c7d2e4'}`,
              borderRadius: '0.75rem',
              background: isDragActive ? '#eef2ff' : '#f8fafc',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
              transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
              opacity: isLoading ? 0.6 : 1
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isLoading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={isLoading}
              style={{ display: 'none' }}
            />

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  transition: 'all 0.3s ease',
                  color: 'var(--primary)',
                  animation: isLoading ? 'spin 1s linear infinite' : 'none'
                }}
              >
                {isLoading ? '↻' : '□'}
              </div>
              <p style={{
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '1rem',
                marginBottom: '0.25rem'
              }}>
                {isLoading ? 'Processing Image...' : 'Drop Image Here'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or click to browse</p>
            </div>
          </div>

          
        </>
      )}
    </div>
  );
}
