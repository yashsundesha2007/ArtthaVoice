import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ArthaVoice Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '500px', backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '1.5rem', border: '3px solid #DC2626', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#DC2626', fontSize: '1.5rem', fontWeight: 800 }}>⚠️ ArthaVoice Error Recovery</h1>
            <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '1rem' }}>
              Something prevented the page from rendering properly.
            </p>
            <pre style={{ backgroundColor: '#F1F5F9', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.8rem', textAlign: 'left', overflowX: 'auto', marginTop: '1rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              🔄 Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
