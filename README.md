# MatheVomFranz

*Mathematik von und mit Franz.*

MatheVomFranz erzeugt Kopfrechen- und Automatisierungsübungen mit Zufallswerten: als Diashow, Karteikarten, Übungs- und Testblätter, Duell, Kopfrechen-Gürtel, Dominos, „Ich hab – wer hat?“, Parkour und mehr. Die Aufgaben sind nach dem Gymnasial-Lehrplan NRW (G9) geordnet, orientiert am Stoffverteilungsplan des Lambacher Schweizer.

> **Status:** 490 Aufgaben für Klasse 5 bis Q1/Q2, Oberfläche und Aufgaben auf Deutsch. Vor dem Veröffentlichen müssen Impressum und Datenschutz ausgefüllt werden; offene Punkte stehen am Ende von [`docs/entscheidungen.md`](docs/entscheidungen.md).

## Basiert auf MathsMentales

MatheVomFranz ist eine deutsche Bearbeitung von **[MathsMentales](https://mathsmentales.net)** von **Sébastien Cogez** und Mitwirkenden (Guillaume Valmont, Sandrine Cartier-Lange, Éric Elter, Fayçal Tib, Mikael Le Mentec, Xavier Levet, Dominique Porrone). Ohne ihre jahrelange Arbeit gäbe es dieses Projekt nicht – merci beaucoup !

- Original-Quellcode: <https://forge.apps.education.fr/mathsmentales/mathsmentales.forge.apps.education.fr>
- Übernommener Stand: Commit `0be0bd5` vom 22.10.2026 (Version 2.4.12)
- Lizenz: Apache 2.0, wie das Original

Welche Bibliotheken, Icons, Schriften und Geräusche verwendet werden und was gegenüber dem Original geändert wurde, steht in [`NOTICE`](NOTICE).

## Lokal starten

Voraussetzung: Node.js.

```bash
npm ci
cd public/library && node scan.js && cd ../..   # Aufgabenverzeichnis neu erzeugen
npm test                                          # Unit-Tests
npx gulp                                          # Produktions-Build nach public/
```

Zum Ausprobieren während der Entwicklung:

```bash
node tools/devserver.cjs 8800        # liefert src/ und public/ zusammen aus, wie beim Deployment
node tools/pagecheck.cjs http://localhost:8800/index.html   # meldet JS-Fehler und fehlende Dateien (braucht Playwright)
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/` | HTML-Seiten, JavaScript-Module (`src/js`), CSS, Bilder |
| `public/library/N*/` | Aufgaben-Generatoren als JSON oder YAML; `ND/` enthält die neuen deutschen Generatoren (IDs `D…`) |
| `tools/aufgabencheck.mjs` | erzeugt Fragen je Variante, prüft erwartete Antworten und meldet französische Reste |
| `public/library/structure.json` | Gliederung: Klasse → Kapitel (wie im Lambacher Schweizer) → Themenblock |
| `docs/glossar.md` | verbindliche Begriffe und Schreibweisen |
| `docs/entscheidungen.md` | Entscheidungsprotokoll |
| `public/library/scan.js` | erzeugt `src/js/mods/content.js` und `activitiesurl.js` aus der Bibliothek |
| `public/getshort.php`, `public/proxy/` | optionale Server-Funktionen (Kurz-Links, Cloud-Verlauf); nur mit PHP-Hosting, standardmäßig aus |

### Codes der Gliederung

Jede Aufgabe nennt in `dest` die Themenblöcke, zu denen sie gehört. Ein Code besteht aus Stufe (`5`–`10`, `E` = EF, `Q` = Q1/Q2, `W` = Weitere Aufgaben), Kapitelbuchstabe (A = I, B = II, …) und Themenblockbuchstabe: `7DA` ist Klasse 7, Kapitel IV, erster Themenblock. Die Aufgaben-IDs (z. B. `6NC1`) stammen aus dem Original und bleiben unverändert, damit Links gültig bleiben.

## Lizenz

Apache License 2.0, siehe [`LICENSE`](LICENSE) und [`NOTICE`](NOTICE).
