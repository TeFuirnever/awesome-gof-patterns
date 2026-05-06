// SPDX-License-Identifier: MIT
// After: extracted Adapter — translation logic centralized in one place

package adapter

import "fmt"

// ThirdPartyLogger is an external library (cannot modify).
type ThirdPartyLogger struct{}

func (l *ThirdPartyLogger) LogMessage(level int, msg string, context map[string]any) {
	fmt.Printf("[%d] %s %v\n", level, msg, context)
}

// AppLogger is our application's expected interface.
// Go interfaces are satisfied implicitly — LoggerAdapter will implement this
// without an explicit declaration.
type AppLogger interface {
	Debug(message string)
	Info(message string)
	Error(message string, err error)
}

// LoggerAdapter translates AppLogger calls into ThirdPartyLogger calls.
type LoggerAdapter struct {
	target *ThirdPartyLogger
}

func NewLoggerAdapter(target *ThirdPartyLogger) *LoggerAdapter {
	return &LoggerAdapter{target: target}
}

func (a *LoggerAdapter) Debug(message string) {
	a.target.LogMessage(0, message, nil)
}

func (a *LoggerAdapter) Info(message string) {
	a.target.LogMessage(1, message, map[string]any{"source": "app"})
}

func (a *LoggerAdapter) Error(message string, err error) {
	ctx := map[string]any{"source": "app"}
	if err != nil {
		ctx["error"] = err.Error()
	}
	a.target.LogMessage(3, message, ctx)
}

// Client code uses AppLogger — no knowledge of ThirdPartyLogger.
type NotificationService struct {
	logger AppLogger
}

func NewNotificationService(logger AppLogger) *NotificationService {
	return &NotificationService{logger: logger}
}

func (s *NotificationService) Send(message string) {
	s.logger.Info(message)
	s.logger.Debug(fmt.Sprintf("notification sent: %s", message))
}
