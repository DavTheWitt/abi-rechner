# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Runde 3 ist umgesetzt (Speichern im localStorage und Zurücksetzen). Die geplanten Runden stehen in der `README.md`. Es gibt kein Build-System. Tests für `rechner.js` sind vorhanden (`tests.js`).

- Code-Review mit dem Subagent `code-reviewer` ist erledigt (Stand 31.10.2026): Name-Typ beim Laden, strenge Zahlprüfung und fehlende Tests sind behoben.
- Offen, bewusst nicht umgesetzt: überflüssiges `removeItem` beim Zurücksetzen, feste Zahlen in Fehlertexten, `aria-label` bei den Entfernen-Buttons.

## Projektregeln

- Antworten und Commit-Nachrichten auf Deutsch.
- Das Projekt besteht aus `index.html` (Oberfläche), `rechner.js` (Rechenlogik), `tests.js` und `tests.html`. Die Webseite (index.html mit rechner.js) muss ohne Installation direkt im Browser laufen. Kein Framework, keine externen Bibliotheken.
- Niemals echte Noten oder persönliche Daten ins Repository.
- Jede Änderung auf einem eigenen Branch. Niemals direkt auf `main` committen oder pushen.
- Vor jeder Änderung kurz den Plan nennen.
- Node nur zum Ausführen der Tests auf dem Entwicklungsrechner, keine npm-Pakete.

## Commands

`index.html` im Browser öffnen. Tests: `node tests.js` oder `tests.html` im Browser öffnen.

## Architecture

- `rechner.js` enthält nur die Rechenlogik und greift nie auf die Seite zu.
- `index.html` nimmt die Eingaben entgegen, lässt sie von `rechner.js` prüfen, zeigt Liste und Durchschnitt an und speichert den Zustand im localStorage.
- `tests.js` enthält alle Testfälle einmal; `tests.html` zeigt sie im Browser an, `node tests.js` in der Konsole.
