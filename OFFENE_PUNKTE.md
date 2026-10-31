# Offene Punkte

Was aus den Code-Reviews (31.10.2026) noch offen ist. Nichts davon ist ein schwerer Fehler.

- `index.html`: Fachnamen haben keine Längenbegrenzung (`maxlength`).
- `index.html`: `zeichne()` speichert jedes Mal, auch direkt nach dem Laden. Unnötig, aber harmlos; bereinigt dabei gespeicherte ungültige Daten.
- `toLowerCase()` kennt keine Unicode-Normalisierung ("ß" gegen "SS", zusammengesetzte gegen vorkomponierte Umlaute). Für diesen Zweck vernachlässigbar.
- Hinweis, kein Fehler: Alle Seiten, die per `file://` geöffnet werden, teilen sich den localStorage-Schlüssel "abi-rechner". Bei lokaler Nutzung unkritisch.
