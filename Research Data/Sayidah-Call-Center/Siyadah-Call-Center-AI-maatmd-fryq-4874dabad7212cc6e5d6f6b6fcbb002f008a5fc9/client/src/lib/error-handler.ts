// Error handling utilities for the application

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

export class ApiError extends Error implements AppError {
  public code?: string;
  public statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'حدث خطأ غير متوقع',
      code: 'UNKNOWN_ERROR'
    };
  }

  return {
    message: 'حدث خطأ غير متوقع',
    code: 'UNKNOWN_ERROR'
  };
}

export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]:`, error);
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('fetch') || 
     error.message.includes('network') ||
     error.message.includes('Failed to fetch'));
}

export function getErrorMessage(error: unknown): string {
  const appError = handleApiError(error);
  return appError.message;
}

export const handleError = (error: unknown, context?: string) => {
  // تجنب طباعة الأخطاء المتكررة
  const errorKey = `${context}-${error instanceof Error ? error.message : 'unknown'}`;
  const now = Date.now();

  if (lastErrorTime[errorKey] && now - lastErrorTime[errorKey] < 5000) {
    return; // تجاهل الأخطاء المتكررة خلال 5 ثوان
  }

  lastErrorTime[errorKey] = now;

  console.warn(`Error ${context ? `in ${context}` : ''}:`, error);

  if (error instanceof Error && !error.message.includes('WebSocket')) {
    toast({
      title: "حدث خطأ",
      description: error.message,
      variant: "destructive",
    });
  }
};

const lastErrorTime: Record<string, number> = {};

export function setupErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught:', event.reason);

    // Prevent the default browser behavior
    event.preventDefault();

    // Only log serious errors, ignore network timeouts
    if (event.reason && !event.reason.message?.includes('fetch')) {
      handleError(event.reason);
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.warn('Global error caught:', event.error);

    // Only handle serious errors
    if (event.error && !event.error.message?.includes('ResizeObserver')) {
      handleError(event.error);
    }
  });
}