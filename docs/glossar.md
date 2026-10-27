# Glossar und Übersetzungsregeln

Verbindlich für alle Übersetzungen von MatheVomFranz (Oberfläche und später die Aufgaben-Generatoren).

## Anrede

- **„Sie“** auf allen Seiten und Dialogen für Lehrkräfte: Aufgaben suchen, auswählen, einstellen, Dokumente erzeugen, Verlauf, Editor, Über-Seite.
- **„du“** auf allen Bildschirmen, die Lernende bedienen oder lesen: Diashow beim Abspielen, Duell, Parkour, Kopfrechen-Gürtel online, Zuordnen, Pixel-Art, Rückmeldungen auf Antworten („Richtig!“, „Versuch es noch einmal“).
- Geschlechtergerecht, wo es natürlich klingt (Lehrkräfte, Lernende, Klasse). In knappen Spielanzeigen ist „Spieler 1 / Spieler 2“ in Ordnung.

## Produktname

- Sichtbarer Name: **MatheVomFranz**. „MathsMentales“ bleibt nur dort stehen, wo das Original genannt oder gewürdigt wird.

## Spielformen und Ausgabeformate

| Französisch | Deutsch |
|---|---|
| Diaporama | Diashow |
| Cartes flash | Karteikarten |
| Fiche mémorisation | Merkblatt |
| Feuille d’exercices | Übungsblatt |
| Feuille d’interro | Testblatt |
| Ceintures de calcul mental (Ceintures de CM) | Kopfrechen-Gürtel (kurz: Gürtel) |
| Course aux nombres | Zahlenrennen |
| Document LibreOffice | LibreOffice-Dokument |
| J’ai / qui a ? | Ich hab – wer hat? |
| Dominos | Dominos |
| Puzzles | Puzzles |
| Panneau / Mur | Aufgabenwand |
| Pixel Art | Pixel-Art |
| Associations / Match | Zuordnen |
| Duel | Duell |
| Parkour | Parkour |
| Duell-Modi: Top score / Le dernier / La roulette / Le + rapide / Coop | Bestwert / Wer übrig bleibt / Roulette / Wer schneller ist / Gemeinsam |

## Grundbegriffe

| Französisch | Deutsch |
|---|---|
| activité | Aufgabe (Plural: Aufgaben); wenn der Generator selbst gemeint ist: Aufgabentyp |
| panier (d’activités) | Korb (Aufgabenkorb) |
| question | Frage |
| réponse | Antwort |
| énoncé (Reiter) | Aufgaben |
| corrigé / correction | Lösungen / Lösung |
| exemple(s) | Beispiel(e) |
| option (d’une activité) | Variante |
| diapo / diapositive | Folie |
| écran (divisé) | Bildschirm (geteilter Bildschirm) |
| graine (aléatoire) | Startwert (für Zufallszahlen) |
| données aléatoires | Zufallswerte |
| niveau | Stufe (bei Klassenangaben: Klasse) |
| thème | Thema |
| chapitre | Kapitel |
| Accueil | Start |
| Rechercher / Chercher | Suchen |
| Paramétrer / Paramètres | Einstellen / Einstellungen |
| Historique | Verlauf |
| Téléchargements | Materialien |
| À propos | Über MatheVomFranz |
| Lancer | Starten |
| Générer | Erzeugen |
| Ouvrir | Öffnen |
| Plein écran | Vollbild |
| Copier l’adresse / le lien | Link kopieren |
| Imprimer | Drucken |
| durée / temps | Dauer / Zeit |
| chronomètre / minuteur | Stoppuhr / Timer |
| score | Punktzahl, Punkte |
| joueur | Spieler |
| élève(s) | Schülerin/Schüler, Lernende |
| enseignant / prof | Lehrkraft |
| ceinture blanche, jaune, orange, verte, bleue, marron, noire | weißer, gelber, oranger, grüner, blauer, brauner, schwarzer Gürtel |
| nouvelle(s) | neu |
| aléatoire / mélangé | zufällig / gemischt |
| dans l’ordre | der Reihe nach |

## Schreibweise

- Deutsche Anführungszeichen „…“, Apostroph ’, Gedankenstrich –.
- Datum: TT.MM.JJJJ. Uhrzeit: 14:05 Uhr.
- Kein Leerzeichen vor „?“, „!“, „:“ und „;“ (Französisch setzt eins).
- Knapp und alltagsnah, keine wörtlichen Übersetzungen. Beispiel: „Choisissez un niveau“ wird „Klasse wählen“, nicht „Wählen Sie ein Niveau“.

## Mathematische Schreibweise (für Aufgaben, Schritt 5)

| Französisch | Deutsch |
|---|---|
| ]a ; b[ und [a ; b] | (a; b) und [a; b] |
| racine carrée | Quadratwurzel |
| PGCD / PPCM | ggT / kgV |
| a/b « fraction irréductible » | vollständig gekürzter Bruch |
| repère | Koordinatensystem |
| droite graduée | Zahlenstrahl |
| angle droit | rechter Winkel |
| vecteur AB mit Pfeil | Vektor \(\overrightarrow{AB}\) (gleich) |
| 3,5 (virgule) | 3,5 (gleich) |
| Tausendertrennung mit Leerzeichen | gleich (schmales Leerzeichen) |

## Was in Schritt 2 *nicht* übersetzt wird

- Aufgaben-Generatoren in `public/library/` (Schritt 5).
- Stufennamen in `structure.json` (die neue Gliederung kommt in Schritt 4).
- Sprachabhängige Mathe-Hilfsfunktionen in `src/js/mods/math.js`, z. B. Zahlwörter (Schritt 5).
- Code-Kommentare: Sie dürfen französisch bleiben.
- Zahlenformatierung von Rechenwerten (`toLocaleString('fr-FR')` usw.) bleibt unverändert, weil sonst Antworten anders geprüft würden.
