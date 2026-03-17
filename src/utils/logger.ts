/**
 * Structured Logging Utility for Cloudflare Workers
 * Provides consistent logging across the API with different log levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  stack?: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

class Logger {
  private service: string;
  private minLevel: LogLevel = LogLevel.INFO;

  constructor(service: string = 'Template Catalog API') {
    this.service = service;
    // Set to DEBUG in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.minLevel = LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...data,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, data);
  }
  info(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | string, data?: Record<string, unknown>) {
    const errorData: Record<string, unknown> = {
      ...data,
    };

    if (error instanceof Error) {
      errorData.error = error.message;
      errorData.stack = error.stack;
    } else if (typeof error === 'string') {
      errorData.error = error;
    }

    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Log HTTP request with timing
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    requestId?: string,
    data?: Record<string, unknown>
  ) {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      requestId,
      ...data,
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    rowsAffected?: number,
    error?: Error
  ) {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;

    this.log(level, `Database: ${operation} on ${table}`, {
      operation,
      table,
      duration: `${duration}ms`,
      rowsAffected,
      error: error?.message,
    });
  }

  /**
   * Create a child logger with additional context
   */
  createRequestLogger(requestId: string): RequestLogger {
    return new RequestLogger(this.service, requestId);
  }
}

class RequestLogger {
  private service: string;
  private requestId: string;
  private startTime: number;

  constructor(service: string, requestId: string) {
    this.service = service;
    this.requestId = requestId;
    this.startTime = Date.now();
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      requestId: this.requestId,
      ...data,
    };

    console.log(JSON.stringify(entry));
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, data);
  }

  error(message: string, error?: Error | string, data?: Record<string, unknown>) {
    const errorData: Record<string, unknown> = {
      ...data,
    };

    if (error instanceof Error) {
      errorData.error = error.message;
      errorData.stack = error.stack;
    } else if (typeof error === 'string') {
      errorData.error = error;
    }

    this.log(LogLevel.ERROR, message, errorData);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log the completion of the request with timing
   */
  logComplete(statusCode: number, path: string, method: string) {
    const duration = Date.now() - this.startTime;
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `${method} ${path} ${statusCode}`, {
      statusCode,
      duration: `${duration}ms`,
      path,
      method,
    });
  }
}

// Export singleton logger instance
export const logger = new Logger();
