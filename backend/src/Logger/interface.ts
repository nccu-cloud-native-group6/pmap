export interface Logger {
  trace(message: string, labels?: Record<string, any>): void;
  debug(message: string, labels?: Record<string, any>): void;
  info(message: string, labels?: Record<string, any>): void;
  warn(message: string, labels?: Record<string, any>): void;
  error(error: unknown, message?: string, labels?: Record<string, any>): void;
  fatal(error: unknown, message?: string, labels?: Record<string, any>): void;
}
