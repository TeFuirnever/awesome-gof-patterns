# SPDX-License-Identifier: MIT
"""After: extracted Strategy. Functional form preferred for stateless algorithms."""

from dataclasses import dataclass
from typing import Callable, Protocol


@dataclass
class Order:
    weight: float
    destination: str


# Functional form (preferred for simple stateless algorithms in Python)
ShippingStrategy = Callable[[Order], float]


def standard(order: Order) -> float:
    return order.weight * 0.5 + 3


def express(order: Order) -> float:
    return order.weight * 1.2 + 8


def overnight(order: Order) -> float:
    base = order.weight * 2.5 + 15
    return base * 1.5 if order.destination.startswith("INTL-") else base


def calculate_shipping(order: Order, strategy: ShippingStrategy) -> float:
    return strategy(order)


# Class form (use when strategy needs state, configuration, or DI)
class ShippingStrategyClass(Protocol):
    def calculate(self, order: Order) -> float: ...


class OvernightWithSurcharge:
    def __init__(self, intl_multiplier: float = 1.5) -> None:
        self.intl_multiplier = intl_multiplier

    def calculate(self, order: Order) -> float:
        base = order.weight * 2.5 + 15
        return base * self.intl_multiplier if order.destination.startswith("INTL-") else base
