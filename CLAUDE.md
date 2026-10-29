# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Das Repository ist noch ein Stub: Es enthält nur die `README.md` und den Initial-Commit. Es gibt noch keinen Quellcode, kein Build-System und keine Tests.

## Projektregeln

- Antworten und Commit-Nachrichten auf Deutsch.
- Die App besteht aus `index.html` (Oberfläche), `rechner.js` (Rechenlogik) und später `tests.html`. Kein Framework, keine externen Bibliotheken, keine Installation.
- Niemals echte Noten oder persönliche Daten ins Repository.
- Jede Änderung auf einem eigenen Branch. Niemals direkt auf `main` committen oder pushen.
- Vor jeder Änderung kurz den Plan nennen.

## Commands

Noch keine definiert. Die App läuft ohne Installation direkt im Browser (`index.html` öffnen).

## Architecture

Geplant: Oberfläche (`index.html`) und Rechenlogik (`rechner.js`) sind getrennt. Die Rechenlogik soll unabhängig von der Oberfläche testbar sein (später über `tests.html`).
