// SPDX-License-Identifier: MIT
// Before: conditional construction — Factory Method candidate

package factorymethod

import (
	"encoding/json"
	"fmt"
)

// Document is the data to export.
type Document struct {
	Title   string
	Content string
}

// ExportService chooses exporter via if/else — each new format modifies this method.
type ExportService struct{}

func (s *ExportService) Export(doc Document, format string) (string, error) {
	// Conditional construction: each new format branch touches this code
	if format == "json" {
		b, _ := json.Marshal(map[string]string{"title": doc.Title, "body": doc.Content})
		return string(b), nil
	} else if format == "csv" {
		return fmt.Sprintf(`"title","content"%s"%s","%s"`, "\n", doc.Title, doc.Content), nil
	} else if format == "xml" {
		return fmt.Sprintf("<doc><title>%s</title><body>%s</body></doc>", doc.Title, doc.Content), nil
	}
	return "", fmt.Errorf("unknown format: %s", format)
}
