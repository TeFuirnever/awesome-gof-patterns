// SPDX-License-Identifier: MIT
// After: extracted Adapter — translation logic centralized in one place

// Third-party library (cannot modify)
interface ThirdPartyLogger {
  logMessage(level: number, msg: string, context?: Record<string, unknown>): void;
}

// Our application's expected interface
interface AppLogger {
  debug(message: string): void;
  info(message: string): void;
  error(message: string, err?: Error): void;
}

// Adapter: translates AppLogger calls into ThirdPartyLogger calls
class LoggerAdapter implements AppLogger {
  constructor(private target: ThirdPartyLogger) {}

  debug(message: string): void {
    this.target.logMessage(0, message);
  }

  info(message: string): void {
    this.target.logMessage(1, message, { source: "app" });
  }

  error(message: string, err?: Error): void {
    this.target.logMessage(3, message, {
      source: "app",
      error: err?.message,
    });
  }
}

// Client code uses AppLogger — no knowledge of ThirdPartyLogger
class NotificationService {
  constructor(private logger: AppLogger) {}

  send(message: string): void {
    this.logger.info(message);
    this.logger.debug(`notification sent: ${message}`);
  }
}
