// SPDX-License-Identifier: MIT
// After: extracted Factory Method — creation logic deferred to creator subtypes

interface Document {
  title: string;
  content: string;
}

interface Exporter {
  export(doc: Document): string;
}

class JsonExporter implements Exporter {
  export(doc: Document): string {
    return JSON.stringify({ title: doc.title, body: doc.content });
  }
}

class CsvExporter implements Exporter {
  export(doc: Document): string {
    return `"title","content"\n"${doc.title}","${doc.content}"`;
  }
}

class XmlExporter implements Exporter {
  export(doc: Document): string {
    return `<doc><title>${doc.title}</title><body>${doc.content}</body></doc>`;
  }
}

// Factory function — sufficient when creation logic is stateless
// (No need for a Creator class hierarchy in TypeScript)
function createExporter(format: string): Exporter {
  switch (format) {
    case "json":
      return new JsonExporter();
    case "csv":
      return new CsvExporter();
    case "xml":
      return new XmlExporter();
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Client code no longer constructs exporters directly
class ExportService {
  export(doc: Document, format: string): string {
    const exporter = createExporter(format);
    return exporter.export(doc);
  }
}
