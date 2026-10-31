# Offene Punkte

Was aus den Code-Reviews (31.10.2026) noch offen ist. Nichts davon ist ein schwerer Fehler.

- `index.html`: Fachnamen haben keine Längenbegrenzung (`maxlength`).
- `index.html`: `zeichne()` speichert jedes Mal, auch direkt nach dem Laden. Unnötig, aber harmlos; bereinigt dabei gespeicherte ungültige Daten.
- `toLowerCase()` kennt keine Unicode-Normalisierung ("ß" gegen "SS", zusammengesetzte gegen vorkomponierte Umlaute). Für diesen Zweck vernachlässigbar.
- `index.html`: Die dritte Spaltenüberschrift ist leer. Der Rahmen `#999` am Zielfeld hat zu wenig Kontrast (etwa 2,85:1, nötig sind 3:1, z. B. `#767676`). Fehlermeldungen sind nicht mit ihrem Feld verknüpft (`aria-invalid`, `aria-describedby`).
- `index.html`: Ein alter Fehlertext wie „Dieses Fach gibt es schon.“ bleibt stehen, auch wenn man das Fach danach entfernt.
- `tests.js`: Der Vergleich über JSON macht `-0` zu `0` und `NaN` zu `null`. Heute harmlos, ein späterer Fehler dort bliebe aber unbemerkt.
- Das Speicherformat `{ faecher, ziel }` steht in `index.html` und in `tests.js`. Ändert man es nur in `index.html`, bleiben die Tests grün.
- Die Zielnote wird über `String(zahl)` angezeigt: `2,0` wird zu „Note 2“.
- `README.md`, Test zu Runde 2: „Ziel 13“ ist eine Punktzahl, das Feld erwartet aber eine Note. Entscheidung offen, z. B. „Zielnote 1,6 → 0,20 Punkte unter Ziel“.
- Hinweis, kein Fehler: Alle Seiten, die per `file://` geöffnet werden, teilen sich den localStorage-Schlüssel "abi-rechner". Bei lokaler Nutzung unkritisch.
