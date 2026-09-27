'use client'

import { Toaster } from 'react-hot-toast'

// react-hot-toast styles toasts inline, so classes can't reach them; the
// lake tokens are passed as CSS variables instead.
function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--lake-surface-raised)',
          color: 'var(--lake-fg)',
          border: '1px solid var(--lake-line)',
          borderRadius: 'var(--lake-radius-control)',
          boxShadow: 'var(--lake-shadow-overlay)',
          fontSize: '0.875rem',
          lineHeight: '1.4',
          padding: '0.625rem 0.875rem',
          maxWidth: '26rem',
        },
        success: {
          iconTheme: {
            primary: 'var(--lake-success)',
            secondary: 'var(--lake-surface-raised)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--lake-danger)',
            secondary: 'var(--lake-surface-raised)',
          },
        },
      }}
    />
  )
}

export default AppToaster
