# Entscheidungsprotokoll

Hier steht, was ich (Claude) entschieden habe, während Franz nicht erreichbar war, jeweils mit Begründung. Alles lässt sich später ändern. Ältere Entscheidungen, die Franz selbst getroffen hat, stehen zur Orientierung oben.

## Von Franz vorgegeben (27.10.2026)

- Fork von MathsMentales statt Neuentwicklung; danach eigener Weg, keine Synchronisation mit dem Original.
- Alle Spielformen bleiben erhalten.
- Aufgaben: französische Generatoren übersetzen und den Kapiteln des Lambacher Schweizer zuordnen, Lücken mit neuen Generatoren füllen. Unpassendes kommt übersetzt in einen eigenen Bereich, Grundschule entfällt.
- Alle Jahrgänge von Klasse 5 bis Q2 von Anfang an.
- Hosting noch offen: statisch lauffähig bauen, PHP-Funktionen als optionaler Zusatz.
- Öffentliche Seite (Impressum und Datenschutz nötig, kein Tracking).
- Design: Karopapier-Look.
- Navigation: Kapitel wie im Buch (Nummer und Titel), Gliederung Klasse → Kapitel → Themenblöcke.
- Direkt auf `main` committen.
- Anrede: „Sie“ für Lehrkräfte, „du“ auf Schüler-Bildschirmen.
- Diaporama heißt „Diashow“, Ceintures heißen „Kopfrechen-Gürtel“.
- Untertitel der Startseite: „Mathematik von und mit Franz. Angepasst an den beeindruckenden Gymnasial-Lehrplan von NRW. – Sie wohnen nicht in NRW? Erwägen Sie einen Umzug!“

## Eigene Entscheidungen

### Schritt 1 – Fork und Aufräumen

- **Grundschul-Aufgaben:** Gelöscht wurden nur Aufgaben, die *ausschließlich* für CP–CM2 gedacht waren (56). Aufgaben, die auch in der 6e genutzt werden (104), bleiben; nur ihre Grundschul-Zuordnung ist entfernt. Die 6e entspricht etwa unserer Klasse 5/6.
- **Duell-Grafiken:** Die Freepik-Bilder des Originals sind nur für den Autor lizenziert und wurden nicht übernommen. Ersatz sind eigene, einfache Figuren mit Mathe-Symbolen.
- **„Neu“-Markierung:** Sie richtet sich nach dem Git-Datum, an dem eine Aufgabe hinzukam. Alles aus dem Import gilt nicht als neu.
- **Französische Automatismen- und Brevet-Seiten:** ersatzlos entfernt. Ein deutsches Gegenstück (z. B. „Basiswissen je Jahrgang“) wäre später möglich.

### Schritt 2 – Deutsche Oberfläche

- Ein Glossar (`docs/glossar.md`) legt alle Begriffe fest; die Übersetzung erledigen mehrere Subagenten parallel, je einer für eine Gruppe von Spielformen bzw. Modulen.
- „Panier“ heißt „Korb“, „activité“ heißt „Aufgabe“, „Historique“ heißt „Verlauf“, „Téléchargements“ heißt „Materialien“.
- Duell-Modi: Bestwert / Wer übrig bleibt / Roulette / Wer schneller ist / Gemeinsam.
- Code-Kommentare bleiben französisch; übersetzt wird nur, was Nutzer sehen. Grund: weniger Risiko, und der Aufwand steht in keinem Verhältnis zum Nutzen.
- Zahlenformatierung von Rechenwerten bleibt unverändert, damit die Antwortprüfung nicht bricht.
- **Rechtsseiten:** Die französischen „Mentions légales“ und die Nutzungsbedingungen (CGU, zugeschnitten auf den Betreiber und die Académie de Paris) sind ersatzlos entfernt. Neu: `impressum.html` und `datenschutz.html` mit gelb markierten Platzhältern für Name, Anschrift, E-Mail und Hosting-Anbieter. **Bitte vor dem Veröffentlichen ausfüllen und rechtlich prüfen lassen**; ich bin kein Jurist.
- **Über-Seite:** neu geschrieben statt übersetzt, mit ausführlicher Würdigung von MathsMentales und allen Mitwirkenden.
- **Externe Dienste des Originals:** Kurz-URLs (bref.jeduque.net), der Proxy für den Cloud-Verlauf (mathsmentales.net) und Pixel-Art (pixelart.mathsmentales.net) laufen über Server des Original-Autors. Unsere Seite soll keine Nutzerdaten an Dritte schicken. Kurz-URLs und Cloud-Proxy werden auf eigene, standardmäßig abgeschaltete PHP-Skripte umgestellt (siehe dort); Pixel-Art bleibt als Verweis auf den externen Dienst bestehen und ist in der Datenschutzerklärung erwähnt.

- **Begriffe, die die Übersetzer festgelegt haben** (über das Glossar hinaus): „Format“ für die Art der Ausgabe; „Etappe“ im Parkour; „Anheften“ im Verlauf; „Ablenker“ beim Puzzle; „Einseitig/Beidseitig“ bei Karteikarten; „Bewertung“ statt „Jury“ im Zahlenrennen; Korb-Spalten „Dauer / Fragen / Ziel / Folge / Lösung / Auswahl“ mit „sortiert/zufällig“.
- **Bildschirmtastatur:** QWERTZ statt AZERTY. Tasten, die französische Wörter einfügen (oui/non, VRAI/FAUX, aigu …), bleiben vorerst, weil die Aufgaben diese Antworten erwarten; sie werden mit den Aufgaben in Schritt 5 umgestellt.
- **Scratch-Blöcke** werden deutsch angezeigt; französische Skripte in Aufgaben werden weiter erkannt und übersetzt angezeigt.
- **Druckblätter** tragen unten „Erstellt mit MatheVomFranz · nach MathsMentales von Sébastien Cogez“ statt des Lizenzhinweises „CC-BY-NC © MathsMentales.net“ des Originals. Grund: Das Projekt steht unter Apache 2.0; ein CC-BY-NC-Vermerk auf erzeugten Blättern passt nicht, die Würdigung bleibt aber sichtbar.
- **Unbenutzte Serverskripte** `push.php` und `setlistcode.php` entfernt: Die Oberfläche ruft sie nicht auf, und sie schrieben ungeprüfte Eingaben als Dateien auf den Server.
- **Weiterleitungen auf die alte MathsMentales-Version** (für Links aus MathsMentales v1) ersetzt durch einen Hinweis auf die Suche.

### Fehler aus dem Original, nebenbei behoben

- Aufgaben-Editoren (JSON und YAML): Vorschau warf „act.display is not a function“.
- Parkour-Editor, Diashow, Duell, Parkour: Mathe-Schriften für Eingabefelder wurden unter einem falschen Pfad gesucht.
- Dominos und „Ich hab – wer hat?“ luden eine nicht vorhandene Diagramm-Bibliothek.
- Zuordnen: Fehler ohne Aufgaben im Link; „Bearbeiten“-Knopf führte wegen Tippfehler nicht zurück.
- Gürtel mit nur einem Exemplar: Fehler beim Seitenumbruch.
- Dominos: Schalter „Doppelte“ wirkte verkehrt herum.
- Übungsblatt, Testblatt, Zahlenrennen, Gürtel: fehlende Titel erschienen als „false“/„undefined“.
- Merkblatt: Absturz, wenn eine Seite überläuft.
- Karteikarten: Beschriftung „nein“ war dem falschen Knopf zugeordnet.
- Link-Fenster: Fehler beim schnellen Schließen; Meldung bei fehlendem Kurz-Link kam nie an (Tippfehler `innertext`).

### Schritt 3 – Design (Karopapier)

- Eigene Datei `src/css/mvf-theme.css`, die nach den Stylesheets des Originals geladen wird. Farben als Variablen: Papier `#fdfcf6`, Füllerblau `#1f4fa3`, roter Heftrand `#d6453d`, Tafelgrün `#2e5240` für die Oberstufe, Rot für „Weitere Aufgaben“.
- Rechenkästchen als Hintergrund (20 px), Überschriften in der Handschrift „Patrick Hand“ (SIL OFL, lokal eingebunden – keine Google Fonts, damit keine Daten an Dritte gehen), Fließtext in Nunito.
- Stufen-Kacheln als leicht schräg liegende Karteikarten.
- **Neues Logo:** Karo-Kärtchen mit rotem Rand und handschriftlichem „MvF“; Favicon mit „F“. Das MathsMentales-Logo wurde ersetzt, weil es die Marke des Originals ist.
- Spielbildschirme (Duell, Gürtel, Zuordnen …) behalten vorerst ihr eigenes, kräftiges Aussehen; das Karopapier passt dort nicht überall und könnte die Lesbarkeit am Beamer verschlechtern.
- Kein Dunkelmodus: Viele Spielformen haben fest eingebaute Farben; ein Dunkelmodus nur für die Startseite wäre inkonsequent.

### Schritt 4 – Gliederung nach NRW-Lehrplan

- **Codes:** Stufe (`5`–`10`, `E` = EF, `Q` = Q1/Q2, `W` = Weitere Aufgaben) + Kapitelbuchstabe (A = I, B = II, …) + Themenblockbuchstabe. Beispiel `7DA` = Klasse 7, Kapitel IV, erster Themenblock. So bleibt der vorhandene Code fast unverändert.
- **Kapitel** heißen wie im Buch, mit römischer Nummer. **Themenblöcke** sind meine knappe Zusammenfassung der Stichpunkte aus dem Stoffverteilungsplan (248 Themenblöcke in 60 Kapiteln).
- **Q1/Q2** ist eine Stufe für GK und LK; LK-Inhalte tragen „(nur LK)“ im Namen. Kapitelreihenfolge nach dem LK/GK-Band (I–X), damit die LK-Kapitel an der richtigen Stelle stehen.
- **Wahlkapitel** (Brüche 5/6, Wahrscheinlichkeit 7/8, Daten und Wahrscheinlichkeit 9/10) stehen in beiden Jahrgängen mit identischen Themenblöcken; Aufgaben werden immer beiden zugeordnet.
- **Aufgaben-IDs bleiben** (z. B. „6NC1“), obwohl sie französische Stufen enthalten: So bleiben gespeicherte Links und Verläufe gültig. Die Einordnung steckt allein in den `dest`-Codes.
- Die Zuordnung der 413 Aufgaben erledigen vier Subagenten; sie liefern nur Tabellen, die ich zentral anwende.

### Schritt 5 – Aufgaben übersetzen

- Elf Pakete zu je 25–45 Aufgaben, nach Klassen gebündelt; je Paket ein Subagent mit gemeinsamer Anleitung (Glossar, Fallstricke wie „Thalès“ = Strahlensätze, „affine“ = linear).
- **Sicherung der Mathematik:** Das Prüfwerkzeug `tools/aufgabencheck.mjs` erzeugt jede Variante mit festem Zufalls-Startwert und vergleicht die erwarteten Antworten mit dem Stand vor der Übersetzung. Abweichungen sind nur erlaubt, wenn die Antwort selbst Text ist (z. B. „oui“ → „ja“) oder ein Fehler des Originals behoben wurde – jeweils mit Begründung im Bericht.
- Fragen und Arbeitsaufträge in **du-Form**, Titel als Tätigkeit („Brüche kürzen“).
- Deutsche Schreibweisen: P(x|y), $\overline{AB}$ für Strecken, „Gerade AB“; französische Klassenangaben in Variantennamen entfernt.
- **Einheiten bleiben**, auch ungebräuchliche (hm, dam, dag, Doppelzentner): Sie umzustellen würde die Werte ändern. Kandidaten zum Überarbeiten stehen in den Berichten.
- Neue deutsche Sprachhelfer in `math.js` (Zahlwörter, Bruchwörter, Rechensätze, Uhrzeiten); die französischen bleiben vorerst für Altdaten.
- TN14 gelöscht (exakte Kopie von TN11). Weitere Fast-Dubletten bleiben vorerst; sie stören nicht.

### Schritt 6 – Neue Generatoren

- Für jeden der 78 leeren Themenblöcke mindestens ein neuer Generator mit 3–6 Varianten, zugeschnitten auf Kopfrechnen (20–60 Sekunden, eindeutige Antwort, „glatte“ Zahlen).
- Neue Aufgaben liegen in `public/library/ND/`, IDs `D` + Themenblock + Nummer (z. B. `D8EA1`), damit sie sich nie mit IDs des Originals überschneiden.
- Auch schwer „kopfrechentaugliche“ Themen (Rotationskörper, Konfidenzintervalle) bekommen kurze Automatisierungsaufgaben, z. B. Formeln, Sigma-Regeln, einfache Werte.
- Fünf Subagenten nach Stufen; anschließend prüft ein unabhängiger Agent stichprobenartig die Mathematik.
- **Divisionszeichen:** In Fragen und Lösungen wird `\div` (÷) zentral in der Engine als Doppelpunkt angezeigt, wie in deutschen Schulbüchern üblich. Die erwarteten Antworten bleiben unverändert, deshalb ändert sich an der Antwortprüfung nichts. Die Aufgaben-Dateien enthalten weiter `\div`.
- **„Ne pas tirer“** (Einstellung, welche Zufallswerte ausgeschlossen werden) heißt einheitlich „Nicht abfragen“.
- **Koordinatenpaare:** Die Antwortprüfung erkennt (3|4), (3;4) und (3, 4) als gleichwertig; die Tastatur hat eine „|“-Taste. Die Aufgaben-Dateien können ihr altes Antwortformat behalten.
- **Tastatur:** neue Taste „Rechteck“; der Doppelzentner heißt „dt“ wie in Deutschland üblich.
- **Varianten außerhalb des Kernlehrplans** (z. B. Quotientenregel, Tangensfunktion) bleiben erhalten, tragen aber den Zusatz „(nicht im Kernlehrplan NRW)“ bzw. „(nur LK)“ im Variantennamen. Lehrkräfte können sie in den Einstellungen abwählen.
- **Antwortprüfung, Dezimalkomma:** Mit der echten Tastatur getippte Kommas („0,5“, „0{,}5“ aus dem Formelfeld) werden wie Dezimalpunkte gewertet – außer in Koordinatenpaaren und Listen, wo das Komma Werte trennen kann. Vorher galten deutsche Eingaben mit Komma als falsch.
- **Behobene Engine-Fehler:** Prüfmodus „vollständig gekürzter Bruch“ verglich den Wert nicht (jeder gekürzte Bruch galt als richtig); Diashow mit Beispiel-Einstieg verlor die aufgabenspezifischen Tastaturen.
- **Wortantworten:** Das Formelfeld (MathLive) wandelt beim Tippen Buchstabenfolgen in Symbole um („keine“ → „ke∈e“, „spitz“ → „s π tz“). Besteht die erwartete Antwort nur aus Wörtern, macht die Prüfung diese Umwandlungen rückgängig und vergleicht ohne Leerzeichen und Groß-/Kleinschreibung.
- **Tippen im Formelfeld:** Die Standard-Kürzel des Formelfelds (MathLive) zerlegten beim Tippen deutsche Wörter („in“ → ∈, „pi“ → π, „ch“ → cosh, „or“ → ∨; aus „windschief“ wurde „w∈ds χ ef“). Alle Formelfelder verwenden jetzt nur noch reine Symbol-Kürzel (>=, <=, !=, +-, oo für ∞, sqrt). π und andere Zeichen gibt es über die Bildschirmtastatur; ein getipptes „pi“ wird als π gewertet, wenn π erwartet wird.
- **Terme mit „y =“ / „f(x) =“:** Tippt jemand „y = 2x+3“, obwohl nur der Term „2x+3“ erwartet wird, gilt das als richtig.
- **„|“ auf der Tastatur:** Ein getippter senkrechter Strich verwirrte das Formelfeld (es erwartet Betragsstriche). Er wird jetzt direkt als Zeichen eingefügt, damit Punkte wie P(4|−3|4) eingegeben werden können.

## Stand am Ende der Nacht (28.10.2026)

- 490 Aufgaben: 412 übersetzte aus MathsMentales und 78 neue deutsche Generatoren. Jeder Themenblock von Klasse 5 bis Q1/Q2 hat mindestens eine Aufgabe.
- Alle neuen Generatoren hat ein zweiter, unabhängiger Agent gegengeprüft (zusammen über 38 000 nachgerechnete Fragen; keine mathematischen Fehler, aber zahlreiche Korrekturen an Sprache, Darstellung, Sachwerten und Eingabeformen).
- Bei der Übersetzung wurden rund 90 Fehler des Originals behoben (fehlende oder falsche erwartete Antworten, falsche Lösungswege, HTML-Fehler).

## Offene Punkte für Franz

**Vor dem Veröffentlichen**
1. Impressum und Datenschutzerklärung ausfüllen (gelb markierte Platzhalter) und rechtlich prüfen lassen.
2. Hosting entscheiden. Für GitHub Pages reicht ein Workflow, der `npx gulp` ausführt und `src/` und `public/` zusammenführt (wie im Original). Kurz-Links (`public/getshort.php`) und Cloud-Verlauf (`public/proxy/`) funktionieren nur mit PHP-Hosting und sind standardmäßig aus.
3. Die Vorschaubild-Angabe (`og:image`) in `src/index.html` auf die endgültige Adresse umstellen.

**Inhaltlich (nach Bedarf)**
- Verteilung: Klasse 5–7 sind sehr gut bestückt (Erbe des französischen Collège), Klasse 8–10 und die Oberstufe haben meist ein bis drei Aufgaben je Themenblock. Hier lohnen weitere Generatoren am meisten.
- Fast-Dubletten, die man zusammenlegen könnte: 6NE11/8NE5, 6NE12/6NE2, 8NE2/8NE4/8NE6, 8NE7/8NE11, 5GT2/5GT3, 6NC3/6NC10, 5NC9/5NC10, 5NE3/5NE10, 8GC2/8GC3, 6ND6/6ND27.
- Französische Bilder: Verkehrszeichen in 5GT1 und 8GC5, Halbkreis-Winkelmesser statt Geodreieck in 6ME1–6ME4.
- 5NA6 („ganze Zahl minus Bruch“) und Ko41 (Vorzeichentabelle) sind in NRW unüblich – streichen oder umbauen.
- Varianten außerhalb des Kernlehrplans (Quotientenregel, Tangens) sind gekennzeichnet; ggf. löschen.
- Duell-Figuren und -Hintergründe sind Platzhalter (eigene einfache Grafiken).
- Spielbildschirme (Duell, Gürtel, Dominos …) haben noch das Aussehen des Originals, nur die Startseite und die Infoseiten sind im Karopapier-Look.
- `twoDecimals` zeigt Geldbeträge in Formeln mit Leerzeichen nach dem Komma („16, 67“).
