# SPDX-License-Identifier: MIT
"""Before: tight coupling on notification — Observer candidate."""

from dataclasses import dataclass


@dataclass
class StockPrice:
    symbol: str
    price: float


# Dashboard, AlertService, AuditLog directly wired in constructor
class StockTicker:
    def __init__(
        self,
        dashboard: "Dashboard",
        alert_service: "AlertService",
        audit_log: "AuditLog",
    ) -> None:
        self._prices: dict[str, float] = {}
        self._dashboard = dashboard
        self._alert = alert_service
        self._audit = audit_log

    def update_price(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        # Every new consumer requires modifying this method
        self._dashboard.render(price)
        self._alert.check(price)
        self._audit.record(price)


class Dashboard:
    def render(self, price: float) -> None:
        print(f"Dashboard rendering: {price}")


class AlertService:
    def check(self, price: float) -> None:
        if price > 1000:
            print(f"ALERT: price above threshold: {price}")


class AuditLog:
    def record(self, price: float) -> None:
        print(f"Audit: price recorded: {price}")
