# Offene Punkte

Alles, was beim Code-Review (31.10.2026) gefunden und noch nicht behoben wurde. Nichts davon ist ein schwerer Fehler. Sortiert nach Nutzen.

## Fehlende Tests (`tests.js`)

- `pruefePunkte`: Grenzen 15,5 und -0,5, die Eingabe "-0", ein Zahlentyp statt Text.
- `pruefeZielNote`: Grenzen 0,99 und 4,01, Eingabe mit Leerzeichen.
- Rundung: Durchschnitt wie 12,333… und Zielpunkte mit Gleitkommafehlern.
- `ladeZustand`: gespeichertes `ziel` als Zahl oder `null`, fehlendes Feld `ziel`.

## Kleine Aufräumarbeiten

- `index.html`: `speichere()` läuft bei jedem `zeichne()`, auch direkt nach dem Laden. Unnötig, aber harmlos. Bereinigt dabei gespeicherte ungültige Daten, das ist wahrscheinlich gewollt.
- `rechner.js`: Die Fehlertexte nennen "0", "15", "1,0" und "4,0" fest, obwohl `MIN_PUNKTE`, `MAX_PUNKTE`, `BESTE_NOTE` und `SCHLECHTESTE_NOTE` existieren.
- `rechner.js`: Die Zahlen 17 und 3 in `noteZuPunkten` haben keine benannten Konstanten.

## Bedienbarkeit (`index.html`)

- Fachnamen haben keine Längenbegrenzung (`maxlength`).

## Hinweis, kein Fehler

- Alle Seiten, die per `file://` geöffnet werden, teilen sich den localStorage-Schlüssel "abi-rechner". Bei lokaler Nutzung unkritisch.

## Aus dem zweiten Review (Commit 3363385)

- Die Meldung "Dieses Fach gibt es schon." steht in `index.html`, alle anderen Prüfmeldungen kommen aus `rechner.js`. Besser wäre eine Prüffunktion mit `{ ok, fehler }`, dann ist die Meldung testbar.
- `istDoppelt`: `trim()` auf `fach.name` ist unnötig, weil gespeicherte Namen schon getrimmt sind. Harmlos.
- Zurücksetzen leert die Eingabefelder für Fach und Punkte nicht. Halb getippte Eingaben bleiben stehen.
- `toLowerCase()` kennt keine Unicode-Normalisierung ("ß" gegen "SS", zusammengesetzte gegen vorkomponierte Umlaute). Für diesen Zweck vernachlässigbar.
- `SPEICHER_SCHLUESSEL` steht noch mitten in `rechner.js`, nicht bei den anderen Konstanten oben.
