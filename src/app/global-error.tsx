'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          backgroundColor: '#FFFBF0',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎨</div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '1rem',
            }}
          >
            Oops! Something went wrong
          </h1>
          <p
            style={{
              color: '#666',
              marginBottom: '2rem',
            }}
          >
            Don&apos;t worry, let&apos;s try that again!
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#FF6B6B',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
