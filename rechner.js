// Rechenlogik des Abi-Rechners.
// Diese Datei greift nicht auf die Oberfläche zu, damit sie für sich getestet werden kann.
// Alle pruefe-Funktionen geben { ok: true, wert } oder { ok: false, fehler } zurück.

const SPEICHER_SCHLUESSEL = "abi-rechner";
const PLANER_SCHLUESSEL = "abi-rechner-planer";

const abgelehnt = (fehler) => ({ ok: false, fehler });

function rundeAufHundertstel(wert) {
  return Math.round(wert * 100) / 100;
}

// 1.5 → "1,5"
function mitKomma(zahl) {
  return String(zahl).replace(".", ",");
}

function summe(faecher, wert) {
  return faecher.reduce((bisher, fach) => bisher + wert(fach), 0);
}

// Liest eine Zahl mit Punkt oder Komma. Gibt null bei leerer Eingabe und NaN bei keiner Zahl zurück.
// Die Regex, weil Number() allein auch "0x0A" oder "1e1" annehmen würde.
// "1," ist erlaubt, damit beim Eintippen von "1,6" kein Fehler aufblitzt.
function leseZahl(eingabe) {
  const text = String(eingabe ?? "").trim();
  if (text === "") return null;
  return /^-?\d+([.,]\d*)?$/.test(text) ? Number(text.replace(",", ".")) : NaN;
}

// Mit der Liste faecher wird auch ein schon vorhandenes Fach abgelehnt, egal in welcher Schreibweise.
function pruefeName(eingabe, faecher = []) {
  const name = String(eingabe ?? "").trim();
  if (name === "") return abgelehnt("Bitte einen Fachnamen eingeben.");
  const gibtEsSchon = faecher.some((fach) => fach.name.toLowerCase() === name.toLowerCase());
  if (gibtEsSchon) return abgelehnt("Dieses Fach gibt es schon.");
  return { ok: true, wert: name };
}

function pruefePunkte(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return abgelehnt("Bitte Punkte eingeben.");
  if (Number.isNaN(zahl)) return abgelehnt("Punkte müssen eine Zahl sein.");
  if (zahl < 0) return abgelehnt("Punkte dürfen nicht unter 0 liegen.");
  if (zahl > 15) return abgelehnt("Punkte dürfen nicht über 15 liegen.");
  if (!Number.isInteger(zahl)) return abgelehnt("Punkte müssen eine ganze Zahl sein.");
  return { ok: true, wert: zahl };
}

// Ein leeres Feld bedeutet Faktor 1.
function pruefeFaktor(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return { ok: true, wert: 1 };
  if (Number.isNaN(zahl)) return abgelehnt("Der Faktor muss eine Zahl sein.");
  if (zahl <= 0) return abgelehnt("Der Faktor muss größer als 0 sein.");
  if (zahl > 10) return abgelehnt("Der Faktor darf nicht über 10 liegen.");
  return { ok: true, wert: zahl };
}

// Ein leeres Feld bedeutet: keine Klausur mehr offen.
function pruefeOffeneKlausuren(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return { ok: true, wert: 0 };
  if (Number.isNaN(zahl)) return abgelehnt("Offene Klausuren müssen eine Zahl sein.");
  if (zahl < 0) return abgelehnt("Offene Klausuren dürfen nicht unter 0 liegen.");
  if (zahl > 10) return abgelehnt("Offene Klausuren dürfen nicht über 10 liegen.");
  if (!Number.isInteger(zahl)) return abgelehnt("Offene Klausuren müssen eine ganze Zahl sein.");
  return { ok: true, wert: zahl };
}

// Fasst die Prüfungen mehrerer Eingaben zusammen. Beim ersten Fehler steht in feld, zu welcher Eingabe er gehört.
function pruefeAlle(pruefungen) {
  const liste = Object.entries(pruefungen);
  const fehler = liste.find(([, pruefung]) => !pruefung.ok);
  if (fehler) return { ok: false, fehler: fehler[1].fehler, feld: fehler[0] };
  return { ok: true, wert: Object.fromEntries(liste.map(([feld, pruefung]) => [feld, pruefung.wert])) };
}

function pruefeFach(eingaben, faecher) {
  return pruefeAlle({
    name: pruefeName(eingaben.name, faecher),
    punkte: pruefePunkte(eingaben.punkte),
    faktor: pruefeFaktor(eingaben.faktor),
    offen: pruefeOffeneKlausuren(eingaben.offen),
  });
}

// Datum im Format JJJJ-MM-TT, wie es <input type="date"> liefert.
function pruefeDatum(eingabe) {
  const text = String(eingabe ?? "").trim();
  if (text === "") return abgelehnt("Bitte ein Datum eingeben.");
  // Der Rückweg über toISOString fängt Tage ab, die es nicht gibt: Date schiebt den 30.02. in den März.
  const datum = new Date(`${text}T12:00:00Z`);
  const gueltig = /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(datum.getTime()) && datum.toISOString().startsWith(text);
  return gueltig ? { ok: true, wert: text } : abgelehnt("Bitte ein gültiges Datum eingeben.");
}

// Ein Eintrag im Planer: Hausaufgabe oder Klausur, jeweils mit Text und Datum.
function pruefeEintrag(eingaben) {
  const text = String(eingaben.text ?? "").trim();
  return pruefeAlle({
    text: text === "" ? abgelehnt("Bitte eintragen, worum es geht.") : { ok: true, wert: text },
    datum: pruefeDatum(eingaben.datum),
  });
}

function plusTage(datum, tage) {
  const tag = new Date(`${datum}T12:00:00Z`); // mittags in UTC, damit die Zeitumstellung keinen Tag verschiebt
  tag.setUTCDate(tag.getUTCDate() + tage);
  return tag.toISOString().slice(0, 10);
}

// "2026-11-05" → "Do, 05.11.2026"
function formatiereDatum(datum) {
  const [jahr, monat, tag] = datum.split("-");
  const wochentag = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date(`${datum}T12:00:00Z`).getUTCDay()];
  return `${wochentag}, ${tag}.${monat}.${jahr}`;
}

// Was in den nächsten 7 Tagen ansteht (heute eingerechnet), dazu überfällige, nicht erledigte Hausaufgaben.
// heute im Format JJJJ-MM-TT; das Ergebnis ist nach Datum sortiert.
function demnaechst(hausaufgaben, klausuren, heute) {
  const bis = plusTage(heute, 7);
  const wann = (datum) => {
    if (datum < heute) return `Überfällig seit ${formatiereDatum(datum)}`;
    if (datum === heute) return "Heute";
    return datum === plusTage(heute, 1) ? "Morgen" : formatiereDatum(datum);
  };
  return [
    ...hausaufgaben.filter((aufgabe) => !aufgabe.erledigt && aufgabe.datum <= bis).map(({ datum, text }) => ({ datum, text: `Hausaufgabe: ${text}` })),
    ...klausuren.filter(({ datum }) => datum >= heute && datum <= bis).map(({ datum, text }) => ({ datum, text: `Klausur: ${text}` })),
  ]
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .map(({ datum, text }) => ({ text: `${wann(datum)} · ${text}`, ueberfaellig: datum < heute }));
}

// Ein leeres Feld bedeutet „kein Ziel“ und ergibt wert null.
function pruefeZielNote(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return { ok: true, wert: null };
  if (Number.isNaN(zahl)) return abgelehnt("Die Zielnote muss eine Zahl sein.");
  if (zahl < 1) return abgelehnt("Die Zielnote darf nicht besser als 1,0 sein.");
  if (zahl > 4) return abgelehnt("Schlechter als 4,0 bedeutet: Abitur nicht bestanden.");
  return { ok: true, wert: zahl };
}

// Gewichteter Durchschnitt: Ein Fach mit Faktor 2 zählt doppelt. Gibt null zurück, wenn die Liste leer ist.
function durchschnitt(faecher) {
  if (faecher.length === 0) return null;
  return summe(faecher, (fach) => fach.punkte * fach.faktor) / summe(faecher, (fach) => fach.faktor);
}

// Zwei Nachkommastellen mit Komma, z. B. "12,00"; ohne Wert ein Strich.
function formatiereSchnitt(wert) {
  return wert === null ? "–" : wert.toFixed(2).replace(".", ",");
}

// Umkehrung der Abi-Formel Note = (17 − Punkte) / 3.
function punkteFuerNote(note) {
  return rundeAufHundertstel(17 - 3 * note);
}

// Text unter dem Zielfeld, z. B. "Note 1,6 = 12,20 Punkte · 0,30 Punkte über Ziel".
// erreicht ist null, solange es nichts zu vergleichen gibt.
function zielStatus(schnitt, zielEingabe) {
  const ziel = pruefeZielNote(zielEingabe);
  if (!ziel.ok) return { text: ziel.fehler, erreicht: null };
  if (ziel.wert === null) return { text: "", erreicht: null };
  const zielPunkte = punkteFuerNote(ziel.wert);
  const text = `Note ${mitKomma(ziel.wert)} = ${formatiereSchnitt(zielPunkte)} Punkte`;
  if (schnitt === null) return { text, erreicht: null };
  // Gerundet vergleichen, damit der angezeigte Schnitt und der Abstand zusammenpassen.
  const abstand = rundeAufHundertstel(rundeAufHundertstel(schnitt) - zielPunkte);
  const betrag = formatiereSchnitt(Math.abs(abstand));
  const vergleich = abstand === 0 ? "Ziel genau erreicht" : `${betrag} Punkte ${abstand < 0 ? "unter" : "über"} Ziel`;
  return { text: `${text} · ${vergleich}`, erreicht: abstand >= 0 };
}

// „Was brauche ich noch?“ mit der vereinfachenden Annahme: Die Punkte eines Fachs zählen wie eine Klausur,
// jede offene Klausur zählt genauso viel, beides mit dem Faktor des Fachs. Gesucht ist der Schnitt x
// aller offenen Klausuren, mit dem der gewichtete Schnitt aus allem die Zielpunkte erreicht.
// erreichbar ist null, solange es nichts zu rechnen gibt (kein gültiges Ziel oder keine offene Klausur).
function nochNoetig(faecher, zielEingabe) {
  const ziel = pruefeZielNote(zielEingabe);
  const anzahl = summe(faecher, (fach) => fach.offen);
  if (!ziel.ok || ziel.wert === null || anzahl === 0) return { text: "", erreichbar: null };
  const offenesGewicht = summe(faecher, (fach) => fach.offen * fach.faktor);
  const gesamtGewicht = summe(faecher, (fach) => fach.faktor) + offenesGewicht;
  const bisher = summe(faecher, (fach) => fach.punkte * fach.faktor);
  // Normal gerundet reicht: Ein Fehler unter 0,005 bei x verschwindet im gerundeten Schnitt, den zielStatus vergleicht.
  const x = rundeAufHundertstel((punkteFuerNote(ziel.wert) * gesamtGewicht - bisher) / offenesGewicht);
  const wo = anzahl === 1 ? "in der offenen Klausur" : `in den ${anzahl} offenen Klausuren`;
  const imSchnitt = anzahl === 1 ? "" : " im Schnitt";
  if (x > 15) {
    return { text: `Nicht mehr erreichbar: Du bräuchtest ${wo}${imSchnitt} ${formatiereSchnitt(x)} Punkte, möglich sind höchstens 15.`, erreichbar: false };
  }
  if (x <= 0) return { text: `Dein Ziel ist sicher, selbst mit 0 Punkten ${wo}.`, erreichbar: true };
  return { text: `Du brauchst ${wo}${imSchnitt} mindestens ${formatiereSchnitt(x)} Punkte.`, erreichbar: true };
}

// Liest den gespeicherten String { faecher, ziel }. Fehlende oder kaputte Daten ergeben einen leeren Zustand,
// ungültige oder doppelte Fächer und eine ungültige Zielnote werden verworfen.
function ladeZustand(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {} // kaputtes JSON: daten bleibt undefined und ergibt unten den leeren Zustand
  if (!Array.isArray(daten?.faecher)) return { faecher: [], ziel: "" };
  const faecher = [];
  for (const eintrag of daten.faecher) {
    // Ältere Speicherstände haben keinen Faktor (vor Runde 4) und keine offenen Klausuren (vor Runde 5).
    const { name, punkte, faktor = 1, offen = 0 } = eintrag ?? {};
    const zahlen = [punkte, faktor, offen].every((zahl) => typeof zahl === "number");
    if (typeof name !== "string" || !zahlen) continue;
    const fach = pruefeFach({ name, punkte, faktor, offen }, faecher);
    if (fach.ok) faecher.push(fach.wert);
  }
  const ziel = typeof daten.ziel === "string" && pruefeZielNote(daten.ziel).ok ? daten.ziel : "";
  return { faecher, ziel };
}

// Liest den gespeicherten Planer { hausaufgaben, klausuren }. Einträge ohne Text oder gültiges Datum werden verworfen.
function ladePlaner(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {} // kaputtes JSON ergibt einen leeren Planer
  const gueltig = (eintrag) => typeof eintrag?.text === "string" && typeof eintrag.datum === "string" && pruefeEintrag(eintrag).ok;
  const liste = (eintraege) => (Array.isArray(eintraege) ? eintraege.filter(gueltig) : []);
  return {
    hausaufgaben: liste(daten?.hausaufgaben).map(({ text, datum, erledigt }) => ({ text, datum, erledigt: erledigt === true })),
    klausuren: liste(daten?.klausuren).map(({ text, datum }) => ({ text, datum })),
  };
}

// Für Tests mit Node.
if (typeof module !== "undefined") {
  module.exports = {
    pruefeName, pruefePunkte, pruefeFaktor, pruefeOffeneKlausuren, pruefeFach, pruefeZielNote,
    durchschnitt, formatiereSchnitt, zielStatus, nochNoetig, ladeZustand,
    pruefeDatum, pruefeEintrag, formatiereDatum, demnaechst, ladePlaner,
  };
}
