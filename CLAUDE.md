# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Runde 1 ist umgesetzt (Fächer mit Punkten eintragen und entfernen, Durchschnitt anzeigen). Die geplanten Runden stehen in der `README.md`. Es gibt kein Build-System und noch keine Tests.

## Projektregeln

- Antworten und Commit-Nachrichten auf Deutsch.
- Die App besteht aus `index.html` (Oberfläche), `rechner.js` (Rechenlogik) und später `tests.html`. Kein Framework, keine externen Bibliotheken, keine Installation.
- Niemals echte Noten oder persönliche Daten ins Repository.
- Jede Änderung auf einem eigenen Branch. Niemals direkt auf `main` committen oder pushen.
- Vor jeder Änderung kurz den Plan nennen.

## Commands

Keine. `index.html` im Browser öffnen. Kein Node installiert, deshalb laufen Tests im Browser.

## Architecture

- `rechner.js` enthält nur die Rechenlogik und greift nie auf die Seite zu.
- `index.html` nimmt die Eingaben entgegen, lässt sie von `rechner.js` prüfen und zeigt Liste und Durchschnitt an.
- Später testet `tests.html` die Rechenlogik, ohne die Oberfläche zu brauchen.
