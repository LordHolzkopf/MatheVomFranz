/**
 * Historique des paniers : stockage local, migration depuis l'ancien format,
 * rendu de l'onglet.
 *
 * Avant, l'historique ÉTAIT le innerHTML de sa propre liste
 * (localStorage "history"). Il est désormais une liste d'objets sous la clé
 * "mm-historique-v2" ; la logique pure vit dans historiqueDef.js, testée au
 * `node --test`.
 *
 * Ce module n'importe PAS MM.js : les actions « éditer » et « panier »
 * remontent par les rappels passés à monter(), pour éviter un cycle d'import.
 */
import utils from "./utils.js";
import {
  VERSION,
  TYPES,
  codeType,
  cree,
  normalise,
  compte,
  corrigeURLsDiaporama,
  filtre,
  trie,
  groupeParDate,
  anciennes,
  actives,
  purgeTombstones,
  fusionne,
  valideImport,
  typeDepuisEmoji,
  parseDateFR,
} from "./historiqueDef.js";

const CLE = "mm-historique-v2";
const CLE_ANCIENNE = "history";
const CLE_MIGRE = "mm-historique-migre";
const CLE_CORROMPU = "mm-historique-v2-corrompu";
const MOIS_AVANT_NETTOYAGE = 6;

/**
 * Accès défensifs à localStorage : plein ou bloqué (cookies désactivés dans
 * la configuration du navigateur), il peut lever aussi bien à la lecture qu'à
 * l'écriture — y compris sur la simple lecture de `window.localStorage`.
 * Aucun de ces accès ne doit pouvoir interrompre l'initialisation de la page.
 */
function stockageDisponible() {
  try {
    return !!window.localStorage;
  } catch (err) {
    return false;
  }
}
function lire(cle) {
  try {
    return localStorage.getItem(cle);
  } catch (err) {
    return null;
  }
}
function ecrire(cle, valeur) {
  try {
    localStorage.setItem(cle, valeur);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Empreinte déterministe d'une chaîne, pour donner un id stable à une entrée
 * migrée depuis l'ancien format HTML (entreesDepuisHTML). Sans cela,
 * réimporter deux fois le même ancien export .html duplique tout
 * l'historique : nouvelId() (utilisé par défaut par normalise()) fabrique un
 * id neuf à chaque appel, et fusionne() ne rapproche que par id.
 */
function empreinte(texte) {
  let h = 7;
  for (const c of String(texte)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (h >>> 0).toString(36);
}

const historique = {
  entrees: [],
  chargee: false,

  /**
   * Lit le stockage, migre l'ancien historique au premier appel, et garde le
   * résultat en mémoire. Un JSON illisible ne vide jamais l'historique : il
   * est mis de côté sous une autre clé, en clair, pour pouvoir être récupéré.
   */
  charger() {
    if (this.chargee) return this.entrees;
    this.chargee = true;
    this.entrees = [];
    if (!stockageDisponible()) return this.entrees;
    const brut = lire(CLE);
    if (brut) {
      try {
        const objet = JSON.parse(brut);
        if (objet && Array.isArray(objet.entrees)) {
          this.entrees = objet.entrees.map((entree) => normalise(entree));
        }
      } catch (err) {
        ecrire(CLE_CORROMPU, brut);
        console.error("Historique illisible, mis de côté sous " + CLE_CORROMPU, err);
      }
    }
    if (lire(CLE_MIGRE) === null) {
      const migrees = this.migrerAncien();
      if (migrees.length > 0) {
        this.entrees = fusionne(this.entrees, migrees);
        // Le drapeau n'est posé que si la persistance a réussi : sinon les
        // entrées migrées ne sont nulle part, et il faut retenter au prochain
        // chargement plutôt que de perdre silencieusement la migration.
        if (this.sauver()) {
          ecrire(CLE_MIGRE, String(Date.now()));
        }
      } else {
        // Rien à migrer : rien à réessayer, sans quoi on reparserait l'ancien
        // blob (vide ou absent) à chaque chargement.
        ecrire(CLE_MIGRE, String(Date.now()));
      }
    }
    // Purge réelle, une fois par session (charger() court-circuite ensuite
    // sur this.chargee) : un tombstone plus vieux que l'horizon de nettoyage
    // a eu largement le temps de se propager à tout poste synchronisé, il ne
    // sert plus à rien de le garder — sans quoi le stockage ne ferait plus
    // que grossir, suppression après suppression.
    const avantPurge = this.entrees.length;
    this.entrees = purgeTombstones(this.entrees, MOIS_AVANT_NETTOYAGE);
    if (this.entrees.length !== avantPurge) this.sauver();
    // Répare les diaporamas rangés sous l'ancienne url index.html (voir
    // corrigeURLsDiaporama) : idempotent, donc appelable sans drapeau de
    // migration à part, mais on n'écrit le stockage que si ça a changé
    // quelque chose.
    const corrigees = corrigeURLsDiaporama(this.entrees);
    if (corrigees.some((entree, i) => entree !== this.entrees[i])) {
      this.entrees = corrigees;
      this.sauver();
    } else {
      this.entrees = corrigees;
    }
    this.entrees = trie(this.entrees);
    return this.entrees;
  },

  /**
   * Lit l'ancienne clé et la convertit en entrées.
   *
   * L'ancienne clé "history" n'est ni supprimée ni réécrite : c'est le filet
   * de sécurité si cette conversion se révèle fautive.
   */
  migrerAncien() {
    return this.entreesDepuisHTML(lire(CLE_ANCIENNE));
  },

  /**
   * Convertit un blob HTML de l'ancien format en entrées. Le HTML est parsé
   * dans un document INERTE : il n'est jamais réinjecté dans la page vivante,
   * à la différence de l'ancien import. Sert à la migration comme à la
   * relecture d'un ancien fichier d'export .html.
   */
  entreesDepuisHTML(html) {
    if (!html) return [];
    const doc = new DOMParser().parseFromString("<ol>" + html + "</ol>", "text/html");
    const sorties = [];
    doc.querySelectorAll("li").forEach((li) => {
      const intitule = li.querySelector("span.bold");
      const liens = li.querySelectorAll("a[href]");
      const edition = li.querySelector("span[data-url]");
      const url = liens.length > 0 ? liens[0].getAttribute("href") : edition ? edition.dataset.url : "";
      if (!url) return;
      const texte = intitule ? intitule.textContent : "";
      const paniers = [];
      li.querySelectorAll("ul").forEach((ul) => {
        const titrePanier = ul.querySelector("span.bold");
        const activites = [];
        ul.querySelectorAll("li").forEach((ligne) => {
          activites.push({ id: "", titre: ligne.textContent.trim() });
        });
        paniers.push({ titre: titrePanier ? titrePanier.textContent.trim() : "", activites });
      });
      const quand = parseDateFR(texte, Date.now());
      const entree = normalise(
        {
          // Id déterministe (url + date affichée) : deux conversions du même
          // fichier produisent le même id, et une réimportation en mode
          // fusion (le mode recommandé par l'interface) met à jour l'entrée
          // existante au lieu de la dupliquer.
          id: "h-html-" + quand + "-" + empreinte(url),
          type: typeDepuisEmoji(texte.trim()),
          url,
          urlSansGraine: liens.length > 1 ? liens[1].getAttribute("href") : "",
          paniers,
          cree: quand,
          modifie: quand,
        },
        quand,
      );
      sorties.push(entree);
    });
    return sorties;
  },

  /** Écrit le stockage. Retourne false si le quota est atteint. */
  sauver() {
    if (!stockageDisponible()) return false;
    try {
      localStorage.setItem(CLE, JSON.stringify({ version: VERSION, entrees: this.entrees }));
      return true;
    } catch (err) {
      console.error("Historique non enregistré", err);
      this.signaler(
        "Der Verlauf konnte nicht gespeichert werden: Der Browserspeicher ist voll. Löschen Sie ältere Einträge, um Platz zu schaffen.",
      );
      return false;
    }
  },

  /** Range une nouvelle entrée. À url identique, l'existante est mise à jour. */
  ajouter({ type, url, urlSansGraine, paniers, titre }) {
    this.charger();
    const existante = this.entrees.find((entree) => entree.url === url);
    if (existante !== undefined) {
      existante.modifie = Date.now();
      // Une entrée retrouvée par url peut être un tombstone (supprimée
      // localement puis recréée en préparant à nouveau la même adresse) :
      // recréer, c'est explicitement vouloir la garder de nouveau.
      existante.supprime = false;
      existante.urlSansGraine = urlSansGraine || existante.urlSansGraine;
      existante.paniers = cree({ type, url, paniers }).paniers;
      this.entrees = trie(this.entrees);
      this.sauver();
      this.marquerBouton(codeType(type));
      return existante;
    }
    const entree = cree({ type, url, urlSansGraine, paniers, titre });
    this.entrees = trie([entree, ...this.entrees]);
    this.sauver();
    this.marquerBouton(codeType(type));
    return entree;
  },

  renommer(id, titre) {
    const entree = this.charger().find((e) => e.id === id);
    if (entree === undefined) return;
    const propre = String(titre).trim();
    if (propre === "" || propre === entree.titre) return;
    entree.titre = propre;
    entree.modifie = Date.now();
    this.sauver();
  },

  epingler(id) {
    const entree = this.charger().find((e) => e.id === id);
    if (entree === undefined) return;
    entree.epingle = !entree.epingle;
    entree.modifie = Date.now();
    this.entrees = trie(this.entrees);
    this.sauver();
  },

  /**
   * Marque des entrées comme supprimées (tombstone) au lieu de les retirer :
   * une entrée réellement effacée du tableau réapparaîtrait à la prochaine
   * synchronisation nuage, ressuscitée par la fusion depuis un autre poste
   * qui l'a encore (voir fusionne() dans historiqueDef.js). Le tombstone lui-
   * même ne garde que id/type/dates : paniers, titre et urls sont jetés,
   * inutiles une fois l'entrée effacée — sans quoi une suppression pèserait
   * aussi lourd qu'une entrée active pour toute la durée où purgeTombstones()
   * la conserve encore (voir charger()). Retourne l'état d'avant suppression
   * (lui, complet), pour permettre l'annulation.
   */
  supprimer(ids) {
    this.charger();
    const retirees = this.entrees.filter(
      (entree) => ids.indexOf(entree.id) > -1 && entree.supprime !== true,
    );
    const maintenant = Date.now();
    this.entrees = this.entrees.map((entree) =>
      ids.indexOf(entree.id) > -1
        ? normalise(
            { id: entree.id, type: entree.type, cree: entree.cree, modifie: maintenant, supprime: true },
            maintenant,
          )
        : entree,
    );
    this.sauver();
    return retirees;
  },

  /** Remet en place des entrées supprimées (bouton « Annuler »). */
  restaurer(entrees) {
    this.charger();
    const actuelles = new Map(this.entrees.map((entree) => [entree.id, entree]));
    const maintenant = Date.now();
    // modifie doit strictement dépasser celui du tombstone en place, sans
    // quoi une annulation survenue dans la même milliseconde que la
    // suppression se ferait départager au hasard par gagne() (comparaison de
    // sérialisation) au lieu de rétablir l'entrée à coup sûr.
    const restaurees = entrees.map((entree) => {
      const tombe = actuelles.get(entree.id);
      const modifie = tombe !== undefined ? Math.max(maintenant, tombe.modifie + 1) : maintenant;
      return Object.assign({}, entree, { supprime: false, modifie });
    });
    this.entrees = fusionne(this.entrees, restaurees);
    this.sauver();
  },

  /** Vide l'historique visible en tombstonant chaque entrée active, pour que la synchronisation propage la suppression au lieu de la contredire. */
  vider() {
    this.charger();
    const ids = actives(this.entrees).map((entree) => entree.id);
    this.supprimer(ids);
  },

  /** Supprime les entrées non épinglées de plus de N mois. Retourne le nombre retiré. */
  nettoyerAnciens(mois = MOIS_AVANT_NETTOYAGE) {
    const aRetirer = anciennes(actives(this.charger()), mois);
    if (aRetirer.length === 0) return 0;
    this.supprimer(aRetirer.map((entree) => entree.id));
    return aRetirer.length;
  },

  /** Entrées candidates au nettoyage, pour l'avertissement de l'en-tête. */
  anciennes(mois = MOIS_AVANT_NETTOYAGE) {
    return anciennes(actives(this.charger()), mois);
  },

  exporterJSON() {
    return JSON.stringify({ version: VERSION, entrees: this.charger() }, null, 2);
  },

  /**
   * Importe un fichier. Accepte le JSON du nouveau format et, pour ne perdre
   * aucune sauvegarde, les anciens exports .html, passés par le même parseur
   * inerte que la migration.
   */
  importerJSON(contenu, mode = "fusion") {
    this.charger();
    let resultat;
    const texte = String(contenu).trim();
    if (texte.startsWith("{")) {
      try {
        resultat = valideImport(JSON.parse(texte));
      } catch (err) {
        return { ok: false, ajoutees: 0, erreurs: ["Diese Datei ist kein lesbarer Verlauf."] };
      }
    } else {
      // Ancien export .html : même parseur inerte que la migration, sans
      // jamais écrire dans la clé "history", qui reste intouchable.
      const entrees = this.entreesDepuisHTML(texte);
      resultat = {
        ok: entrees.length > 0,
        entrees,
        erreurs: entrees.length > 0 ? [] : ["In dieser Datei wurde kein Eintrag gefunden."],
      };
    }
    if (!resultat.ok) return { ok: false, ajoutees: 0, erreurs: resultat.erreurs };
    let ajoutees;
    if (mode === "remplacement") {
      this.entrees = trie(resultat.entrees);
      ajoutees = resultat.entrees.length;
    } else {
      const fusionnees = fusionne(this.entrees, resultat.entrees);
      // Compte les entrées du fichier réellement retenues par la fusion
      // (nouvel id, ou version gagnante d'un id déjà connu), pas la variation
      // de longueur : un fichier qui ne fait que mettre à jour des entrées
      // existantes ne changerait pas la longueur, sans que rien n'ait été
      // importé pour autant.
      const parId = new Map(fusionnees.map((entree) => [entree.id, entree]));
      ajoutees = resultat.entrees.filter((entree) => parId.get(entree.id) === entree).length;
      this.entrees = fusionnees;
    }
    this.sauver();
    return { ok: true, ajoutees, erreurs: resultat.erreurs };
  },

  /* ---------------------------------------------------------------- vue */

  section: null,
  rappels: {
    onEditer: () => {},
    onPanier: () => {},
    onPanierCourant: () => {},
    onConfigurerNuage: () => {},
    onSynchroniser: () => {},
  },
  recherche: "",
  typesActifs: [],
  selectionActive: false,
  aAnnuler: null,
  lotSuppression: null,

  /** Construit l'onglet une fois pour toutes et pose la délégation de clic. */
  monter(section, rappels = {}) {
    this.section = section;
    this.rappels = Object.assign(
      {
        onEditer: () => {},
        onPanier: () => {},
        onPanierCourant: () => {},
        onConfigurerNuage: () => {},
        onSynchroniser: () => {},
      },
      rappels,
    );
    // La zone d'annonce doit exister AVANT le premier chargement : charger()
    // peut migrer l'ancien historique et échouer à le persister (quota
    // plein), auquel cas sauver() appelle signaler(), qui écrit dans
    // #hist-annonce. rendre() (plus bas) se charge d'appeler charger().
    section.innerHTML = "";
    section.appendChild(this.construireEntete());
    section.appendChild(utils.create("div", { id: "hist-liste" }));
    section.appendChild(
      utils.create("div", { id: "hist-annonce", className: "hist-annonce", role: "status" }),
    );
    section.querySelector("#hist-annonce").setAttribute("aria-live", "polite");
    this.brancherEntete();
    section.querySelector("#hist-liste").addEventListener("click", (evt) => this.surClic(evt));
    this.rendre();
  },

  construireEntete() {
    const entete = utils.create("header", { className: "hist-entete" });
    entete.innerHTML = `
      <div class="hist-titre">
        <span>Verlauf der Aufgabenkörbe</span>
        <span id="hist-compte" class="hist-compte"></span>
      </div>
      <div class="hist-outils">
        <label class="hist-recherche">
          <span aria-hidden="true">🔎</span>
          <input type="search" id="hist-input-recherche" placeholder="Suchen …"
                 aria-label="Im Verlauf suchen">
        </label>
        <select id="hist-filtre-type" aria-label="Nach Art filtern"></select>
        <button type="button" id="hist-btn-selection" title="Mehrere Einträge auswählen">☑ Auswählen</button>
        <details class="hist-menu">
          <summary title="Weitere Aktionen">⋯</summary>
          <div class="hist-menu-contenu">
            <button type="button" id="hist-btn-export">💾 Exportieren (JSON)</button>
            <button type="button" id="hist-btn-import">📂 Importieren …</button>
            <hr>
            <button type="button" id="hist-btn-nuage-config">☁️ Synchronisierung einrichten</button>
            <button type="button" id="hist-btn-nuage-sync">🔄 Jetzt synchronisieren</button>
            <hr>
            <button type="button" id="hist-btn-nettoyer" class="hist-danger">🧹 Alte Einträge aufräumen</button>
            <button type="button" id="hist-btn-vider" class="hist-danger">💥 Verlauf leeren</button>
          </div>
        </details>
        <input type="file" id="hist-input-import" accept=".json,.html,application/json,text/html" class="hidden">
      </div>
      <div id="hist-actions-selection" class="hidden">
        Auswahl:
        <button type="button" id="hist-btn-suppr-selection">Löschen</button>
      </div>
      <div id="hist-avertissement" class="hidden"></div>`;
    return entete;
  },

  brancherEntete() {
    const s = this.section;
    s.querySelector("#hist-input-recherche").addEventListener("input", (evt) => {
      this.recherche = evt.target.value;
      this.rendre();
      this.annoncerFiltrage();
    });
    s.querySelector("#hist-filtre-type").addEventListener("change", (evt) => {
      this.typesActifs = evt.target.value === "" ? [] : [evt.target.value];
      this.rendre();
      this.annoncerFiltrage();
    });
    s.querySelector("#hist-btn-selection").addEventListener("click", () => {
      this.selectionActive = !this.selectionActive;
      s.querySelector("#hist-actions-selection").className = this.selectionActive ? "" : "hidden";
      this.rendre();
    });
    s.querySelector("#hist-btn-suppr-selection").addEventListener("click", () => {
      const ids = [...s.querySelectorAll(".hist-case:checked")].map((c) => c.dataset.id);
      if (ids.length === 0) return;
      this.supprimerAvecAnnulation(ids);
    });
    s.querySelector("#hist-btn-export").addEventListener("click", () => this.telecharger());
    s.querySelector("#hist-btn-import").addEventListener("click", () =>
      s.querySelector("#hist-input-import").click(),
    );
    s.querySelector("#hist-input-import").addEventListener("change", (evt) => this.surFichier(evt));
    s.querySelector("#hist-btn-nuage-config").addEventListener("click", () => this.rappels.onConfigurerNuage());
    s.querySelector("#hist-btn-nuage-sync").addEventListener("click", () => this.rappels.onSynchroniser());
    s.querySelector("#hist-btn-nettoyer").addEventListener("click", () => {
      // Nettoyer passe par le même mécanisme d'annulation qu'une suppression
      // manuelle : c'est sinon la seule destruction de données du module sans
      // filet.
      const candidates = this.anciennes();
      if (candidates.length === 0) {
        this.signaler("Keine alten Einträge zum Aufräumen.");
        return;
      }
      this.supprimerAvecAnnulation(candidates.map((entree) => entree.id));
    });
    s.querySelector("#hist-btn-vider").addEventListener("click", () => {
      // Seule action assez massive pour mériter un vrai point d'arrêt.
      if (!window.confirm("Wollen Sie wirklich den gesamten Verlauf löschen?")) return;
      this.vider();
      this.rendre();
    });
  },

  /** Reconstruit la liste et l'en-tête variable depuis l'état courant. */
  rendre() {
    const s = this.section;
    if (s === null) return;
    const toutes = actives(this.charger());
    // rendreFiltreTypes doit tourner avant le filtrage : si le type choisi a
    // disparu de l'historique, elle remet this.typesActifs à vide, et ce
    // filtrage-ci doit en tenir compte immédiatement, pas au rendu suivant.
    this.rendreFiltreTypes(toutes);
    const visibles = filtre(toutes, { recherche: this.recherche, types: this.typesActifs });
    s.querySelector("#hist-compte").textContent =
      toutes.length === 0 ? "" : toutes.length + (toutes.length > 1 ? " Einträge" : " Eintrag");
    this.rendreAvertissement();
    const liste = s.querySelector("#hist-liste");
    liste.innerHTML = "";
    if (visibles.length === 0) {
      liste.appendChild(this.construireVide(toutes.length === 0));
      return;
    }
    for (const groupe of groupeParDate(visibles, Date.now())) {
      liste.appendChild(utils.create("h3", { className: "hist-groupe", textContent: groupe.libelle }));
      const ol = utils.create("ol", { className: "hist-liste-groupe" });
      for (const entree of groupe.entrees) ol.appendChild(this.construireCarte(entree));
      liste.appendChild(ol);
    }
  },

  /**
   * Annonce le nombre de résultats aux lecteurs d'écran après une recherche
   * ou un changement de filtre par type : #hist-annonce reste dans l'arbre
   * d'accessibilité (voir le CSS), donc écrire son texte suffit à la faire
   * lire, sans qu'elle ait besoin d'apparaître visuellement.
   */
  annoncerFiltrage() {
    if (this.section === null) return;
    const zone = this.section.querySelector("#hist-annonce");
    if (zone === null) return;
    // Ne pas écraser un bandeau « Annuler » de suppression en attente : son
    // bouton est un enfant de cette même zone, et écrire textContent le
    // détruirait avant l'expiration du délai d'annulation.
    if (this.lotSuppression !== null) return;
    const filtrageActif = this.recherche.trim() !== "" || this.typesActifs.length > 0;
    if (!filtrageActif) return;
    const visibles = filtre(actives(this.entrees), { recherche: this.recherche, types: this.typesActifs });
    zone.textContent =
      visibles.length + " Treffer gefunden.";
  },

  /** Le menu ne propose que les types réellement présents dans l'historique. */
  rendreFiltreTypes(entrees) {
    const select = this.section.querySelector("#hist-filtre-type");
    const presents = [...new Set(entrees.map((entree) => entree.type))];
    const choix = this.typesActifs[0] || "";
    select.innerHTML = "";
    select.appendChild(utils.create("option", { value: "", textContent: "Alle Arten" }));
    for (const code of presents) {
      select.appendChild(
        utils.create("option", {
          value: code,
          textContent: TYPES[code].emoji + " " + TYPES[code].libelle,
        }),
      );
    }
    const disponible = presents.indexOf(choix) > -1;
    select.value = disponible ? choix : "";
    // Le type choisi a disparu de l'historique (sa dernière entrée a été
    // supprimée) : on efface le filtre au lieu de le laisser actif alors que
    // le menu, lui, revient silencieusement sur « Tous les types ».
    if (choix !== "" && !disponible) this.typesActifs = [];
  },

  rendreAvertissement() {
    const zone = this.section.querySelector("#hist-avertissement");
    const vieilles = this.anciennes();
    if (vieilles.length === 0) {
      zone.className = "hidden";
      zone.textContent = "";
      return;
    }
    zone.className = "hist-avertissement";
    zone.textContent = vieilles.length + (vieilles.length === 1 ? " Eintrag ist" : " Einträge sind") + " älter als 6 Monate · ";
    const bouton = utils.create("button", { type: "button", textContent: "Aufräumen" });
    // Même mécanisme d'annulation que le bouton du menu ⋯ et qu'une
    // suppression manuelle : voir supprimerAvecAnnulation.
    bouton.addEventListener("click", () => this.supprimerAvecAnnulation(vieilles.map((entree) => entree.id)));
    zone.appendChild(bouton);
  },

  construireVide(historiqueVide) {
    const div = utils.create("div", { className: "hist-vide" });
    if (historiqueVide) {
      div.innerHTML = `<p>Ihr Verlauf ist leer.</p>
        <p>Die Schaltflächen <b>„→ Verlauf“</b> in den Reitern Einstellen, Aufgaben und Lösungen legen hier
        die Adresse dessen ab, was Sie gerade vorbereitet haben – so finden Sie es später wieder.</p>`;
      return div;
    }
    div.appendChild(
      utils.create("p", { textContent: "Keine Treffer für „" + this.recherche + "“." }),
    );
    const bouton = utils.create("button", { type: "button", textContent: "Suche zurücksetzen" });
    bouton.addEventListener("click", () => {
      this.recherche = "";
      this.typesActifs = [];
      this.section.querySelector("#hist-input-recherche").value = "";
      this.rendre();
    });
    div.appendChild(bouton);
    return div;
  },

  construireCarte(entree) {
    const type = TYPES[entree.type];
    const nombres = compte(entree);
    const li = utils.create("li", { className: "hist-carte" });
    li.dataset.id = entree.id;

    const ligne = utils.create("div", { className: "hist-carte-ligne" });
    if (this.selectionActive) {
      const case_ = utils.create("input", { type: "checkbox", className: "hist-case" });
      case_.dataset.id = entree.id;
      case_.setAttribute("aria-label", entree.titre + " auswählen");
      ligne.appendChild(case_);
    }
    ligne.appendChild(
      utils.create("span", { className: "hist-icone", textContent: type.emoji, title: type.libelle }),
    );
    const titre = utils.create("span", {
      className: "hist-titre-entree",
      textContent: entree.titre,
      contentEditable: "true",
      title: "Zum Umbenennen anklicken",
    });
    // Branché à la construction, pas au clic : un champ atteint au clavier
    // (Tab) doit valider sa saisie tout autant qu'un champ atteint à la
    // souris, sinon la frappe s'y perd silencieusement.
    this.brancherRenommage(titre, entree);
    ligne.appendChild(titre);
    ligne.appendChild(
      utils.create("time", {
        className: "hist-date",
        textContent: this.dateRelative(entree.modifie),
        title:
          new Date(entree.modifie).toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " Uhr",
      }),
    );
    li.appendChild(ligne);

    const meta = [];
    if (nombres.activites > 0) meta.push(nombres.activites + (nombres.activites > 1 ? " Aufgaben" : " Aufgabe"));
    if (nombres.questions > 0) meta.push(nombres.questions + (nombres.questions > 1 ? " Fragen" : " Frage"));
    meta.push(type.libelle);
    li.appendChild(utils.create("div", { className: "hist-meta", textContent: meta.join(" · ") }));

    if (entree.paniers.length > 0) li.appendChild(this.construireDetail(entree));
    li.appendChild(this.construireActions(entree));
    return li;
  },

  construireDetail(entree) {
    const details = utils.create("details", { className: "hist-detail" });
    details.appendChild(utils.create("summary", { textContent: "Inhalt der Körbe" }));
    const conteneur = utils.create("div", { className: "hist-paniers" });
    for (const panier of entree.paniers) {
      const bloc = utils.create("div", { className: "hist-panier" });
      bloc.appendChild(utils.create("b", { textContent: panier.titre }));
      const ul = utils.create("ul");
      for (const activite of panier.activites) {
        ul.appendChild(utils.create("li", { textContent: activite.titre }));
      }
      bloc.appendChild(ul);
      conteneur.appendChild(bloc);
    }
    details.appendChild(conteneur);
    return details;
  },

  construireActions(entree) {
    const zone = utils.create("div", { className: "hist-actions" });
    // Vrais liens : on doit pouvoir les ouvrir dans un nouvel onglet et copier
    // l'adresse au clic droit. Les seules actions qui ne sont pas des boutons.
    zone.appendChild(
      utils.create("a", { href: entree.url, className: "hist-lien", textContent: "🎯 Öffnen" }),
    );
    if (entree.urlSansGraine !== "") {
      zone.appendChild(
        utils.create("a", {
          href: entree.urlSansGraine,
          className: "hist-lien",
          textContent: "🎲 Neue Zufallswerte",
        }),
      );
    }
    const actions = [
      ["editer", "🛠", "In „Einstellen“ bearbeiten"],
      ["panier", "♻️", "Als neuen Korb hinzufügen"],
      ["panierCourant", "➕", "Zum aktuellen Korb hinzufügen"],
      ["epingler", entree.epingle ? "📌" : "📍", entree.epingle ? "Lösen" : "Anheften"],
      ["supprimer", "❌", "Löschen"],
    ];
    for (const [action, icone, libelle] of actions) {
      const bouton = utils.create("button", {
        type: "button",
        className: "hist-action",
        textContent: icone,
        title: libelle,
      });
      bouton.dataset.action = action;
      bouton.setAttribute("aria-label", libelle + ": " + entree.titre);
      zone.appendChild(bouton);
    }
    return zone;
  },

  /**
   * Délégation unique. Les actions sont reconnues par data-action : l'ancien
   * code testait evt.target.innerHTML.indexOf("🛠 éditer"), ce qui cassait au
   * moindre changement de libellé.
   */
  surClic(evt) {
    const cible = evt.target.closest("[data-action]");
    if (cible === null) return;
    const carte = evt.target.closest(".hist-carte");
    if (carte === null) return;
    const id = carte.dataset.id;
    const entree = this.charger().find((e) => e.id === id);
    if (entree === undefined) return;
    switch (cible.dataset.action) {
      case "editer":
        this.rappels.onEditer(entree.url);
        break;
      case "panier":
        this.rappels.onPanier(entree.url);
        break;
      case "panierCourant":
        this.rappels.onPanierCourant(entree.url);
        break;
      case "epingler":
        this.epingler(id);
        this.rendre();
        break;
      case "supprimer":
        this.supprimerAvecAnnulation([id]);
        break;
      default:
        break;
    }
  },

  /** Renommage en place : Entrée valide, Échap annule, la perte du focus valide. */
  brancherRenommage(champ, entree) {
    if (champ.dataset.enEdition === "1") return;
    champ.dataset.enEdition = "1";
    const valider = () => {
      champ.dataset.enEdition = "";
      const propre = champ.textContent.trim();
      // Un titre inchangé (ou vidé au clavier) ne doit déclencher aucune
      // mise à jour : rendre() vide #hist-liste puis la reconstruit, et un
      // clic sur une action de la carte (mousedown juste après avoir touché
      // le titre) se perdrait sur un bouton détaché du DOM entre mousedown
      // et mouseup.
      if (propre === "" || propre === entree.titre) {
        champ.textContent = entree.titre;
        return;
      }
      this.renommer(entree.id, propre);
      // Pas de rendre() ici, y compris différé : un setTimeout(0) ne protège
      // que si mousedown et mouseup sont séparés de quelques millisecondes,
      // alors qu'un clic humain les sépare typiquement de 20 à 150 ms — assez
      // pour que #hist-liste soit déjà reconstruite (donc le bouton visé déjà
      // détaché du DOM) au moment du mouseup, auquel cas le navigateur
      // n'émet aucun click du tout, ni sur l'ancien nœud ni sur le nouveau.
      // On met donc à jour en place la seule chose qui a changé dans CETTE
      // carte : le texte du titre (déjà à jour visuellement, champ EST le
      // titre) et les aria-label qui l'embarquent, sans reconstruire aucun
      // nœud. Le reclassement chronologique (modifie a changé, l'entrée peut
      // changer de groupe/position) n'est pas perdu pour autant : rendre()
      // relit toujours l'état courant de this.entrees, donc le prochain rendu
      // naturel — recherche, filtre, ajout, suppression, épinglage, ou
      // simplement rouvrir l'onglet — le fera correctement.
      this.rafraichirLibellesTitre(champ, entree);
    };
    // Écouteur permanent, pas { once: true } : ce nœud n'est plus reconstruit
    // à chaque renommage (voir rafraichirLibellesTitre ci-dessus), donc un
    // écouteur "une fois" ne serait jamais réarmé — un second renommage de la
    // même carte, sans rendu naturel entre les deux, laisserait le DOM
    // afficher la nouvelle saisie sans jamais l'enregistrer, et un rendu
    // ultérieur quelconque ferait silencieusement revenir l'affichage à la
    // première valeur. Aucun risque d'accumulation : brancherRenommage()
    // n'est appelée qu'une seule fois par nœud, à sa construction dans
    // construireCarte() ; un rendu naturel remplace entièrement le nœud (donc
    // lui attribue un unique nouvel écouteur), il ne s'ajoute jamais à un
    // écouteur existant.
    champ.addEventListener("blur", valider);
    champ.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        champ.blur();
      } else if (evt.key === "Escape") {
        // entree.titre — plutôt qu'une valeur "initial" figée à la
        // construction du nœud — est toujours la dernière valeur
        // effectivement enregistrée : après un premier renommage réussi sans
        // rendu entre les deux éditions, c'est à cette valeur-là qu'Échap
        // doit revenir, pas à celle d'avant cette carte.
        champ.textContent = entree.titre;
        champ.blur();
      }
    });
  },

  /**
   * Met à jour, dans la carte du champ renommé et seulement là, tout ce qui
   * embarquait l'ancien titre : le texte du champ lui-même (au cas où le
   * titre stocké diffère du texte brut tapé — espaces de tête/fin retirés
   * par renommer()), l'aria-label de la case de sélection si elle est
   * affichée, et l'aria-label de chacun des boutons d'action (leur attribut
   * title porte déjà le libellé seul — « Supprimer », « Épingler »/
   * « Désépingler »… — donc pas besoin de le recalculer ici).
   */
  rafraichirLibellesTitre(champ, entree) {
    champ.textContent = entree.titre;
    const carte = champ.closest(".hist-carte");
    if (carte === null) return;
    const case_ = carte.querySelector(".hist-case");
    if (case_ !== null) case_.setAttribute("aria-label", entree.titre + " auswählen");
    carte.querySelectorAll("[data-action]").forEach((bouton) => {
      const libelle = bouton.getAttribute("title") || "";
      bouton.setAttribute("aria-label", libelle + ": " + entree.titre);
    });
  },

  /**
   * Suppression annulable : un confirm() répétitif se valide en réflexe, une
   * annulation de six secondes protège mieux.
   *
   * Des suppressions rapprochées (deux clics ❌, ou un clic ❌ suivi d'un
   * « Nettoyer ») s'accumulent dans un même lot annulable au lieu de se
   * remplacer : sans quoi le bouton « Annuler » de la première suppression
   * disparaîtrait, remplacé par celui de la seconde, et la première
   * deviendrait irrécupérable sans que personne n'en soit averti.
   */
  supprimerAvecAnnulation(ids) {
    const retirees = this.supprimer(ids);
    this.rendre();
    this.lotSuppression = (this.lotSuppression || []).concat(retirees);
    const lot = this.lotSuppression;
    const zone = this.section.querySelector("#hist-annonce");
    zone.textContent = lot.length + (lot.length === 1 ? " Eintrag gelöscht · " : " Einträge gelöscht · ");
    const bouton = utils.create("button", { type: "button", textContent: "Rückgängig" });
    bouton.addEventListener("click", () => {
      this.restaurer(lot);
      this.lotSuppression = null;
      if (this.aAnnuler !== null) {
        clearTimeout(this.aAnnuler);
        this.aAnnuler = null;
      }
      zone.textContent = "";
      zone.className = "hist-annonce";
      this.rendre();
    });
    zone.appendChild(bouton);
    zone.className = "hist-annonce hist-annonce-visible";
    this.planifierEffacementAnnonce(zone, () => {
      this.lotSuppression = null;
    });
  },

  /**
   * Minuteur unique de la zone d'annonce partagée. signaler() et
   * supprimerAvecAnnulation() y écrivent tous les deux : sans ce minuteur
   * mémorisé et systématiquement annulé avant d'en reposer un, le
   * setTimeout de l'un pouvait effacer le message de l'autre avant terme.
   */
  planifierEffacementAnnonce(zone, aLExpiration) {
    if (this.aAnnuler !== null) clearTimeout(this.aAnnuler);
    this.aAnnuler = setTimeout(() => {
      this.aAnnuler = null;
      zone.textContent = "";
      zone.className = "hist-annonce";
      if (aLExpiration) aLExpiration();
    }, 6000);
  },

  /** Message d'information dans l'onglet (remplace la version console). */
  signaler(texte) {
    if (this.section === null) {
      console.warn(texte);
      return;
    }
    const zone = this.section.querySelector("#hist-annonce");
    // La zone n'existe pas encore si signaler() est atteint pendant le tout
    // premier charger() de monter(), avant que la vue ne soit construite
    // (ex. migration + quota plein) : ne jamais supposer un DOM déjà monté.
    if (zone === null) {
      console.warn(texte);
      return;
    }
    // Un signalement n'est pas la continuation d'un lot de suppression en
    // attente : sans ce reset, un message sans rapport (import, quota plein…)
    // qui interrompt visuellement le bandeau « Annuler » laisserait le lot
    // trainer en mémoire, prêt à se raccrocher en silence à une suppression
    // future sans rapport avec lui.
    this.lotSuppression = null;
    zone.textContent = texte;
    zone.className = "hist-annonce hist-annonce-visible";
    this.planifierEffacementAnnonce(zone);
  },

  dateRelative(quand) {
    const ecart = Date.now() - quand;
    const heure = 3600 * 1000;
    if (ecart < heure) return "vor " + Math.max(1, Math.round(ecart / 60000)) + " Min.";
    if (ecart < 24 * heure) return "vor " + Math.round(ecart / heure) + " Std.";
    if (ecart < 48 * heure) return "gestern, " + new Date(quand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
    return new Date(quand).toLocaleDateString("de-DE", { day: "numeric", month: "short" });
  },

  telecharger() {
    const blob = new Blob([this.exporterJSON()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = utils.create("a", { href: url, download: "mathevomfranz-verlauf.json" });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  surFichier(evt) {
    const fichier = evt.target.files[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = (fin) => {
      const remplacer = window.confirm(
        "Ihren Verlauf vollständig durch diese Datei ersetzen?\n\n" +
          "OK: ersetzen.\nAbbrechen: mit dem vorhandenen Verlauf zusammenführen (empfohlen).",
      );
      const resultat = this.importerJSON(fin.target.result, remplacer ? "remplacement" : "fusion");
      this.signaler(
        resultat.ok
          ? resultat.ajoutees + (resultat.ajoutees === 1 ? " Eintrag importiert." : " Einträge importiert.") + (resultat.erreurs.length > 0 ? " " + resultat.erreurs.join(" ") : "")
          : resultat.erreurs.join(" "),
      );
      this.rendre();
    };
    lecteur.readAsText(fichier);
    evt.target.value = "";
  },

  /** Retour visuel sur le bouton « → Historique » qui vient d'être cliqué. */
  marquerBouton(type) {
    const cle = TYPES[type] !== undefined ? TYPES[type].bouton : "";
    const bouton = cle === "" ? null : document.getElementById(cle);
    const toast = document.getElementById("toast");
    if (toast !== null) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    }
    if (bouton === null) return;
    bouton.innerHTML = bouton.innerHTML.replace(/Historique|Verlauf/, "📁 Kopiert ✅");
    setTimeout(() => {
      bouton.innerHTML = bouton.innerHTML.replace("📁 Kopiert ✅", "Verlauf");
    }, 3000);
  },
};

export default historique;
