// SPDX-License-Identifier: MIT
// Before: conditional construction — Factory Method candidate

interface Document {
  title: string;
  content: string;
}

// Every new format requires modifying this switch statement
class ExportService {
  export(doc: Document, format: string): string {
    let exporter;

    // Conditional construction: each new format branch touches this code
    if (format === "json") {
      exporter = {
        export: (d: Document) => JSON.stringify({ title: d.title, body: d.content }),
      };
    } else if (format === "csv") {
      exporter = {
        export: (d: Document) => `"title","content"\n"${d.title}","${d.content}"`,
      };
    } else if (format === "xml") {
      exporter = {
        export: (d: Document) => `<doc><title>${d.title}</title><body>${d.content}</body></doc>`,
      };
    } else {
      throw new Error(`Unknown format: ${format}`);
    }

    return exporter.export(doc);
  }
}
