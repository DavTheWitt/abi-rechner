// Testfälle für rechner.js.
// Laufen im Browser über tests.html und mit Node über „node tests.js“.

// In Node kommt die Rechenlogik über require, im Browser aus dem vorher geladenen rechner.js.
const rechner = typeof require === "function" ? require("./rechner.js") : globalThis;

// Wirft einen Fehler, wenn ist und soll nicht gleich sind.
function erwarteGleich(ist, soll) {
  if (ist !== soll) {
    throw new Error(`erwartet ${JSON.stringify(soll)}, bekommen ${JSON.stringify(ist)}`);
  }
}

const TESTFAELLE = [
  {
    name: "Mathe 10, Deutsch 12, Englisch 14 ergibt 12,00",
    pruefe() {
      const faecher = [
        { name: "Mathe", punkte: 10 },
        { name: "Deutsch", punkte: 12 },
        { name: "Englisch", punkte: 14 },
      ];
      erwarteGleich(rechner.formatiereSchnitt(rechner.durchschnitt(faecher)), "12,00");
    },
  },
  ...["16", "-1", "", "7,5"].map((eingabe) => ({
    name: `Punkte ${JSON.stringify(eingabe)} werden abgelehnt`,
    pruefe() {
      erwarteGleich(rechner.pruefePunkte(eingabe).ok, false);
    },
  })),
  ...[0, 15].map((punkte) => ({
    name: `Punkte ${punkte} werden angenommen`,
    pruefe() {
      const ergebnis = rechner.pruefePunkte(String(punkte));
      erwarteGleich(ergebnis.ok, true);
      erwarteGleich(ergebnis.wert, punkte);
    },
  })),
  {
    name: "Fächer 12 und 13 mit Zielnote 1,6 ergeben 0,30 Punkte über Ziel",
    pruefe() {
      const faecher = [
        { name: "Mathe", punkte: 12 },
        { name: "Deutsch", punkte: 13 },
      ];
      const zielNote = rechner.pruefeZielNote("1,6");
      erwarteGleich(zielNote.ok, true);
      const ziel = rechner.noteZuPunkten(zielNote.wert);
      const vergleich = rechner.vergleicheMitZiel(rechner.durchschnitt(faecher), ziel);
      erwarteGleich(rechner.formatiereAbstand(vergleich), "0,30 Punkte über Ziel");
    },
  },
  ...["0,5", "7"].map((eingabe) => ({
    name: `Zielnote ${eingabe} wird abgelehnt`,
    pruefe() {
      erwarteGleich(rechner.pruefeZielNote(eingabe).ok, false);
    },
  })),
  ...[["1,0", 1], ["4,0", 4]].map(([eingabe, note]) => ({
    name: `Zielnote ${eingabe} wird angenommen`,
    pruefe() {
      const ergebnis = rechner.pruefeZielNote(eingabe);
      erwarteGleich(ergebnis.ok, true);
      erwarteGleich(ergebnis.wert, note);
    },
  })),
];

// Führt alle Testfälle aus. Gibt [{ name, bestanden, meldung }] zurück.
function fuehreTestsAus() {
  return TESTFAELLE.map((test) => {
    try {
      test.pruefe();
      return { name: test.name, bestanden: true, meldung: "" };
    } catch (fehler) {
      return { name: test.name, bestanden: false, meldung: fehler.message };
    }
  });
}

// Ausgabe für Node, nur wenn die Datei direkt gestartet wird.
if (typeof module !== "undefined" && require.main === module) {
  const ergebnisse = fuehreTestsAus();
  for (const ergebnis of ergebnisse) {
    console.log(ergebnis.bestanden ? `✓ ${ergebnis.name}` : `✗ ${ergebnis.name}: ${ergebnis.meldung}`);
  }
  const bestanden = ergebnisse.filter((ergebnis) => ergebnis.bestanden).length;
  console.log(`\n${bestanden} von ${ergebnisse.length} bestanden`);
  if (bestanden < ergebnisse.length) {
    process.exitCode = 1;
  }
}
