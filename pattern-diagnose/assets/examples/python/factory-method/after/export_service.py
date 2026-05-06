# SPDX-License-Identifier: MIT
"""After: extracted Factory Method — creation logic deferred to factory function."""

import json
from dataclasses import dataclass
from typing import Protocol


@dataclass
class Document:
    title: str
    content: str


class Exporter(Protocol):
    def export(self, doc: Document) -> str: ...


class JsonExporter:
    def export(self, doc: Document) -> str:
        return json.dumps({"title": doc.title, "body": doc.content})


class CsvExporter:
    def export(self, doc: Document) -> str:
        return f'"title","content"\n"{doc.title}","{doc.content}"'


class XmlExporter:
    def export(self, doc: Document) -> str:
        return f"<doc><title>{doc.title}</title><body>{doc.content}</body></doc>"


# Factory function — sufficient when creation logic is stateless
def create_exporter(format: str) -> Exporter:
    match format:
        case "json":
            return JsonExporter()
        case "csv":
            return CsvExporter()
        case "xml":
            return XmlExporter()
        case _:
            raise ValueError(f"Unknown format: {format}")


# Client code no longer constructs exporters directly
class ExportService:
    def export(self, doc: Document, format: str) -> str:
        exporter = create_exporter(format)
        return exporter.export(doc)
