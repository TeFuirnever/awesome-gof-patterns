// SPDX-License-Identifier: MIT
// After: extracted Observer — subject broadcasts, listeners subscribe independently

interface StockPrice {
  symbol: string;
  price: number;
}

interface StockPriceObserver {
  onPriceChange(price: StockPrice): void;
}

class StockTicker {
  private prices: Map<string, number> = new Map();
  private observers: StockPriceObserver[] = [];

  register(observer: StockPriceObserver): void {
    this.observers.push(observer);
  }

  unregister(observer: StockPriceObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  updatePrice(symbol: string, price: number): void {
    this.prices.set(symbol, price);
    const event: StockPrice = { symbol, price };

    for (const observer of this.observers) {
      try {
        observer.onPriceChange(event);
      } catch {
        // Error isolation: one failing observer must not block others
      }
    }
  }
}

// Consumers subscribe independently — StockTicker never knows their concrete types
class Dashboard implements StockPriceObserver {
  onPriceChange(price: StockPrice): void {
    console.log(`Dashboard rendering ${price.symbol}: ${price.price}`);
  }
}

class AlertService implements StockPriceObserver {
  onPriceChange(price: StockPrice): void {
    if (price.price > 1000) {
      console.log(`ALERT: ${price.symbol} above threshold`);
    }
  }
}
