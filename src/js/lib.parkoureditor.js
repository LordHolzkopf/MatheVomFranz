import utils from "./mods/utils.js";
import {
  DEFAULT_REGLES,
  countQuestions,
  decode,
  encode,
  normalize,
  validate,
} from "./mods/parkourDef.js";
import cart from "./mods/cart.js";
import Sortable from "./libs/sortable/sortable.core.esm.js";

const BROUILLON_KEY = "parkour-editeur-brouillon";

const REGLES_LABELS = {
  delaiDeblocageH: "Wartezeit bis zur nächsten Etappe (Stunden)",
  verrouEchecH: "Sperre nach wiederholtem Scheitern (Stunden)",
  tentativesAvantVerrou: "Fehlversuche in Folge bis zur Sperre",
  seuilReussite: "Richtige Antworten zum Bestehen einer Etappe",
  nbQuestions: "Fragen pro Etappe",
};

const SUPPORTS = [
  { value: "arbre", label: "🌳 Baum" },
  { value: "toit", label: "🏠 Dach" },
  { value: "barre", label: "🤸 Stange" },
];

const MM_VERSION = utils.getVersion();

/** État d'édition : toujours un parcours normalisé. */
let def = nouveauParcours();
// instance Sortable de la liste d'étapes courante, détruite avant chaque
// nouveau render() (convention du dépôt, voir MM.js)
let etapesSortable = null;

function nouveauParcours() {
  return normalize({
    id: "mein-parkour",
    titre: "Mein Parkour",
    themes: [{ id: "nombres", label: "Zahlen und Rechnen" }],
    etapes: [],
  });
}

/** Transforme un titre en identifiant utilisable dans une clé de stockage. */
function slugify(texte) {
  return String(texte)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les diacritiques isolés par NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function sauverBrouillon() {
  try {
    window.localStorage.setItem(BROUILLON_KEY, JSON.stringify(def));
  } catch {
    // quota plein ou stockage refusé : l'édition continue, sans filet
  }
}

function chargerBrouillon() {
  try {
    const brut = window.localStorage.getItem(BROUILLON_KEY);
    if (brut) def = normalize(JSON.parse(brut));
  } catch {
    def = nouveauParcours();
  }
}

/** Champ texte étiqueté, relié à une fonction de mise à jour. */
function champTexte(labelText, value, onChange) {
  const ligne = utils.create("div", { className: "pe-champ" });
  ligne.appendChild(utils.create("label", { textContent: labelText }));
  const input = utils.create("input", { type: "text", value: value });
  input.oninput = () => onChange(input.value);
  ligne.appendChild(input);
  return ligne;
}

function renderEntete() {
  const zone = document.getElementById("pe-entete");
  zone.innerHTML = "";
  zone.appendChild(utils.create("h2", { textContent: "Der Parkour" }));

  // référence gardée pour mettre à jour l'identifiant sans re-rendre le champ
  // titre pendant la frappe (renderEntete() y ferait perdre le focus)
  let inputIdentifiant;

  zone.appendChild(
    champTexte("Titel für die Lernenden", def.titre, (value) => {
      const ancienSlug = slugify(def.titre);
      def.titre = value;
      // tant que le prof n'a pas fixé l'identifiant à la main, il suit le titre
      // "mon-parcours" : identifiant par défaut des brouillons créés avant la traduction
      if (def.id === ancienSlug || def.id === "mein-parkour" || def.id === "mon-parcours") {
        def.id = slugify(value) || "mein-parkour";
        if (inputIdentifiant) inputIdentifiant.value = def.id;
      }
      sauverBrouillon();
      renderPied();
    }),
  );

  const champIdentifiant = champTexte(
    "ID des Parkours",
    def.id,
    (value) => {
      def.id = slugify(value);
      sauverBrouillon();
      renderPied();
    },
  );
  inputIdentifiant = champIdentifiant.querySelector("input");
  zone.appendChild(champIdentifiant);

  zone.appendChild(
    utils.create("p", {
      className: "pe-aide pe-avertissement",
      textContent:
        "Unter dieser ID wird der Fortschritt der Lernenden gespeichert. Wenn Sie sie nach dem Verteilen ändern, beginnen alle wieder bei null.",
    }),
  );

  const actions = utils.create("div", { className: "pe-champ" });
  const btnNouveau = utils.create("button", { textContent: "Neuer Parkour" });
  btnNouveau.onclick = () => {
    if (!window.confirm("Den Parkour, den Sie gerade bearbeiten, verwerfen?")) return;
    def = nouveauParcours();
    sauverBrouillon();
    render();
  };
  actions.appendChild(btnNouveau);

  const inputFichier = utils.create("input", {
    type: "file",
    accept: ".json,application/json",
    className: "pe-import-fichier",
  });
  inputFichier.onchange = async () => {
    const fichier = inputFichier.files[0];
    if (!fichier) return;
    try {
      def = normalize(JSON.parse(await fichier.text()));
      sauverBrouillon();
      render();
    } catch {
      window.alert("Diese Datei enthält keinen lesbaren Parkour.");
    }
    inputFichier.value = "";
  };

  const btnImportFichier = utils.create("button", {
    textContent: "Datei importieren",
  });
  btnImportFichier.onclick = () => inputFichier.click();

  const btnImportLien = utils.create("button", {
    textContent: "Link importieren",
  });
  btnImportLien.onclick = () => {
    const saisi = window.prompt("Fügen Sie den Schüler-Link eines Parkours ein:");
    if (!saisi) return;
    try {
      // on accepte aussi bien le lien complet que le seul code
      const match = saisi.match(/[?&]d=([^&\s]+)/);
      def = decode(match ? match[1] : saisi.trim());
      sauverBrouillon();
      render();
    } catch (err) {
      window.alert("Import nicht möglich: " + err.message);
    }
  };

  actions.appendChild(btnImportFichier);
  actions.appendChild(btnImportLien);
  actions.appendChild(inputFichier);
  zone.appendChild(actions);
}

function renderThemes() {
  const zone = document.getElementById("pe-themes");
  zone.innerHTML = "";
  zone.appendChild(utils.create("h2", { textContent: "Themen" }));
  zone.appendChild(
    utils.create("p", {
      className: "pe-aide",
      textContent:
        "Jedes Thema bekommt auf der Startseite des Spiels eine eigene Sternenleiste.",
    }),
  );

  def.themes.forEach((theme, index) => {
    const ligne = utils.create("div", { className: "pe-champ" });
    const input = utils.create("input", { type: "text", value: theme.label });
    input.oninput = () => {
      theme.label = input.value;
      sauverBrouillon();
      renderPied();
    };
    ligne.appendChild(input);
    const btnSuppr = utils.create("button", { textContent: "Löschen" });
    btnSuppr.onclick = () => {
      const utilise = def.etapes.filter((etape) => etape.theme === theme.id);
      if (utilise.length > 0) {
        window.alert(
          "Thema wird verwendet von: " +
            utilise.map((etape) => etape.titre || etape.id).join(", "),
        );
        return;
      }
      def.themes.splice(index, 1);
      sauverBrouillon();
      render();
    };
    ligne.appendChild(btnSuppr);
    zone.appendChild(ligne);
  });

  const btnAjout = utils.create("button", { textContent: "Thema hinzufügen" });
  btnAjout.onclick = () => {
    const idsExistants = new Set(def.themes.map((theme) => theme.id));
    // le numéro suit la longueur de la liste, qui redescend après une
    // suppression : on incrémente donc jusqu'à un slug réellement libre pour
    // ne jamais faire coïncider deux thèmes sur le même id
    let n = def.themes.length + 1;
    let label = "Neues Thema " + n;
    let id = slugify(label);
    while (idsExistants.has(id)) {
      n += 1;
      label = "Neues Thema " + n;
      id = slugify(label);
    }
    def.themes.push({ id, label });
    sauverBrouillon();
    render();
  };
  zone.appendChild(btnAjout);
}

function renderRegles() {
  const zone = document.getElementById("pe-regles");
  zone.innerHTML = "";
  const details = utils.create("details");
  details.appendChild(
    utils.create("summary", { textContent: "Spielregeln (für Fortgeschrittene)" }),
  );
  details.appendChild(
    utils.create("p", {
      className: "pe-aide",
      textContent:
        "Für das übliche Verhalten unverändert lassen. Mit 0 Stunden Wartezeit lässt sich der Parkour in einem Durchgang spielen.",
    }),
  );
  for (const key of Object.keys(DEFAULT_REGLES)) {
    const ligne = utils.create("div", { className: "pe-champ" });
    ligne.appendChild(utils.create("label", { textContent: REGLES_LABELS[key] }));
    const input = utils.create("input", {
      type: "number",
      min: "0",
      step: key.endsWith("H") ? "0.25" : "1",
      value: String(def.regles[key]),
    });
    input.oninput = () => {
      const value = Number(input.value);
      if (input.value !== "" && !Number.isNaN(value)) def.regles[key] = value;
      sauverBrouillon();
      renderPied();
    };
    ligne.appendChild(input);
    details.appendChild(ligne);
  }
  zone.appendChild(details);
}

/**
 * Version diffusable du parcours : les champs de travail de l'éditeur
 * (le lien collé) ne partent pas chez les élèves.
 * @returns {object}
 */
function parcoursPublie() {
  const publie = normalize(def);
  publie.etapes = publie.etapes.map((etape) => {
    const copie = { ...etape };
    delete copie.lien;
    return copie;
  });
  return publie;
}

/** Déclenche le téléchargement d'un fichier texte généré côté navigateur. */
function telecharger(nomFichier, contenu) {
  const blob = new Blob([contenu], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const lien = utils.create("a", { href: url, download: nomFichier });
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}

/** URL du jeu portant le parcours complet dans son paramètre ?d=. */
function lienEleve() {
  const base = new URL("parkour.html", window.location.href);
  return base.href + "?d=" + encode(parcoursPublie());
}

/** Rendu du pied de page : rapport de validation et actions d'export. */
function renderPied() {
  const zone = document.getElementById("pe-pied");
  zone.innerHTML = "";
  const rapport = validate(def);

  if (rapport.erreurs.length === 0 && rapport.avertissements.length === 0) {
    zone.appendChild(
      utils.create("p", { className: "pe-ok", textContent: "Parkour ist fertig." }),
    );
  } else {
    const liste = utils.create("ul");
    for (const message of rapport.erreurs) {
      liste.appendChild(
        utils.create("li", { className: "pe-erreur", textContent: message }),
      );
    }
    for (const message of rapport.avertissements) {
      liste.appendChild(
        utils.create("li", {
          className: "pe-avertissement",
          textContent: message,
        }),
      );
    }
    zone.appendChild(liste);
  }

  const actions = utils.create("div", { className: "pe-champ" });
  const bloquant = rapport.erreurs.length > 0;

  const btnFichier = utils.create("button", {
    textContent: ".json-Datei herunterladen",
    disabled: bloquant,
  });
  btnFichier.onclick = () => {
    telecharger(
      (def.id || "parkour") + ".json",
      JSON.stringify(parcoursPublie(), null, 2),
    );
  };

  const btnLien = utils.create("button", {
    textContent: "Schüler-Link kopieren",
    disabled: bloquant,
  });
  btnLien.onclick = async () => {
    const lien = lienEleve();
    try {
      await navigator.clipboard.writeText(lien);
      btnLien.textContent = "Link kopiert!";
      setTimeout(() => {
        btnLien.textContent = "Schüler-Link kopieren";
      }, 2000);
    } catch {
      window.prompt("Link zum Kopieren:", lien);
    }
  };

  actions.appendChild(btnFichier);
  actions.appendChild(btnLien);
  zone.appendChild(actions);
}

/**
 * Extrait le premier panier d'un lien de partage MathsMentales.
 * utils.getUrlVars attend un objet de type URL (il lit .search et .hash) et
 * renvoie vars.c, un objet de paniers indexés par id de panier.
 * @param {string} lien URL collée par le professeur
 * @returns {object} panier au format cart.import
 * @throws {Error} si le lien n'est pas exploitable
 */
function panierFromUrl(lien) {
  let url;
  try {
    url = new URL(String(lien).trim());
  } catch {
    throw new Error("Das ist keine gültige Adresse.");
  }
  let vars;
  try {
    // utils.getUrlVars appelle decodeURI en interne, qui lève URIError sur un
    // simple "%" isolé dans le lien collé (encodage partiel, copier-coller
    // tronqué…) : on l'englobe pour rendre un message en français plutôt que
    // de laisser fuiter « URI malformed ».
    vars = utils.getUrlVars(url);
  } catch {
    throw new Error("Dieser Link ist fehlerhaft kodiert und kann nicht gelesen werden.");
  }
  const paniers = vars && vars.c ? Object.values(vars.c) : [];
  if (paniers.length === 0) {
    throw new Error(
      "Dieser Link enthält keinen Aufgabenkorb. Verwenden Sie den Link zum Teilen einer Diashow.",
    );
  }
  if (!paniers[0].a || Object.keys(paniers[0].a).length === 0) {
    throw new Error("Der Korb in diesem Link enthält keine Aufgaben.");
  }
  return paniers[0];
}

/**
 * Charge réellement les activités d'un panier pour vérifier qu'elles existent.
 * cart.import() avale ses propres erreurs et résout toujours : il faut
 * inspecter ce qui a été chargé (même précaution que lib.parkour.js).
 * @param {object} panier
 * @returns {Promise<{titres: string[], nbQuestions: number}>}
 */
async function verifierPanier(panier) {
  const panierCart = new cart(0);
  await panierCart.import(panier, false, MM_VERSION);
  const activities = panierCart.activities || [];
  const chargees = activities.filter((a) => a !== undefined);
  if (chargees.length === 0) {
    throw new Error(
      "Es konnte keine Aufgabe geladen werden: unbekannte Aufgaben-IDs oder keine Internetverbindung.",
    );
  }
  const attendues = Object.keys(panier.a).length;
  if (chargees.length < attendues) {
    throw new Error(
      chargees.length + " von " + attendues + " Aufgabe(n) geladen.",
    );
  }
  return {
    titres: chargees.map((a) => a.title),
    nbQuestions: countQuestions(panier),
  };
}

function nouvelleEtape() {
  const numero = def.etapes.length + 1;
  return {
    // id laissé vide : normalize() attribue le premier id "eNN" libre, pour ne
    // jamais réutiliser celui d'une étape existante (clé de progression élève)
    id: "",
    theme: def.themes.length > 0 ? def.themes[0].id : "",
    titre: "Etappe " + numero,
    support: SUPPORTS[(numero - 1) % SUPPORTS.length].value,
    panier: {},
    // lien conservé pour ré-affichage ; retiré à l'export
    lien: "",
  };
}

/** Une carte d'étape : titre, thème, support, lien, résumé, actions. */
function carteEtape(etape, index) {
  const carte = utils.create("div", { className: "pe-etape" });

  const entete = utils.create("div", { className: "pe-etape-entete" });
  entete.appendChild(
    utils.create("span", {
      className: "pe-poignee",
      title: "Zum Verschieben ziehen",
      textContent: "⠿",
    }),
  );
  const inputTitre = utils.create("input", {
    type: "text",
    value: etape.titre || "",
  });
  inputTitre.oninput = () => {
    etape.titre = inputTitre.value;
    sauverBrouillon();
    renderPied();
  };
  entete.appendChild(inputTitre);

  const selectTheme = utils.create("select");
  for (const theme of def.themes) {
    const option = utils.create("option", {
      value: theme.id,
      textContent: theme.label,
    });
    if (theme.id === etape.theme) option.selected = true;
    selectTheme.appendChild(option);
  }
  selectTheme.onchange = () => {
    etape.theme = selectTheme.value;
    sauverBrouillon();
    renderPied();
  };
  entete.appendChild(selectTheme);

  const selectSupport = utils.create("select");
  for (const support of SUPPORTS) {
    const option = utils.create("option", {
      value: support.value,
      textContent: support.label,
    });
    if (support.value === etape.support) option.selected = true;
    selectSupport.appendChild(option);
  }
  selectSupport.onchange = () => {
    etape.support = selectSupport.value;
    sauverBrouillon();
  };
  entete.appendChild(selectSupport);
  carte.appendChild(entete);

  const ligneLien = utils.create("div", { className: "pe-champ" });
  const inputLien = utils.create("input", {
    type: "text",
    value: etape.lien || "",
    placeholder: "Link zum Teilen aus MatheVomFranz hier einfügen",
  });
  inputLien.oninput = () => {
    etape.lien = inputLien.value;
    sauverBrouillon();
  };
  ligneLien.appendChild(inputLien);

  const resume = utils.create("div", { className: "pe-resume" });
  const nbDeclare = countQuestions(etape.panier);
  if (nbDeclare > 0) {
    resume.textContent = "Laut Korb " + nbDeclare + " Fragen.";
  }

  const btnVerifier = utils.create("button", { textContent: "Prüfen" });
  btnVerifier.onclick = async () => {
    btnVerifier.disabled = true;
    resume.className = "pe-resume";
    resume.textContent = "Aufgaben werden geladen …";
    try {
      const panier = panierFromUrl(inputLien.value);
      const infos = await verifierPanier(panier);
      etape.panier = panier;
      etape.lien = inputLien.value;
      if (!etape.titre) etape.titre = panier.t || "";
      const manque = infos.nbQuestions < def.regles.nbQuestions;
      resume.className = "pe-resume " + (manque ? "pe-avertissement" : "pe-ok");
      resume.textContent =
        infos.titres.join(" · ") +
        " — " +
        infos.nbQuestions +
        " Fragen verfügbar" +
        (manque ? ", " + def.regles.nbQuestions + " verlangt." : ".");
      sauverBrouillon();
      renderPied();
    } catch (err) {
      resume.className = "pe-resume pe-erreur";
      resume.textContent = err.message;
    } finally {
      btnVerifier.disabled = false;
    }
  };
  ligneLien.appendChild(btnVerifier);
  carte.appendChild(ligneLien);
  carte.appendChild(resume);

  const actions = utils.create("div", { className: "pe-etape-actions" });
  const btnTester = utils.create("button", { textContent: "Testen" });
  btnTester.onclick = () => {
    if (countQuestions(etape.panier) === 0) {
      window.alert("Prüfen Sie zuerst den Link dieser Etappe.");
      return;
    }
    // parcours jetable : id horodaté (progression isolée) et déblocage immédiat
    const essai = normalize({
      id: "parkour-test-" + Date.now(),
      titre: "Test: " + (etape.titre || "Etappe"),
      regles: { ...def.regles, delaiDeblocageH: 0 },
      themes: def.themes,
      etapes: [{ ...etape, lien: undefined }],
    });
    const base = new URL("parkour.html", window.location.href);
    window.open(base.href + "?d=" + encode(essai), "_blank");
  };
  actions.appendChild(btnTester);
  const btnDupliquer = utils.create("button", { textContent: "Duplizieren" });
  btnDupliquer.onclick = () => {
    const copie = JSON.parse(JSON.stringify(etape));
    copie.id = "";
    copie.titre = (etape.titre || "Etappe") + " (Kopie)";
    def.etapes.splice(index + 1, 0, copie);
    def = normalize(def);
    sauverBrouillon();
    render();
  };
  const btnSupprimer = utils.create("button", { textContent: "Löschen" });
  btnSupprimer.onclick = () => {
    if (!window.confirm("„" + (etape.titre || etape.id) + "“ löschen?")) {
      return;
    }
    def.etapes.splice(index, 1);
    sauverBrouillon();
    render();
  };
  actions.appendChild(btnDupliquer);
  actions.appendChild(btnSupprimer);
  carte.appendChild(actions);

  return carte;
}

function renderEtapes() {
  const zone = document.getElementById("pe-etapes");
  zone.innerHTML = "";
  zone.appendChild(utils.create("h2", { textContent: "Etappen" }));
  zone.appendChild(
    utils.create("p", {
      className: "pe-aide",
      textContent:
        "Die Reihenfolge legt die Voraussetzungen fest: Eine Etappe öffnet sich erst nach der vorherigen.",
    }),
  );

  const liste = utils.create("div", { id: "pe-etapes-liste" });
  def.etapes.forEach((etape, index) => {
    liste.appendChild(carteEtape(etape, index));
  });
  zone.appendChild(liste);

  // détruit le sortable de l'ancien render() avant d'en recréer un sur le
  // nouveau DOM (convention du dépôt, voir MM.js)
  if (etapesSortable) {
    etapesSortable.destroy();
    etapesSortable = null;
  }
  if (def.etapes.length > 0) {
    etapesSortable = new Sortable(liste, {
      animation: 150,
      handle: ".pe-poignee",
      onEnd: (evt) => {
        const [deplacee] = def.etapes.splice(evt.oldIndex, 1);
        def.etapes.splice(evt.newIndex, 0, deplacee);
        sauverBrouillon();
        // Sortable termine encore son propre traitement sur ces nœuds à la
        // sortie de onEnd ; reconstruire le DOM de façon synchrone ici lui
        // ferait perdre ses repères. On diffère donc le rendu.
        setTimeout(render, 0);
      },
    });
  }

  const btnAjout = utils.create("button", { textContent: "Etappe hinzufügen" });
  btnAjout.onclick = () => {
    def.etapes.push(nouvelleEtape());
    def = normalize(def);
    sauverBrouillon();
    render();
  };
  zone.appendChild(btnAjout);
}

function render() {
  renderEntete();
  renderThemes();
  renderRegles();
  renderEtapes();
  renderPied();
}

chargerBrouillon();
render();
