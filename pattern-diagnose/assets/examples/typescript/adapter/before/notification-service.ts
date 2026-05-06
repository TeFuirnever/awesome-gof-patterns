// SPDX-License-Identifier: MIT
// Before: incompatible interface shapes — Adapter candidate

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

// Incompatible: level is a number vs named methods, context shape differs
class NotificationService {
  // Glue code accumulates here — translation scattered at every call site
  send(message: string, thirdParty: ThirdPartyLogger): void {
    // Manual translation every time — should be centralized
    thirdParty.logMessage(1, message, { source: "notification" });
    thirdParty.logMessage(3, `notification sent: ${message}`, {
      timestamp: Date.now(),
    });
  }
}
