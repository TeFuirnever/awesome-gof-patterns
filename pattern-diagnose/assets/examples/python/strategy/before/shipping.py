# SPDX-License-Identifier: MIT
"""Before: long conditional on type — Strategy candidate."""

from dataclasses import dataclass


@dataclass
class Order:
    weight: float
    destination: str
    kind: str  # "standard" | "express" | "overnight"


def calculate_shipping(order: Order) -> float:
    if order.kind == "standard":
        return order.weight * 0.5 + 3
    elif order.kind == "express":
        return order.weight * 1.2 + 8
    elif order.kind == "overnight":
        base = order.weight * 2.5 + 15
        return base * 1.5 if order.destination.startswith("INTL-") else base
    raise ValueError(f"unknown kind: {order.kind}")
