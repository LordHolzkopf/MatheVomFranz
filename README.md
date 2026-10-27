# MatheVomFranz

*Mathematik von und mit Franz.*

MatheVomFranz erzeugt Kopfrechen- und Automatisierungsübungen mit Zufallswerten: als Diaporama, Karteikarten, Arbeits- und Testblätter, Duell, Gürtel, Dominos, „Ich hab – wer hat?“, Parkour und mehr. Die Aufgaben sind nach dem Gymnasial-Lehrplan NRW (G9) geordnet, orientiert am Stoffverteilungsplan des Lambacher Schweizer.

> **Status:** im Aufbau. Die Oberfläche ist noch französisch; Übersetzung, neues Design und die Einordnung nach NRW-Lehrplan folgen schrittweise.

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

Zum Ausprobieren während der Entwicklung reicht ein beliebiger statischer Webserver, der `src/` und `public/` zusammen ausliefert (so wie beim Deployment, bei dem beide Ordner zusammengeführt werden).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/` | HTML-Seiten, JavaScript-Module (`src/js`), CSS, Bilder |
| `public/library/N*/` | Aufgaben-Generatoren als JSON oder YAML |
| `public/library/structure.json` | Gliederung in Stufen, Themen und Kapitel |
| `public/library/scan.js` | erzeugt `src/js/mods/content.js` und `activitiesurl.js` aus der Bibliothek |
| `public/*.php` | optionale Server-Funktionen (Kurz-URLs, Parkour-Synchronisation); nur mit PHP-Hosting |

## Lizenz

Apache License 2.0, siehe [`LICENSE`](LICENSE) und [`NOTICE`](NOTICE).
