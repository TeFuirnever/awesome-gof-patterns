// SPDX-License-Identifier: MIT
// Before: long conditional on type — Strategy candidate

type ShippingKind = "standard" | "express" | "overnight";

interface Order {
  weight: number;
  destination: string;
  kind: ShippingKind;
}

export function calculateShipping(order: Order): number {
  if (order.kind === "standard") {
    return order.weight * 0.5 + 3;
  } else if (order.kind === "express") {
    return order.weight * 1.2 + 8;
  } else if (order.kind === "overnight") {
    const base = order.weight * 2.5 + 15;
    return order.destination.startsWith("INTL-") ? base * 1.5 : base;
  }
  throw new Error(`unknown kind: ${order.kind}`);
}
