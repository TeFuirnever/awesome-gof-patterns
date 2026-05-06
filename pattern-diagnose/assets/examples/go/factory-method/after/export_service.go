// SPDX-License-Identifier: MIT
// After: extracted Factory Method — creation logic deferred to factory function

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

// Exporter is the product interface. In Go, satisfied implicitly.
type Exporter interface {
	Export(doc Document) (string, error)
}

type JsonExporter struct{}

func (e *JsonExporter) Export(doc Document) (string, error) {
	b, err := json.Marshal(map[string]string{"title": doc.Title, "body": doc.Content})
	return string(b), err
}

type CsvExporter struct{}

func (e *CsvExporter) Export(doc Document) (string, error) {
	return fmt.Sprintf(`"title","content"%s"%s","%s"`, "\n", doc.Title, doc.Content), nil
}

type XmlExporter struct{}

func (e *XmlExporter) Export(doc Document) (string, error) {
	return fmt.Sprintf("<doc><title>%s</title><body>%s</body></doc>", doc.Title, doc.Content), nil
}

// Factory function — sufficient when creation logic is stateless.
// Go's implicit interface satisfaction means no class hierarchy needed.
func NewExporter(format string) (Exporter, error) {
	switch format {
	case "json":
		return &JsonExporter{}, nil
	case "csv":
		return &CsvExporter{}, nil
	case "xml":
		return &XmlExporter{}, nil
	default:
		return nil, fmt.Errorf("unknown format: %s", format)
	}
}

// Client code no longer constructs exporters directly.
type ExportService struct{}

func (s *ExportService) Export(doc Document, format string) (string, error) {
	exporter, err := NewExporter(format)
	if err != nil {
		return "", err
	}
	return exporter.Export(doc)
}
