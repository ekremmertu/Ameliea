/**
 * Structured Logger Utility
 * Production-ready logging with JSON formatting and context
 */

import { captureException, captureMessage } from './sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isProduction) {
      // Production'da sadece warn ve error
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };
  }

  private output(entry: LogEntry): void {
    if (isProduction) {
      // Production: JSON format for log aggregation
      console.log(JSON.stringify(entry));
    } else {
      // Development: Human-readable format
      const emoji = 
        entry.level === 'error' ? '❌' :
        entry.level === 'warn' ? '⚠️' :
        entry.level === 'info' ? 'ℹ️' :
        '🔍';
      
      console.log(
        `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`,
        entry.context ? entry.context : ''
      );
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const entry = this.formatLog('debug', message, context);
      this.output(entry);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const entry = this.formatLog('info', message, context);
      this.output(entry);
      
      if (isProduction) {
        captureMessage(message, 'info');
      }
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      const entry = this.formatLog('warn', message, context);
      this.output(entry);
      
      if (isProduction) {
        captureMessage(message, 'warning');
      }
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const entry = this.formatLog('error', message, context);
      
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }
      
      this.output(entry);
      
      // Send to Sentry
      if (error instanceof Error) {
        captureException(error, { ...context, logMessage: message });
      } else {
        captureMessage(`${message}: ${String(error)}`, 'error');
      }
    }
  }

  // API-specific logging
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context);
  }

  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${path} - ${status}`, {
      status,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  apiError(method: string, path: string, error: Error, context?: LogContext): void {
    this.error(`API Error: ${method} ${path}`, error, context);
  }

  // Database-specific logging
  dbQuery(operation: string, table: string, context?: LogContext): void {
    this.debug(`DB Query: ${operation} on ${table}`, context);
  }

  dbError(operation: string, table: string, error: Error, context?: LogContext): void {
    this.error(`DB Error: ${operation} on ${table}`, error, context);
  }

  // Auth-specific logging
  authAttempt(email: string, success: boolean): void {
    this.info(`Auth attempt: ${email}`, { success });
  }

  authError(email: string, error: Error): void {
    this.error(`Auth error: ${email}`, error);
  }

  // Payment-specific logging
  paymentInitiated(userId: string, amount: number, planType: string): void {
    this.info('Payment initiated', { userId, amount, planType });
  }

  paymentSuccess(userId: string, amount: number, transactionId: string): void {
    this.info('Payment successful', { userId, amount, transactionId });
  }

  paymentFailed(userId: string, amount: number, error: string): void {
    this.error('Payment failed', new Error(error), { userId, amount });
  }
}

export const logger = new Logger();

// Export for use in API routes
export default logger;


