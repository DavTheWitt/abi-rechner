# abi-rechner
Abi-Rechner

## Umfang

### Version 1 (Runden 1 bis 3) (erledigt)

- **Runde 1:** Fächer mit Namen und Punkten (0 bis 15) eintragen und entfernen. Der Durchschnitt wird sofort mit zwei Nachkommastellen angezeigt. Ungültige Eingaben (leer, unter 0, über 15) werden abgelehnt.
  - Test: Mathe 10, Deutsch 12, Englisch 14 → Schnitt 12,00. Dann 16 eingeben → muss abgelehnt werden.
- **Runde 2:** Zielschnitt in Note eingeben, die dann in Punkte mit der Abi-formel umgerechnet wird. Die Seite zeigt, wie weit du darüber oder darunter liegst. Liegt der Schnitt darunter, ist die Anzeige deutlich rot, mit einer klaren, direkten Ansage.
  - Test: Schnitt 12,00, Zielnote 1,6 (= 12,20 Punkte) → „0,20 Punkte unter Ziel“ in Rot.
- **Runde 3:** Fächer, Punkte und Zielschnitt bleiben im Browser gespeichert (localStorage), auch nach dem Neuladen. Dazu ein Zurücksetzen-Button.
  - Test: Werte eintragen, F5 → alles noch da. Zurücksetzen → alles leer.

### Version 2 (Runden 4 bis 7, nach dem Hooks-Block)

- **Runde 4:** Jedes Fach bekommt einen Gewichtungsfaktor (Standard 1), den du selbst einstellst. Der Durchschnitt wird gewichtet berechnet. Keine fest eingebaute Regel für Leistungs- oder Grundkurse.
  - Test: Mathe Faktor 2 mit 10 Punkten, Deutsch Faktor 1 mit 13 → (10×2 + 13×1) / 3 = 11,00.
- **Runde 5:** „Was brauche ich noch?“: Pro Fach trägst du ein, wie viele Klausuren noch ausstehen. Die Seite berechnet, wie viele Punkte du im Schnitt noch brauchst, um dein Ziel zu erreichen. Ist es nicht mehr erreichbar, sagt sie das ehrlich. Claude erklärt dir vorher seine vereinfachende Annahme.
  - Annahme: Die Punkte eines Fachs zählen wie eine Klausur, jede offene Klausur zählt genauso viel, beides mit dem Faktor des Fachs.
  - Test: Mathe 10 (Faktor 2, 2 offen), Deutsch 13 (Faktor 1, 1 offen), Zielnote 1,6 → „im Schnitt mindestens 12,92 Punkte“. Zielnote 1,0 → „Nicht mehr erreichbar“ in Rot.
- **Runde 6:** Handytauglich und ordentliches Design, damit du den Link zeigen kannst. Weiter kein Framework, keine externen Bibliotheken.

### Wenn die anderen Punkte fertig sind, dann mach diese 

Login, Push-Nachrichten für alles was ansteht in einem bestimmten Zeitraum den du (Claude für sinnvoll hält), Datenbank, Hausaufgabenplaner wo man seine einträgt und als erledigt markieren kann, und Klausurtermine die man mit Datum und Klausur einträgt, 

**Stand 31.10.2026:**

- Umgesetzt: Hausaufgabenplaner (eintragen, als erledigt abhaken, entfernen), Klausurtermine (Datum und Klausur) und oben auf der Seite „Demnächst“: alles, was in den nächsten 7 Tagen ansteht, dazu überfällige Hausaufgaben.
  - Test: Hausaufgabe für morgen und Klausur in 3 Tagen eintragen → beide stehen unter „Demnächst“. Hausaufgabe abhaken → sie verschwindet dort.
- Bewusst weggelassen: Login, Datenbank und echte Push-Nachrichten (auch bei geschlossener Seite). Dafür bräuchte es einen Server oder einen fremden Dienst. Das widerspricht „ohne Installation, keine externen Bibliotheken“, und die Noten lägen dann nicht mehr nur im eigenen Browser. Die Daten bleiben im localStorage, die Erinnerung übernimmt „Demnächst“.
