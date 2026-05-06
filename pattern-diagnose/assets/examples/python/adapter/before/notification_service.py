# SPDX-License-Identifier: MIT
"""Before: incompatible interface shapes — Adapter candidate."""

from typing import Any


# Third-party library (cannot modify)
class ThirdPartyLogger:
    def log_message(self, level: int, msg: str, context: dict[str, Any] | None = None) -> None:
        print(f"[{level}] {msg} {context or ''}")


class NotificationService:
    def __init__(self, third_party: ThirdPartyLogger) -> None:
        self._logger = third_party

    def send(self, message: str) -> None:
        # Glue code accumulates here — manual translation at every call site
        self._logger.log_message(1, message, {"source": "notification"})
        self._logger.log_message(
            3, f"notification sent: {message}", {"timestamp": "now"}
        )
