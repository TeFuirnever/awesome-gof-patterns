// SPDX-License-Identifier: MIT
// After: extracted Observer — subject broadcasts, listeners subscribe independently

package observer

import "fmt"

// StockPrice represents a price update event.
type StockPrice struct {
	Symbol string
	Price  float64
}

// StockPriceObserver is the observer interface.
// In Go, interfaces are satisfied implicitly — no "implements" keyword needed.
type StockPriceObserver interface {
	OnPriceChange(price StockPrice)
}

// StockTicker broadcasts to registered observers without knowing their types.
type StockTicker struct {
	prices   map[string]float64
	observers []StockPriceObserver
}

func NewStockTicker() *StockTicker {
	return &StockTicker{
		prices: make(map[string]float64),
	}
}

func (t *StockTicker) Register(observer StockPriceObserver) {
	t.observers = append(t.observers, observer)
}

func (t *StockTicker) Unregister(target StockPriceObserver) {
	for i, o := range t.observers {
		if o == target {
			t.observers = append(t.observers[:i], t.observers[i+1:]...)
			return
		}
	}
}

func (t *StockTicker) UpdatePrice(symbol string, price float64) {
	t.prices[symbol] = price
	event := StockPrice{Symbol: symbol, Price: price}

	for _, observer := range t.observers {
		// Error isolation: one failing observer must not block others
		func() {
			defer func() { recover() }()
			observer.OnPriceChange(event)
		}()
	}
}

// Consumers satisfy StockPriceObserver implicitly
type Dashboard struct{}

func (d *Dashboard) OnPriceChange(price StockPrice) {
	fmt.Printf("Dashboard rendering %s: %.2f\n", price.Symbol, price.Price)
}

type AlertService struct{}

func (a *AlertService) OnPriceChange(price StockPrice) {
	if price.Price > 1000 {
		fmt.Printf("ALERT: %s above threshold\n", price.Symbol)
	}
}
