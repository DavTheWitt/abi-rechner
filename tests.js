// Testfälle für rechner.js. Laufen im Browser über tests.html und mit Node über „node tests.js“.

// In Node kommt die Rechenlogik über require, im Browser aus dem vorher geladenen rechner.js.
const rechner = typeof require === "function" ? require("./rechner.js") : globalThis;

const fach = (name, punkte, faktor = 1, offen = 0) => ({ name, punkte, faktor, offen });
const gespeichert = (faecher, ziel) => JSON.stringify({ faecher, ziel });
const wertOderFehler = (pruefung) => (pruefung.ok ? pruefung.wert : pruefung.fehler);

// Macht aus [Eingabe, Erwartung]-Paaren Testfälle der Form [Name, Funktion, Erwartung].
const faelle = (titel, funktion, paare) =>
  paare.map(([eingabe, soll]) => [`${titel} ${JSON.stringify(eingabe)} → ${JSON.stringify(soll)}`, () => funktion(eingabe), soll]);

const TESTFAELLE = [
  ["Mathe 10, Deutsch 12, Englisch 14 ergibt 12,00",
    () => rechner.formatiereSchnitt(rechner.durchschnitt([fach("Mathe", 10), fach("Deutsch", 12), fach("Englisch", 14)])), "12,00"],
  ["Leere Liste ergibt den Strich", () => rechner.formatiereSchnitt(rechner.durchschnitt([])), "–"],
  ["Mathe Faktor 2 mit 10, Deutsch Faktor 1 mit 13 ergibt 11,00",
    () => rechner.formatiereSchnitt(rechner.durchschnitt([fach("Mathe", 10, 2), fach("Deutsch", 13, 1)])), "11,00"],
  ["Mathe Faktor 1,5 mit 10, Deutsch Faktor 1 mit 13 ergibt 11,20",
    () => rechner.formatiereSchnitt(rechner.durchschnitt([fach("Mathe", 10, 1.5), fach("Deutsch", 13)])), "11,20"],

  ...faelle("Faktor", (eingabe) => wertOderFehler(rechner.pruefeFaktor(eingabe)), [
    ["", 1], ["2", 2], ["1,5", 1.5], ["0,5", 0.5], ["10", 10], [3, 3],
    ...["0", "-1", "-0"].map((eingabe) => [eingabe, "Der Faktor muss größer als 0 sein."]),
    ...["10,5", "11"].map((eingabe) => [eingabe, "Der Faktor darf nicht über 10 liegen."]),
    ...["abc", "1e1"].map((eingabe) => [eingabe, "Der Faktor muss eine Zahl sein."]),
  ]),
  ...faelle("Offene Klausuren", (eingabe) => wertOderFehler(rechner.pruefeOffeneKlausuren(eingabe)), [
    ["", 0], ["0", 0], ["3", 3], ["10", 10],
    ["-1", "Offene Klausuren dürfen nicht unter 0 liegen."],
    ["11", "Offene Klausuren dürfen nicht über 10 liegen."],
    ["1,5", "Offene Klausuren müssen eine ganze Zahl sein."],
    ["zwei", "Offene Klausuren müssen eine Zahl sein."],
  ]),
  ...faelle("Neben Mathe: Fach mit Eingaben", (eingaben) => rechner.pruefeFach(eingaben, [fach("Mathe", 10)]), [
    [{ name: " Deutsch ", punkte: "12", faktor: "2", offen: "3" }, { ok: true, wert: fach("Deutsch", 12, 2, 3) }],
    [{ name: "Deutsch", punkte: "12", faktor: "", offen: "" }, { ok: true, wert: fach("Deutsch", 12, 1, 0) }],
    [{ name: "Deutsch", punkte: "12", faktor: "1", offen: "-1" },
      { ok: false, fehler: "Offene Klausuren dürfen nicht unter 0 liegen.", feld: "offen" }],
    // Der erste Fehler von oben zählt.
    [{ name: "mathe", punkte: "16", faktor: "0" }, { ok: false, fehler: "Dieses Fach gibt es schon.", feld: "name" }],
    [{ name: "Deutsch", punkte: "16", faktor: "0" }, { ok: false, fehler: "Punkte dürfen nicht über 15 liegen.", feld: "punkte" }],
    [{ name: "Deutsch", punkte: "12", faktor: "0" }, { ok: false, fehler: "Der Faktor muss größer als 0 sein.", feld: "faktor" }],
  ]),

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

  // Runde 5: Mathe 10 (Faktor 2, 2 offen) und Deutsch 13 (Faktor 1, 1 offen) mit Ziel 1,6 = 12,20 Punkte:
  // (12,20 · (3 + 5) − 33) / 5 = 12,92
  ...faelle("Was brauche ich noch", ([faecher, ziel]) => rechner.nochNoetig(faecher, ziel), [
    [[[fach("Mathe", 10, 2, 2), fach("Deutsch", 13, 1, 1)], "1,6"],
      { text: "Du brauchst in den 3 offenen Klausuren im Schnitt mindestens 12,92 Punkte.", erreichbar: true }],
    [[[fach("Mathe", 10, 1, 1), fach("Deutsch", 13)], "2,0"],
      { text: "Du brauchst in der offenen Klausur mindestens 10,00 Punkte.", erreichbar: true }],
    [[[fach("Mathe", 13, 1, 1)], "1,0"], { text: "Du brauchst in der offenen Klausur mindestens 15,00 Punkte.", erreichbar: true }],
    [[[fach("Mathe", 5, 1, 1)], "1,0"],
      { text: "Nicht mehr erreichbar: Du bräuchtest in der offenen Klausur 23,00 Punkte, möglich sind höchstens 15.", erreichbar: false }],
    [[[fach("Mathe", 10, 2, 2), fach("Deutsch", 13, 1, 1)], "1,0"],
      { text: "Nicht mehr erreichbar: Du bräuchtest in den 3 offenen Klausuren im Schnitt 15,80 Punkte, möglich sind höchstens 15.", erreichbar: false }],
    [[[fach("Mathe", 10, 1, 1)], "4,0"], { text: "Dein Ziel ist sicher, selbst mit 0 Punkten in der offenen Klausur.", erreichbar: true }],
    [[[fach("Mathe", 15, 1, 2), fach("Deutsch", 15)], "4,0"],
      { text: "Dein Ziel ist sicher, selbst mit 0 Punkten in den 2 offenen Klausuren.", erreichbar: true }],
    ...[
      [[fach("Mathe", 10)], "1,6"], [[fach("Mathe", 10, 1, 1)], ""], [[fach("Mathe", 10, 1, 1)], "abc"], [[], "1,6"],
    ].map((eingabe) => [eingabe, { text: "", erreichbar: null }]),
  ]),

  ...faelle("Gespeichert", rechner.ladeZustand,
    [null, "", "{kaputt", "[]", "42", '{"faecher":"x"}', gespeichert([], "")].map((text) => [text, { faecher: [], ziel: "" }])),
  ["Speichern und Laden ergibt dieselben Fächer und dieselbe Zielnote",
    () => rechner.ladeZustand(gespeichert([fach("Mathe", 10, 2, 3), fach("Deutsch", 13)], "1,6")),
    { faecher: [fach("Mathe", 10, 2, 3), fach("Deutsch", 13)], ziel: "1,6" }],
  ["Speicherstand von vor Runde 4 bekommt Faktor 1 und 0 offene Klausuren",
    () => rechner.ladeZustand('{"faecher":[{"name":"Mathe","punkte":10}],"ziel":"2,0"}'),
    { faecher: [fach("Mathe", 10, 1)], ziel: "2,0" }],
  ["Ungültige und doppelte gespeicherte Fächer werden verworfen, das erste gültige bleibt",
    () => rechner.ladeZustand(gespeichert([
      fach("Mathe", 12), fach("Deutsch", 16), fach("  ", 5), fach("Kunst", "7"), fach("Physik", 7.5), fach("Bio", -1),
      fach(123, 5), fach({}, 5), fach(["a"], 5), { punkte: 5 }, null, "Chemie", 5, fach("mathe", 5),
      fach("Chemie", 7, 0), fach("Chemie", 7, "2"), fach("Chemie", 7, null), fach("Chemie", 7, 11),
      fach("Chemie", 7, 1, -1), fach("Chemie", 7, 1, 1.5), fach("Chemie", 7, 1, "2"), fach("Geo", 8, 2, 3), fach("Sport", 7),
    ], "2,0")),
    { faecher: [fach("Mathe", 12), fach("Geo", 8, 2, 3), fach("Sport", 7)], ziel: "2,0" }],
  ...faelle("Gespeicherte Zielnote neben Mathe 12",
    (ziel) => rechner.ladeZustand(gespeichert([fach("Mathe", 12)], ziel)),
    ["5,0", "abc", 2, null, undefined].map((ziel) => [ziel, { faecher: [fach("Mathe", 12)], ziel: "" }])),
];

const aufgabe = (text, datum, erledigt = false) => ({ text, datum, erledigt });
const klausur = (text, datum) => ({ text, datum });

TESTFAELLE.push(
  ...faelle("Datum", (eingabe) => wertOderFehler(rechner.pruefeDatum(eingabe)), [
    ["2026-11-05", "2026-11-05"], [" 2026-11-05 ", "2026-11-05"], ["2028-02-29", "2028-02-29"],
    ...["", null, undefined].map((eingabe) => [eingabe, "Bitte ein Datum eingeben."]),
    ...["2026-02-29", "2026-02-30", "2026-13-01", "2026-00-10", "2026-1-5", "05.11.2026", "morgen", "2026-11-05T10:00"]
      .map((eingabe) => [eingabe, "Bitte ein gültiges Datum eingeben."]),
  ]),
  ...faelle("Planer-Eintrag", rechner.pruefeEintrag, [
    [{ text: " Mathe S. 42 ", datum: "2026-11-05" }, { ok: true, wert: { text: "Mathe S. 42", datum: "2026-11-05" } }],
    [{ text: "  ", datum: "" }, { ok: false, fehler: "Bitte eintragen, worum es geht.", feld: "text" }],
    [{ text: "Mathe", datum: "" }, { ok: false, fehler: "Bitte ein Datum eingeben.", feld: "datum" }],
  ]),
  ...faelle("Datum anzeigen", rechner.formatiereDatum, [["2026-11-05", "Do, 05.11.2026"], ["2027-01-03", "So, 03.01.2027"]]),

  // Heute ist Samstag, der 31.10.2026; 7 Tage reichen bis Samstag, den 07.11.
  ["Demnächst: überfällig, heute, morgen und bis 7 Tage voraus, nach Datum sortiert",
    () => rechner.demnaechst(
      [aufgabe("Bio", "2026-10-29"), aufgabe("Physik", "2026-10-30", true), aufgabe("Englisch", "2026-11-08"), aufgabe("Deutsch", "2026-11-01")],
      [klausur("Geschichte", "2026-11-07"), klausur("Chemie", "2026-10-30"), klausur("Mathe", "2026-10-31")],
      "2026-10-31"),
    [
      { text: "Überfällig seit Do, 29.10.2026 · Hausaufgabe: Bio", ueberfaellig: true },
      { text: "Heute · Klausur: Mathe", ueberfaellig: false },
      { text: "Morgen · Hausaufgabe: Deutsch", ueberfaellig: false },
      { text: "Sa, 07.11.2026 · Klausur: Geschichte", ueberfaellig: false },
    ]],
  ["Demnächst über den Jahreswechsel",
    () => rechner.demnaechst([], [klausur("Mathe", "2027-01-05"), klausur("Kunst", "2027-01-04")], "2026-12-28"),
    [{ text: "Mo, 04.01.2027 · Klausur: Kunst", ueberfaellig: false }]],
  ["Demnächst ohne Einträge ist leer", () => rechner.demnaechst([], [], "2026-10-31"), []],

  ...faelle("Gespeicherter Planer", rechner.ladePlaner,
    [null, "", "{kaputt", "[]", '{"hausaufgaben":"x","klausuren":5}'].map((text) => [text, { hausaufgaben: [], klausuren: [] }])),
  ["Planer speichern und laden ergibt dasselbe",
    () => rechner.ladePlaner(JSON.stringify({ hausaufgaben: [aufgabe("Bio", "2026-11-02", true)], klausuren: [klausur("Mathe", "2026-11-05")] })),
    { hausaufgaben: [aufgabe("Bio", "2026-11-02", true)], klausuren: [klausur("Mathe", "2026-11-05")] }],
  ["Ungültige gespeicherte Planer-Einträge werden verworfen",
    () => rechner.ladePlaner(JSON.stringify({
      hausaufgaben: [aufgabe("", "2026-11-02"), aufgabe("Bio", "2026-02-30"), aufgabe(5, "2026-11-02"), null, "Bio",
        { text: "Kunst", datum: "2026-11-03", erledigt: "ja" }],
      klausuren: [klausur("Mathe", 20261105), klausur("Physik", "2026-11-06"), { ...klausur("Chemie", "2026-11-07"), extra: 1 }],
    })),
    { hausaufgaben: [aufgabe("Kunst", "2026-11-03", false)], klausuren: [klausur("Physik", "2026-11-06"), klausur("Chemie", "2026-11-07")] }],
);

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
