/**
 * Prosty system śledzenia błędów
 * Placeholder dla integracji z Sentry lub innym serwisem
 */

interface ErrorContext {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface TrackedError {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: number;
  severity: 'error' | 'warning' | 'info';
}

// Lokalny storage dla błędów (do wysłania gdy online)
const errorQueue: TrackedError[] = [];
const MAX_QUEUE_SIZE = 50;

/**
 * Loguje błąd do systemu śledzenia
 */
export const trackError = (
  error: Error | string,
  context: ErrorContext = {},
  severity: 'error' | 'warning' | 'info' = 'error'
): void => {
  const trackedError: TrackedError = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context: {
      ...context,
      page: window.location.pathname,
    },
    timestamp: Date.now(),
    severity,
  };

  // Loguj do konsoli w development
  if (import.meta.env.DEV) {
    console.error('[ErrorTracking]', trackedError);
  }

  // Dodaj do kolejki
  if (errorQueue.length >= MAX_QUEUE_SIZE) {
    errorQueue.shift(); // Usuń najstarszy
  }
  errorQueue.push(trackedError);

  // W produkcji - wyślij do serwisu (placeholder)
  if (import.meta.env.PROD) {
    sendToErrorService(trackedError);
  }
};

/**
 * Placeholder dla wysyłki do Sentry/innego serwisu
 */
const sendToErrorService = async (error: TrackedError): Promise<void> => {
  // TODO: Zintegrować z Sentry
  // Sentry.captureException(error);
  
  // Na razie logujemy do localStorage dla analizy
  try {
    const stored = localStorage.getItem('error_logs') || '[]';
    const logs = JSON.parse(stored);
    logs.push(error);
    // Zachowaj tylko ostatnie 20 błędów
    if (logs.length > 20) {
      logs.splice(0, logs.length - 20);
    }
    localStorage.setItem('error_logs', JSON.stringify(logs));
  } catch {
    // Ignoruj błędy localStorage
  }
};

/**
 * Globalny handler dla nieobsłużonych błędów
 */
export const setupGlobalErrorHandlers = (): void => {
  // Nieobsłużone wyjątki
  window.onerror = (message, source, lineno, colno, error) => {
    trackError(error || String(message), {
      metadata: { source, lineno, colno },
    });
    return false; // Pozwól na domyślną obsługę
  };

  // Nieobsłużone Promise rejections
  window.onunhandledrejection = (event) => {
    trackError(event.reason || 'Unhandled Promise Rejection', {
      action: 'unhandledRejection',
    });
  };
};

/**
 * HOC dla komponentów z error tracking
 */
export const withErrorTracking = <T extends Record<string, unknown>>(
  componentName: string
) => {
  return (error: Error, context?: Partial<ErrorContext>) => {
    trackError(error, {
      ...context,
      metadata: { component: componentName, ...context?.metadata },
    });
  };
};

/**
 * Pobierz zapisane błędy (do debugowania)
 */
export const getStoredErrors = (): TrackedError[] => {
  try {
    const stored = localStorage.getItem('error_logs');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Wyczyść zapisane błędy
 */
export const clearStoredErrors = (): void => {
  localStorage.removeItem('error_logs');
};
