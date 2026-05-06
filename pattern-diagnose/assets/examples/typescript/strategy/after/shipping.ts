// SPDX-License-Identifier: MIT
// After: extracted Strategy

interface Order {
  weight: number;
  destination: string;
}

export interface ShippingStrategy {
  calculate(order: Order): number;
}

export class StandardShipping implements ShippingStrategy {
  calculate(order: Order): number {
    return order.weight * 0.5 + 3;
  }
}

export class ExpressShipping implements ShippingStrategy {
  calculate(order: Order): number {
    return order.weight * 1.2 + 8;
  }
}

export class OvernightShipping implements ShippingStrategy {
  calculate(order: Order): number {
    const base = order.weight * 2.5 + 15;
    return order.destination.startsWith("INTL-") ? base * 1.5 : base;
  }
}

export function calculateShipping(order: Order, strategy: ShippingStrategy): number {
  return strategy.calculate(order);
}
