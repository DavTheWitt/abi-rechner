# Offene Punkte

Alles, was beim Code-Review (31.10.2026) gefunden und noch nicht behoben wurde. Nichts davon ist ein schwerer Fehler. Sortiert nach Nutzen.

## Fehlende Tests (`tests.js`)

- `pruefePunkte`: Grenzen 15,5 und -0,5, die Eingabe "-0", ein Zahlentyp statt Text.
- `pruefeZielNote`: Grenzen 0,99 und 4,01, Eingabe mit Leerzeichen.
- Rundung: Durchschnitt wie 12,333… und Zielpunkte mit Gleitkommafehlern.
- `ladeZustand`: gespeichertes `ziel` als Zahl oder `null`, fehlendes Feld `ziel`.

## Kleine Aufräumarbeiten

- `index.html`, Zurücksetzen: `localStorage.removeItem` wird sofort von `zeichne()` und `speichere()` überschrieben. Das `try { removeItem } catch {}` ist überflüssig. Weglassen oder kommentieren.
- `index.html`: `speichere()` läuft bei jedem `zeichne()`, auch direkt nach dem Laden. Unnötig, aber harmlos. Bereinigt dabei gespeicherte ungültige Daten, das ist wahrscheinlich gewollt.
- `index.html`: Das Muster `try { localStorage… } catch {}` kommt dreimal vor. Kleine Hilfsfunktionen wären möglich, lohnen sich aber nur knapp.
- `rechner.js`: Die Fehlertexte nennen "0", "15", "1,0" und "4,0" fest, obwohl `MIN_PUNKTE`, `MAX_PUNKTE`, `BESTE_NOTE` und `SCHLECHTESTE_NOTE` existieren.
- `rechner.js`: Die Zahlen 17 und 3 in `noteZuPunkten` haben keine benannten Konstanten.
- `rechner.js`: `BESTE_NOTE` und `SCHLECHTESTE_NOTE` stehen mitten in der Datei. Alle Konstanten oben wären übersichtlicher.

## Bedienbarkeit (`index.html`)

- Die "Entfernen"-Buttons haben keinen eindeutigen Namen für Screenreader. Ein `aria-label` wie "Mathe entfernen" würde helfen.
- Fachnamen haben keine Längenbegrenzung (`maxlength`).
- Doppelte Fächer werden nicht erkannt.

## Hinweis, kein Fehler

- Alle Seiten, die per `file://` geöffnet werden, teilen sich den localStorage-Schlüssel "abi-rechner". Bei lokaler Nutzung unkritisch.
