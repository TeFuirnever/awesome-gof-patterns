# SPDX-License-Identifier: MIT
"""After: extracted Adapter — translation logic centralized in one place."""

from typing import Any, Protocol


# Third-party library (cannot modify)
class ThirdPartyLogger:
    def log_message(self, level: int, msg: str, context: dict[str, Any] | None = None) -> None:
        print(f"[{level}] {msg} {context or ''}")


# Our application's expected interface
class AppLogger(Protocol):
    def debug(self, message: str) -> None: ...
    def info(self, message: str) -> None: ...
    def error(self, message: str, err: Exception | None = None) -> None: ...


# Adapter: translates AppLogger calls into ThirdPartyLogger calls
class LoggerAdapter:
    def __init__(self, target: ThirdPartyLogger) -> None:
        self._target = target

    def debug(self, message: str) -> None:
        self._target.log_message(0, message)

    def info(self, message: str) -> None:
        self._target.log_message(1, message, {"source": "app"})

    def error(self, message: str, err: Exception | None = None) -> None:
        self._target.log_message(3, message, {
            "source": "app",
            "error": str(err) if err else None,
        })


# Client code uses AppLogger — no knowledge of ThirdPartyLogger
class NotificationService:
    def __init__(self, logger: AppLogger) -> None:
        self._logger = logger

    def send(self, message: str) -> None:
        self._logger.info(message)
        self._logger.debug(f"notification sent: {message}")
