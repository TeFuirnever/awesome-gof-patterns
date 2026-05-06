// SPDX-License-Identifier: MIT
// Before: incompatible interface shapes — Adapter candidate

package adapter

import "fmt"

// ThirdPartyLogger is an external library (cannot modify).
type ThirdPartyLogger struct{}

func (l *ThirdPartyLogger) LogMessage(level int, msg string, context map[string]any) {
	fmt.Printf("[%d] %s %v\n", level, msg, context)
}

// NotificationService manually translates calls at every site.
type NotificationService struct {
	logger *ThirdPartyLogger
}

func NewNotificationService(logger *ThirdPartyLogger) *NotificationService {
	return &NotificationService{logger: logger}
}

func (s *NotificationService) Send(message string) {
	// Glue code accumulates here — manual translation at every call site
	s.logger.LogMessage(1, message, map[string]any{"source": "notification"})
	s.logger.LogMessage(3, fmt.Sprintf("notification sent: %s", message), map[string]any{
		"timestamp": "now",
	})
}
