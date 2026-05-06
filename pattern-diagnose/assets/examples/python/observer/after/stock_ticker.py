# SPDX-License-Identifier: MIT
"""After: extracted Observer — subject broadcasts, listeners subscribe independently."""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class StockPrice:
    symbol: str
    price: float


class StockPriceObserver(Protocol):
    def on_price_change(self, price: StockPrice) -> None: ...


class StockTicker:
    def __init__(self) -> None:
        self._prices: dict[str, float] = {}
        self._observers: list[StockPriceObserver] = []

    def register(self, observer: StockPriceObserver) -> None:
        self._observers.append(observer)

    def unregister(self, observer: StockPriceObserver) -> None:
        self._observers = [o for o in self._observers if o is not observer]

    def update_price(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        event = StockPrice(symbol=symbol, price=price)
        for observer in self._observers:
            try:
                observer.on_price_change(event)
            except Exception:
                # Error isolation: one failing observer must not block others
                pass


# Consumers subscribe independently — StockTicker never knows their concrete types
class Dashboard:
    def on_price_change(self, price: StockPrice) -> None:
        print(f"Dashboard rendering {price.symbol}: {price.price}")


class AlertService:
    def on_price_change(self, price: StockPrice) -> None:
        if price.price > 1000:
            print(f"ALERT: {price.symbol} above threshold")
