/**
 * Prüfwerkzeug für Aufgaben-Generatoren (MatheVomFranz)
 *
 *   node tools/aufgabencheck.mjs 6NC1 6ND27 …        einzelne Aufgaben
 *   node tools/aufgabencheck.mjs --alle               alle Aufgaben (nur Zusammenfassung)
 *   Optionen: --ref <commit>   Vergleichsstand (Standard: REF unten)
 *             --n <zahl>       Fragen je Variante (Standard 12)
 *             --still          keine Beispielfragen ausgeben
 *
 * Für jede Variante (option) werden mit festem Zufalls-Startwert Fragen erzeugt.
 * Geprüft wird:
 *   1. Fehler beim Erzeugen (Ausnahmen, Warnungen der Engine)
 *   2. Ob die erwarteten Antworten (values) gleich geblieben sind wie im
 *      Vergleichsstand – eine Übersetzung darf die Mathematik nicht ändern.
 *      Abweichungen sind nur erlaubt, wenn die Antwort selbst Text ist
 *      (z. B. „oui“ → „ja“) oder die Schreibweise bewusst angepasst wurde.
 *   3. Französische Wortreste in Titel, Beschreibung, Variantennamen und in den
 *      erzeugten Fragen, Lösungen und Arbeitsaufträgen.
 * Exit-Code 1, wenn Fehler oder Abweichungen gefunden wurden.
 */
import "./dom-stubs.mjs";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

// Stand vor der Übersetzung der Aufgaben (Schritte 2–4)
const REF = "f10c1f5";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIBRARY = path.join(ROOT, "public", "library");

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : def;
};
const ref = opt("--ref", REF);
const N = Number(opt("--n", 12));
const still = args.includes("--still");
const alle = args.includes("--alle");

const { utils } = await import(path.join(ROOT, "src", "js", "mods", "utils.js"));
const activity = (await import(path.join(ROOT, "src", "js", "mods", "activity.js"))).default;
let meldungen = [];
utils.debug = (...a) => meldungen.push(a.map((x) => (x instanceof Error ? x.message : String(x))).join(" "));

function dateien() {
  const m = {};
  for (const d of fs.readdirSync(LIBRARY)) {
    const full = path.join(LIBRARY, d);
    if (!d.startsWith("N") || !fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      if (/\.(json|ya?ml)$/.test(f)) m[f.replace(/\.(json|ya?ml)$/, "")] = path.join(full, f);
    }
  }
  return m;
}

function alteVersion(datei) {
  const rel = path.relative(ROOT, datei).split(path.sep).join("/");
  try {
    return yaml.load(execFileSync("git", ["show", ref + ":" + rel], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
}

function erzeuge(def, id, option) {
  meldungen = [];
  utils.initializeAlea("pruefung-" + id + "-" + option);
  const act = new activity(utils.clone(def), id);
  act.nbq = N;
  act.generate(N, option === -1 ? undefined : option);
  return {
    q: act.questions,
    a: act.answers,
    v: act.values,
    c: act.consignes,
    s: act.shortQuestions,
    w: [...meldungen],
  };
}

// Französische Wörter, die im Deutschen praktisch nicht vorkommen
const FRANZ = new RegExp(
  "(?<![\\p{L}\\\\])(" +
    [
      "le", "la", "les", "des", "du", "une", "est", "sont", "avec", "pour", "dans", "sur", "par",
      "quel", "quelle", "quels", "quelles", "combien", "calcule", "calculer", "calculez", "donne",
      "donner", "donnez", "écris", "écrire", "écrivez", "nombre", "nombres", "entier", "entiers",
      "réponse", "côté", "côtés", "aire", "périmètre", "longueur", "largeur", "égal", "égale",
      "vrai", "faux", "oui", "non", "et", "ou", "au", "aux", "de", "ce", "cette", "qui", "que",
      "il", "elle", "on", "à", "où", "fois", "moins", "plus", "triangle", "carré", "cercle",
      "rayon", "droite", "segment", "angle", "point", "valeur", "résultat", "fraction", "décimal",
      "décimale", "somme", "produit", "différence", "quotient", "double", "moitié", "tiers",
      "quart", "heure", "heures", "minutes", "secondes", "euros", "centimes", "j'ai", "qui a",
    ].join("|") +
    ")(?![\\p{L}])",
  "iu",
);

function textOhneCode(t) {
  return String(t ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\\(text|textrm|mathrm|textbf)\{([^}]*)\}/g, " $2 ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/\$\{[^}]*\}/g, " ")
    .replace(/&[a-z]+;/g, " ");
}

function franzReste(texte) {
  const funde = new Set();
  for (const t of texte) {
    const s = textOhneCode(t);
    const m = s.match(FRANZ);
    if (m) {
      const i = s.indexOf(m[0]);
      funde.add("„" + s.slice(Math.max(0, i - 30), i + 40).replace(/\s+/g, " ").trim() + "“");
    }
  }
  return [...funde];
}

const kurz = (t) => textOhneCode(t).replace(/\s+/g, " ").trim().slice(0, 140);

const alleDateien = dateien();
const ids = alle ? Object.keys(alleDateien).sort() : args.filter((a, i) => !a.startsWith("--") && !["--ref", "--n"].includes(args[i - 1]));
let problemeGesamt = 0;
const zusammenfassung = [];

for (const id of ids) {
  const datei = alleDateien[id];
  if (!datei) {
    console.log(`✗ ${id}: Datei nicht gefunden`);
    problemeGesamt++;
    continue;
  }
  let def;
  try {
    def = yaml.load(fs.readFileSync(datei, "utf8"));
  } catch (e) {
    console.log(`✗ ${id}: Datei nicht lesbar – ${e.message}`);
    problemeGesamt++;
    continue;
  }
  const alt = alteVersion(datei);
  const nOpt = Array.isArray(def.options) && def.options.length ? def.options.length : 0;
  const varianten = nOpt ? [...Array(nOpt).keys()] : [-1];
  const probleme = [];
  const texte = [def.title, def.description, def.consigne, ...(def.options || []).map((o) => o.name)];
  const ausgabe = [];
  if (alt && Array.isArray(alt.options) && (alt.options.length || 0) !== nOpt)
    probleme.push(`Anzahl der Varianten geändert: ${alt.options.length} → ${nOpt}`);
  for (const v of varianten) {
    let neu, vorher;
    try {
      neu = erzeuge(def, id, v);
    } catch (e) {
      probleme.push(`Variante ${v}: Fehler beim Erzeugen – ${e.message}`);
      continue;
    }
    if (neu.q.length < Math.min(N, 3)) probleme.push(`Variante ${v}: nur ${neu.q.length} Fragen erzeugt`);
    neu.w.forEach((w) => probleme.push(`Variante ${v}: Meldung – ${w.slice(0, 160)}`));
    texte.push(...neu.q, ...neu.a, ...neu.c, ...neu.s.filter((x) => x));
    if (alt) {
      try {
        vorher = erzeuge(alt, id, v);
        const k = neu.v.findIndex((x, i) => JSON.stringify(x) !== JSON.stringify(vorher.v[i]));
        if (k > -1 || neu.v.length !== vorher.v.length)
          probleme.push(
            `Variante ${v}: erwartete Antwort geändert, z. B. ${JSON.stringify(vorher.v[Math.max(k, 0)])} → ${JSON.stringify(neu.v[Math.max(k, 0)])}`,
          );
      } catch {
        /* alte Fassung nicht erzeugbar: kein Vergleich */
      }
    }
    if (!still)
      for (let i = 0; i < Math.min(2, neu.q.length); i++)
        ausgabe.push(`    [${v}] F: ${kurz(neu.q[i])}\n        L: ${kurz(neu.a[i])}\n        W: ${JSON.stringify(neu.v[i])}`);
  }
  const reste = franzReste(texte);
  reste.slice(0, 6).forEach((r) => probleme.push("Französisch? " + r));
  problemeGesamt += probleme.filter((p) => !p.startsWith("Französisch?")).length;
  zusammenfassung.push({ id, probleme: probleme.length, franz: reste.length });
  if (alle && still) {
    if (probleme.length) console.log(`✗ ${id}: ${probleme.length} Hinweis(e)`);
    continue;
  }
  console.log(`${probleme.length ? "✗" : "✓"} ${id} – ${def.title}`);
  probleme.forEach((p) => console.log("    ! " + p));
  ausgabe.forEach((a) => console.log(a));
}

if (alle) {
  const mitFranz = zusammenfassung.filter((z) => z.franz).length;
  console.log(`\n${zusammenfassung.length} Aufgaben, davon ${mitFranz} mit französischen Resten; Fehler/Abweichungen: ${problemeGesamt}`);
}
process.exit(problemeGesamt ? 1 : 0);
