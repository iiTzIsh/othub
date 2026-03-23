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
        fontWeight: 900,
        color: '#1f2937',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>📤</span>
        Upload Sheet
      </h2>

      {preview ? (
        <>
          <div style={{
            position: 'relative',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            border: '2px solid #22c55e'
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
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                padding: '0.375rem',
                border: 'none',
                boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0.75rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
              pointerEvents: 'none'
            }}>
              <p style={{ color: '#86efac', fontSize: '0.875rem', fontWeight: 'bold' }}>✓ Image Uploaded</p>
            </div>
          </div>

          {/* Processing Status Indicator */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            background: isLoading ? '#fef3c7' : '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.5rem',
              animation: isLoading ? 'spin 1.5s linear infinite' : 'none'
            }}>
              {isLoading ? '⏳' : '✅'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                color: isLoading ? '#92400e' : '#166534',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                margin: '0 0 0.25rem 0'
              }}>
                {isLoading ? 'Processing Image...' : 'Processing Complete!'}
              </p>
              <p style={{
                color: isLoading ? '#b45309' : '#15803d',
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
                background: '#e5e7eb',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #f59e0b, #f97316)',
                  animation: 'progress 2s ease-in-out infinite',
                  width: '30%'
                }}></div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes progress {
              0%, 100% { width: 10%; }
              50% { width: 90%; }
            }
          `}</style>
        </>
      ) : (
        <>
          <div
            style={{
              position: 'relative',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              padding: '2rem',
              border: `2px dashed ${isDragActive ? '#3b82f6' : '#d1d5db'}`,
              borderRadius: '0.75rem',
              background: isDragActive ? '#eff6ff' : '#fafafa',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
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
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem',
                  transition: 'all 0.3s ease',
                  animation: isLoading ? 'spin 1s linear infinite' : isDragActive ? 'bounce 0.5s infinite' : 'none'
                }}
              >
                {isLoading ? '⏳' : '📸'}
              </div>
              <p style={{
                color: '#1f2937',
                fontWeight: 'bold',
                fontSize: '1rem',
                marginBottom: '0.25rem'
              }}>
                {isLoading ? 'Processing Image...' : 'Drop Image Here'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>or click to browse</p>
            </div>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}</style>
          </div>

          
        </>
      )}
    </div>
  );
}
