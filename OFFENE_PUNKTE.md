# Offene Punkte

Was aus den Code-Reviews (31.10.2026) noch offen ist. Nichts davon ist ein schwerer Fehler.

- `index.html`: `zeichne()` speichert jedes Mal, auch direkt nach dem Laden. Unnötig, aber harmlos; bereinigt dabei gespeicherte ungültige Daten.
- `toLowerCase()` kennt keine Unicode-Normalisierung ("ß" gegen "SS", zusammengesetzte gegen vorkomponierte Umlaute). Für diesen Zweck vernachlässigbar.
- `tests.js`: Der Vergleich über JSON macht `-0` zu `0` und `NaN` zu `null`. Heute harmlos, ein späterer Fehler dort bliebe aber unbemerkt.
- Die Speicherformate `{ faecher, ziel }` und `{ hausaufgaben, klausuren }` stehen in `index.html` und in `tests.js`. Ändert man sie nur in `index.html`, bleiben die Tests grün.
- Werte eines Fachs (Punkte, Faktor, offene Klausuren) lassen sich nicht nachträglich ändern, nur entfernen und neu eintragen.
- Hinweis, kein Fehler: Alle Seiten, die per `file://` geöffnet werden, teilen sich die localStorage-Schlüssel. Bei lokaler Nutzung unkritisch.
