// Testfälle für rechner.js. Laufen im Browser über tests.html und mit Node über „node tests.js“.

// In Node kommt die Rechenlogik über require, im Browser aus dem vorher geladenen rechner.js.
const rechner = typeof require === "function" ? require("./rechner.js") : globalThis;

const fach = (name, punkte) => ({ name, punkte });
const gespeichert = (faecher, ziel) => JSON.stringify({ faecher, ziel });
const wertOderFehler = (pruefung) => (pruefung.ok ? pruefung.wert : pruefung.fehler);

// Macht aus [Eingabe, Erwartung]-Paaren Testfälle der Form [Name, Funktion, Erwartung].
const faelle = (titel, funktion, paare) =>
  paare.map(([eingabe, soll]) => [`${titel} ${JSON.stringify(eingabe)} → ${JSON.stringify(soll)}`, () => funktion(eingabe), soll]);

const TESTFAELLE = [
  ["Mathe 10, Deutsch 12, Englisch 14 ergibt 12,00",
    () => rechner.formatiereSchnitt(rechner.durchschnitt([fach("Mathe", 10), fach("Deutsch", 12), fach("Englisch", 14)])), "12,00"],
  ["Leere Liste ergibt den Strich", () => rechner.formatiereSchnitt(rechner.durchschnitt([])), "–"],

  ...faelle("Punkte", (eingabe) => wertOderFehler(rechner.pruefePunkte(eingabe)), [
    ...["16", "15,5"].map((eingabe) => [eingabe, "Punkte dürfen nicht über 15 liegen."]),
    ...["-1", "-0,5"].map((eingabe) => [eingabe, "Punkte dürfen nicht unter 0 liegen."]),
    ["7,5", "Punkte müssen eine ganze Zahl sein."],
    ...["", null, undefined].map((eingabe) => [eingabe, "Bitte Punkte eingeben."]),
    ...["abc", "0x0A", "1e1", "0b11", "Infinity"].map((eingabe) => [eingabe, "Punkte müssen eine Zahl sein."]),
    ["0", 0], ["-0", 0], ["15", 15], [12, 12], ["12,0", 12], [" 12 ", 12], ["12.0", 12], ["12,", 12],
  ]),

  ...faelle("Fachname", (eingabe) => wertOderFehler(rechner.pruefeName(eingabe)), [
    ...["", "   ", null, undefined].map((eingabe) => [eingabe, "Bitte einen Fachnamen eingeben."]),
    ["  Mathe ", "Mathe"],
  ]),
  ...faelle("Neben Mathe, Ökologie und Kunst: Fach",
    (eingabe) => wertOderFehler(rechner.pruefeName(eingabe, [fach("Mathe", 10), fach("Ökologie", 5), fach("Kunst", 9)])), [
      ...["Mathe", "mathe", " Mathe ", "ökologie", "Kunst"].map((eingabe) => [eingabe, "Dieses Fach gibt es schon."]),
      ["Mathe 2", "Mathe 2"], ["Deutsch", "Deutsch"],
    ]),

  ...faelle("Zielnote", (eingabe) => wertOderFehler(rechner.pruefeZielNote(eingabe)), [
    ["", null], ["1,0", 1], ["1,", 1], ["1.5", 1.5], [" 2 ", 2], ["4,0", 4],
    ...["0,5", "0,99"].map((eingabe) => [eingabe, "Die Zielnote darf nicht besser als 1,0 sein."]),
    ...["4,01", "4,1", "7"].map((eingabe) => [eingabe, "Schlechter als 4,0 bedeutet: Abitur nicht bestanden."]),
    ...["abc", "0x0A", "1e1", "0b11", "Infinity"].map((eingabe) => [eingabe, "Die Zielnote muss eine Zahl sein."]),
  ]),

  ...faelle("Schnitt und Zielnote", ([schnitt, ziel]) => rechner.zielStatus(schnitt, ziel), [
    [[12, ""], { text: "", erreicht: null }],
    [[12, "abc"], { text: "Die Zielnote muss eine Zahl sein.", erreicht: null }],
    [[null, "1,6"], { text: "Note 1,6 = 12,20 Punkte", erreicht: null }],
    [[12.5, "1,6"], { text: "Note 1,6 = 12,20 Punkte · 0,30 Punkte über Ziel", erreicht: true }],
    [[12.2, "1,6"], { text: "Note 1,6 = 12,20 Punkte · Ziel genau erreicht", erreicht: true }],
    [[11, "1,6"], { text: "Note 1,6 = 12,20 Punkte · 1,20 Punkte unter Ziel", erreicht: false }],
    [[37 / 3, "1,6"], { text: "Note 1,6 = 12,20 Punkte · 0,13 Punkte über Ziel", erreicht: true }],
    // Angezeigt wird 12,88; ohne Runden des Schnitts vor dem Vergleich käme 0,07 heraus.
    [[103 / 8, "1,4"], { text: "Note 1,4 = 12,80 Punkte · 0,08 Punkte über Ziel", erreicht: true }],
    [[14, "1"], { text: "Note 1 = 14,00 Punkte · Ziel genau erreicht", erreicht: true }],
    [[5, "4"], { text: "Note 4 = 5,00 Punkte · Ziel genau erreicht", erreicht: true }],
  ]),

  ...faelle("Gespeichert", rechner.ladeZustand,
    [null, "", "{kaputt", "[]", "42", '{"faecher":"x"}', gespeichert([], "")].map((text) => [text, { faecher: [], ziel: "" }])),
  ["Speichern und Laden ergibt dieselben Fächer und dieselbe Zielnote",
    () => rechner.ladeZustand(gespeichert([fach("Mathe", 10), fach("Deutsch", 13)], "1,6")),
    { faecher: [fach("Mathe", 10), fach("Deutsch", 13)], ziel: "1,6" }],
  ["Ungültige und doppelte gespeicherte Fächer werden verworfen, das erste gültige bleibt",
    () => rechner.ladeZustand(gespeichert([
      fach("Mathe", 12), fach("Deutsch", 16), fach("  ", 5), fach("Kunst", "7"), fach("Physik", 7.5), fach("Bio", -1),
      fach(123, 5), fach({}, 5), fach(["a"], 5), { punkte: 5 }, null, "Chemie", 5, fach("mathe", 5), fach("Sport", 7),
    ], "2,0")),
    { faecher: [fach("Mathe", 12), fach("Sport", 7)], ziel: "2,0" }],
  ...faelle("Gespeicherte Zielnote neben Mathe 12",
    (ziel) => rechner.ladeZustand(gespeichert([fach("Mathe", 12)], ziel)),
    ["5,0", "abc", 2, null, undefined].map((ziel) => [ziel, { faecher: [fach("Mathe", 12)], ziel: "" }])),
];

// Führt alle Testfälle aus. Gibt [{ name, bestanden, meldung }] zurück.
// Verglichen wird über JSON, damit auch Objekte und Listen verglichen werden können.
function fuehreTestsAus() {
  return TESTFAELLE.map(([name, funktion, soll]) => {
    try {
      const ist = JSON.stringify(funktion());
      const bestanden = ist === JSON.stringify(soll);
      return { name, bestanden, meldung: bestanden ? "" : `erwartet ${JSON.stringify(soll)}, bekommen ${ist}` };
    } catch (fehler) {
      return { name, bestanden: false, meldung: fehler.message };
    }
  });
}

// Ausgabe für Node, nur wenn die Datei direkt gestartet wird.
if (typeof module !== "undefined" && require.main === module) {
  const ergebnisse = fuehreTestsAus();
  for (const { name, bestanden, meldung } of ergebnisse) {
    console.log(bestanden ? `✓ ${name}` : `✗ ${name}: ${meldung}`);
  }
  const anzahl = ergebnisse.filter((ergebnis) => ergebnis.bestanden).length;
  console.log(`\n${anzahl} von ${ergebnisse.length} bestanden`);
  if (anzahl < ergebnisse.length) process.exitCode = 1;
}
