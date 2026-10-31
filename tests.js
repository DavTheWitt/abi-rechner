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
  ...[
    ["16", "Punkte dürfen nicht über 15 liegen."],
    ["-1", "Punkte dürfen nicht unter 0 liegen."],
    ["", "Bitte Punkte eingeben."],
    ["7,5", "Punkte müssen eine ganze Zahl sein."],
    ["abc", "Punkte müssen eine Zahl sein."],
    [null, "Bitte Punkte eingeben."],
    [undefined, "Bitte Punkte eingeben."],
  ].map(([eingabe, fehler]) => ({
    name: `Punkte ${JSON.stringify(eingabe)} werden mit passender Meldung abgelehnt`,
    pruefe() {
      const ergebnis = rechner.pruefePunkte(eingabe);
      erwarteGleich(ergebnis.ok, false);
      erwarteGleich(ergebnis.fehler, fehler);
    },
  })),
  ...[["12,0", 12], [" 12 ", 12], ["12.0", 12]].map(([eingabe, punkte]) => ({
    name: `Punkte ${JSON.stringify(eingabe)} werden als ${punkte} angenommen`,
    pruefe() {
      erwarteGleich(rechner.pruefePunkte(eingabe).wert, punkte);
    },
  })),
  ...[["", "Bitte einen Fachnamen eingeben."], ["   ", "Bitte einen Fachnamen eingeben."], [null, "Bitte einen Fachnamen eingeben."], [undefined, "Bitte einen Fachnamen eingeben."]].map(
    ([eingabe, fehler]) => ({
      name: `Fachname ${JSON.stringify(eingabe)} wird abgelehnt`,
      pruefe() {
        const ergebnis = rechner.pruefeName(eingabe);
        erwarteGleich(ergebnis.ok, false);
        erwarteGleich(ergebnis.fehler, fehler);
      },
    })
  ),
  {
    name: "Fachname wird getrimmt",
    pruefe() {
      const ergebnis = rechner.pruefeName("  Mathe ");
      erwarteGleich(ergebnis.ok, true);
      erwarteGleich(ergebnis.wert, "Mathe");
    },
  },
  {
    name: "Leere Liste ergibt keinen Durchschnitt und den Strich als Text",
    pruefe() {
      erwarteGleich(rechner.durchschnitt([]), null);
      erwarteGleich(rechner.formatiereSchnitt(null), "–");
    },
  },
  {
    name: "Leeres Zielnote-Feld bedeutet kein Ziel",
    pruefe() {
      const ergebnis = rechner.pruefeZielNote("");
      erwarteGleich(ergebnis.ok, true);
      erwarteGleich(ergebnis.wert, null);
    },
  },
  {
    name: "Zielnote 1.5 mit Punkt wird angenommen, abc abgelehnt",
    pruefe() {
      erwarteGleich(rechner.pruefeZielNote("1.5").wert, 1.5);
      erwarteGleich(rechner.pruefeZielNote("abc").ok, false);
    },
  },
  {
    name: "noteZuPunkten rechnet 1,0 zu 14 und 4,0 zu 5 um",
    pruefe() {
      erwarteGleich(rechner.noteZuPunkten(1), 14);
      erwarteGleich(rechner.noteZuPunkten(4), 5);
      erwarteGleich(rechner.noteZuPunkten(1.6), 12.2);
    },
  },
  {
    name: "Vergleich mit Ziel: unter Ziel, genau erreicht, fehlende Werte",
    pruefe() {
      const unter = rechner.vergleicheMitZiel(11, 12);
      erwarteGleich(unter.erreicht, false);
      erwarteGleich(rechner.formatiereAbstand(unter), "1,00 Punkte unter Ziel");
      const genau = rechner.vergleicheMitZiel(12.2, rechner.noteZuPunkten(1.6));
      erwarteGleich(genau.erreicht, true);
      erwarteGleich(rechner.formatiereAbstand(genau), "Ziel genau erreicht");
      erwarteGleich(rechner.vergleicheMitZiel(null, 12), null);
      erwarteGleich(rechner.vergleicheMitZiel(12, null), null);
      erwarteGleich(rechner.formatiereAbstand(null), "");
    },
  },
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
  {
    name: "Zielnote 4,1 wird abgelehnt",
    pruefe() {
      const ergebnis = rechner.pruefeZielNote("4,1");
      erwarteGleich(ergebnis.ok, false);
      erwarteGleich(ergebnis.fehler, "Schlechter als 4,0 bedeutet: Abitur nicht bestanden.");
    },
  },
  ...[["1,0", 1], ["4,0", 4]].map(([eingabe, note]) => ({
    name: `Zielnote ${eingabe} wird angenommen`,
    pruefe() {
      const ergebnis = rechner.pruefeZielNote(eingabe);
      erwarteGleich(ergebnis.ok, true);
      erwarteGleich(ergebnis.wert, note);
    },
  })),
  {
    name: "Speichern und Laden ergibt dieselben Fächer und dieselbe Zielnote",
    pruefe() {
      const faecher = [
        { name: "Mathe", punkte: 10 },
        { name: "Deutsch", punkte: 13 },
      ];
      const zustand = rechner.ladeZustand(rechner.serialisiereZustand(faecher, "1,6"));
      erwarteGleich(JSON.stringify(zustand.faecher), JSON.stringify(faecher));
      erwarteGleich(zustand.ziel, "1,6");
    },
  },
  ...[null, "", "{kaputt", "[]", "42", '{"faecher":"x"}'].map((gespeichert) => ({
    name: `Gespeicherter Wert ${JSON.stringify(gespeichert)} ergibt einen leeren Zustand`,
    pruefe() {
      const zustand = rechner.ladeZustand(gespeichert);
      erwarteGleich(zustand.faecher.length, 0);
      erwarteGleich(zustand.ziel, "");
    },
  })),
  {
    name: "Ungültige gespeicherte Fächer werden verworfen, gültige bleiben",
    pruefe() {
      const gespeichert = JSON.stringify({
        faecher: [
          { name: "Mathe", punkte: 12 },
          { name: "Deutsch", punkte: 16 },
          { name: "  ", punkte: 5 },
          { name: "Kunst", punkte: "7" },
          null,
          { name: "Sport", punkte: 7 },
        ],
        ziel: "2,0",
      });
      const zustand = rechner.ladeZustand(gespeichert);
      erwarteGleich(zustand.faecher.map((fach) => fach.name).join(","), "Mathe,Sport");
      erwarteGleich(zustand.ziel, "2,0");
    },
  },
  {
    name: "Gespeicherte Fächer mit Name als Zahl, Objekt oder Array werden verworfen",
    pruefe() {
      const gespeichert = JSON.stringify({
        faecher: [
          { name: 123, punkte: 5 },
          { name: {}, punkte: 5 },
          { name: ["a"], punkte: 5 },
          { punkte: 5 },
          { name: "Mathe", punkte: 12 },
        ],
        ziel: "",
      });
      const zustand = rechner.ladeZustand(gespeichert);
      erwarteGleich(zustand.faecher.map((fach) => fach.name).join(","), "Mathe");
    },
  },
  ...[7.5, -1].map((punkte) => ({
    name: `Gespeicherte Punkte ${punkte} werden verworfen`,
    pruefe() {
      const gespeichert = rechner.serialisiereZustand([{ name: "Mathe", punkte }], "");
      erwarteGleich(rechner.ladeZustand(gespeichert).faecher.length, 0);
    },
  })),
  ...["5,0", "abc"].map((zielNote) => ({
    name: `Gespeicherte Zielnote ${JSON.stringify(zielNote)} wird verworfen, gültige Fächer bleiben`,
    pruefe() {
      const gespeichert = rechner.serialisiereZustand([{ name: "Mathe", punkte: 12 }], zielNote);
      const zustand = rechner.ladeZustand(gespeichert);
      erwarteGleich(zustand.ziel, "");
      erwarteGleich(zustand.faecher.map((fach) => fach.name).join(","), "Mathe");
    },
  })),
  {
    name: "Leerer Zustand bleibt nach Speichern und Laden leer",
    pruefe() {
      const zustand = rechner.ladeZustand(rechner.serialisiereZustand([], ""));
      erwarteGleich(zustand.faecher.length, 0);
      erwarteGleich(zustand.ziel, "");
    },
  },
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
