/**
 * Logger Utility
 * Production'da console.log'ları gizler, development'da gösterir
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Production'da sadece error'ları göster
    if (!isDevelopment) {
      return level === 'error';
    }
    return true;
  }

  log(...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();

