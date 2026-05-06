// SPDX-License-Identifier: MIT
// Before: manual listener list + tight coupling — Observer candidate

interface StockPrice {
  symbol: string;
  price: number;
}

// Dashboard, AlertService, and AuditLog are all hardcoded dependents
class StockTicker {
  private prices: Map<string, number> = new Map();

  // Dashboard, AlertService, AuditLog directly wired — adding a new consumer
  // requires modifying this class
  constructor(
    private dashboard: { render(price: number): void },
    private alertService: { check(price: number): void },
    private auditLog: { record(price: number): void },
  ) {}

  updatePrice(symbol: string, price: number): void {
    this.prices.set(symbol, price);

    // Every new consumer requires touching this method
    this.dashboard.render(price);
    this.alertService.check(price);
    this.auditLog.record(price);
  }
}
