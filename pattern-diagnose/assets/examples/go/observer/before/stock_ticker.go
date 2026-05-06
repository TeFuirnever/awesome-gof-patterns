// SPDX-License-Identifier: MIT
// Before: tight coupling on notification — Observer candidate

package observer

import "fmt"

// StockPrice represents a price update event.
type StockPrice struct {
	Symbol string
	Price  float64
}

// Dashboard, AlertService, AuditLog directly wired — adding a new consumer
// requires modifying StockTicker.
type Dashboard struct{}

func (d *Dashboard) Render(price float64) {
	fmt.Printf("Dashboard rendering: %.2f\n", price)
}

type AlertService struct{}

func (a *AlertService) Check(price float64) {
	if price > 1000 {
		fmt.Printf("ALERT: price above threshold: %.2f\n", price)
	}
}

type AuditLog struct{}

func (al *AuditLog) Record(price float64) {
	fmt.Printf("Audit: price recorded: %.2f\n", price)
}

// StockTicker knows every concrete consumer — cannot add consumers without modification.
type StockTicker struct {
	prices      map[string]float64
	dashboard   *Dashboard
	alertService *AlertService
	auditLog    *AuditLog
}

func NewStockTicker(d *Dashboard, a *AlertService, al *AuditLog) *StockTicker {
	return &StockTicker{
		prices:       make(map[string]float64),
		dashboard:    d,
		alertService: a,
		auditLog:     al,
	}
}

func (t *StockTicker) UpdatePrice(symbol string, price float64) {
	t.prices[symbol] = price
	// Every new consumer requires touching this method
	t.dashboard.Render(price)
	t.alertService.Check(price)
	t.auditLog.Record(price)
}
