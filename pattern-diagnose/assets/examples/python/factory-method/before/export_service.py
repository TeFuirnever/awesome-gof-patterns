# SPDX-License-Identifier: MIT
"""Before: conditional construction — Factory Method candidate."""

from dataclasses import dataclass


@dataclass
class Document:
    title: str
    content: str


class ExportService:
    def export(self, doc: Document, format: str) -> str:
        # Conditional construction: each new format branch touches this code
        if format == "json":
            import json
            return json.dumps({"title": doc.title, "body": doc.content})
        elif format == "csv":
            return f'"title","content"\n"{doc.title}","{doc.content}"'
        elif format == "xml":
            return f"<doc><title>{doc.title}</title><body>{doc.content}</body></doc>"
        else:
            raise ValueError(f"Unknown format: {format}")
