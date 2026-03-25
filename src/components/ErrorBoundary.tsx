import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Something went wrong</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
              We've encountered an unexpected error. Our team has been notified. 
              Please try refreshing the page or returning home.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left overflow-auto max-h-60">
                {(() => {
                  try {
                    const errorJson = JSON.parse(this.state.error?.message || '');
                    if (errorJson.error && errorJson.operationType) {
                      return (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Firestore Error</p>
                          <p className="text-xs font-mono text-zinc-900 dark:text-zinc-100">Operation: {errorJson.operationType}</p>
                          <p className="text-xs font-mono text-zinc-900 dark:text-zinc-100">Path: {errorJson.path}</p>
                          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Message: {errorJson.error}</p>
                          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                            <p className="text-[10px] font-mono text-zinc-400">User ID: {errorJson.authInfo.userId || 'Not Logged In'}</p>
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // Not a JSON error
                  }
                  return <p className="text-xs font-mono text-red-600 dark:text-red-400">{this.state.error?.toString()}</p>;
                })()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              >
                <RefreshCcw size={18} /> Refresh Page
              </button>
              <a 
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                <Home size={18} /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
