# abi-rechner
Abi-Rechner

## Umfang

### Version 1 (Runden 1 bis 3)

- **Runde 1:** Fächer mit Namen und Punkten (0 bis 15) eintragen und entfernen. Der Durchschnitt wird sofort mit zwei Nachkommastellen angezeigt. Ungültige Eingaben (leer, unter 0, über 15) werden abgelehnt.
  - Test: Mathe 10, Deutsch 12, Englisch 14 → Schnitt 12,00. Dann 16 eingeben → muss abgelehnt werden.
- **Runde 2:** Zielschnitt in Note eingeben, die dann in Punkte mit der Abi-formel umgerechnet wird. Die Seite zeigt, wie weit du darüber oder darunter liegst. Liegt der Schnitt darunter, ist die Anzeige deutlich rot, mit einer klaren, direkten Ansage.
  - Test: Schnitt 12,00, Ziel 13 → „1,00 Punkte unter Ziel“ in Rot.
- **Runde 3:** Fächer, Punkte und Zielschnitt bleiben im Browser gespeichert (localStorage), auch nach dem Neuladen. Dazu ein Zurücksetzen-Button.
  - Test: Werte eintragen, F5 → alles noch da. Zurücksetzen → alles leer.

### Version 2 (Runden 4 bis 7, nach dem Hooks-Block)

- **Runde 4:** Jedes Fach bekommt einen Gewichtungsfaktor (Standard 1), den du selbst einstellst. Der Durchschnitt wird gewichtet berechnet. Keine fest eingebaute Regel für Leistungs- oder Grundkurse.
  - Test: Mathe Faktor 2 mit 10 Punkten, Deutsch Faktor 1 mit 13 → (10×2 + 13×1) / 3 = 11,00.
- **Runde 5:** „Was brauche ich noch?“: Pro Fach trägst du ein, wie viele Klausuren noch ausstehen. Die Seite berechnet, wie viele Punkte du im Schnitt noch brauchst, um dein Ziel zu erreichen. Ist es nicht mehr erreichbar, sagt sie das ehrlich. Claude erklärt dir vorher seine vereinfachende Annahme.
- **Runde 6:** Umrechnung von Punkten in eine Note. Claude recherchiert die in Hamburg übliche Umrechnung und nennt die Quelle, bevor er sie einbaut. Du öffnest die Quelle selbst und vergleichst.
- **Runde 7:** Handytauglich und ordentliches Design, damit du den Link zeigen kannst. Weiter kein Framework, keine externen Bibliotheken.

### Ausdrücklich fürs erste nicht dabei

Login, Push-Nachrichten, App Store, Datenbank, Hausaufgaben und Klausurtermine, die echte Abi-Berechnung mit Blöcken und einzubringenden Kursen.
