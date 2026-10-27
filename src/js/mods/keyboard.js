import utils from "./utils.js";
/**
 * keyboard interactif
 * Permet d'entrer des données, traitées ensuite par MathLive
 *
 */
const keysSVG ={
    enterKey : `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.1495 13.4005C18.2541 13.4005 19.1495 12.5051 19.1495 11.4005V3.40051H21.1495V11.4005C21.1495 13.6097 19.3587 15.4005 17.1495 15.4005H6.84398L10.6286 19.1852L9.21443 20.5994L2.85046 14.2354L9.21443 7.87146L10.6286 9.28567L6.5138 13.4005H17.1495Z" fill="currentColor" />
              </svg>`,
    backspaceKey: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.7427 8.46448L19.1569 9.87869L17.0356 12L19.157 14.1214L17.7428 15.5356L15.6214 13.4142L13.5 15.5355L12.0858 14.1213L14.2072 12L12.0859 9.87878L13.5002 8.46457L15.6214 10.5858L17.7427 8.46448Z"
      fill="currentColor" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.58579 19L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L8.58579 5H22.5857V19H8.58579ZM9.41421 7L4.41421 12L9.41421 17H20.5857V7H9.41421Z"
      fill="currentColor"
    /></svg>`,
    leftArrowKey : `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.3284 11.0001V13.0001L7.50011 13.0001L10.7426 16.2426L9.32842 17.6568L3.67157 12L9.32842 6.34314L10.7426 7.75735L7.49988 11.0001L20.3284 11.0001Z"
      fill="currentColor" />
  </svg>`,
    rightArrowKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.0378 6.34317L13.6269 7.76069L16.8972 11.0157L3.29211 11.0293L3.29413 13.0293L16.8619 13.0157L13.6467 16.2459L15.0643 17.6568L20.7079 11.9868L15.0378 6.34317Z"
      fill="currentColor" />
  </svg>`,
  undoKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M5.33929 4.46777H7.33929V7.02487C8.52931 6.08978 10.0299 5.53207 11.6607 5.53207C15.5267 5.53207 18.6607 8.66608 18.6607 12.5321C18.6607 16.3981 15.5267 19.5321 11.6607 19.5321C9.51025 19.5321 7.58625 18.5623 6.30219 17.0363L7.92151 15.8515C8.83741 16.8825 10.1732 17.5321 11.6607 17.5321C14.4222 17.5321 16.6607 15.2935 16.6607 12.5321C16.6607 9.77065 14.4222 7.53207 11.6607 7.53207C10.5739 7.53207 9.56805 7.87884 8.74779 8.46777L11.3393 8.46777V10.4678H5.33929V4.46777Z"
    fill="currentColor" />
</svg>`,
redoKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path
  d="M13.1459 11.0499L12.9716 9.05752L15.3462 8.84977C14.4471 7.98322 13.2242 7.4503 11.8769 7.4503C9.11547 7.4503 6.87689 9.68888 6.87689 12.4503C6.87689 15.2117 9.11547 17.4503 11.8769 17.4503C13.6977 17.4503 15.2911 16.4771 16.1654 15.0224L18.1682 15.5231C17.0301 17.8487 14.6405 19.4503 11.8769 19.4503C8.0109 19.4503 4.87689 16.3163 4.87689 12.4503C4.87689 8.58431 8.0109 5.4503 11.8769 5.4503C13.8233 5.4503 15.5842 6.24474 16.853 7.52706L16.6078 4.72412L18.6002 4.5498L19.1231 10.527L13.1459 11.0499Z"
  fill="currentColor" />
</svg>`,
srqt:`<svg width="1em" height="1em" viewBox="0 0 8.467 8.467" xmlns="http://www.w3.org/2000/svg"><path d="M.982 5.817l.506-.595.865 1.66L4.03 1.529h3.15" fill="none" stroke="currentColor" stroke-width=".529"/></svg>`,
chevronKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M12 15.7071L5.29291 9.00001L6.70712 7.5858L12 12.8787L17.2929 7.5858L18.7071 9.00001L12 15.7071Z" fill="currentColor" />
</svg>`,
fractionKey:`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="4" y1="12" x2="20" y2="12" />
  <rect x="7" y="1" width="10" height="8" rx="1" stroke-dasharray="2 2" stroke="currentColor" stroke-width="1" />
  <rect x="7" y="15" width="10" height="8" rx="1" stroke-dasharray="2 2" stroke="currentColor" stroke-width="1" />
</svg>
`
}
/** clé de mémorisation de l'état ouvert/replié du clavier */
const KB_STORAGE_KEY = "mm-kb-state";
/** clé de mémorisation du côté d'ancrage, et positions possibles */
const KB_ANCHOR_KEY = "mm-kb-anchor";
const KB_ANCHORS = ["left","center","right"];
/** déplacement, en pixels, au delà duquel un appui devient un glissement */
const KB_GESTURE_MIN = 24;
/** clé de mémorisation de la taille des touches, et bornes du réglage */
const KB_SCALE_KEY = "mm-kb-scale";
const KB_SCALE_MIN = 0.6;
const KB_SCALE_MAX = 1.6;
const KB_SCALE_STEP = 0.1;
 export default class keyBoard {
    /**
     *
     * @param {Integer} target champ MathLive à alimenter
     * @param {Array} keys touches à afficher
     * @param {DOMelt} displayContener élément du DOM où ajouter le clavier à afficher
     * @param {String} sliderId Id du slider contenant
     * @param {String} keyboardId Id du keyboard.
     * @param {Integer} nbOfSliders nombre de sliders affichés (pas de focus automatique au delà de 1)
     */
    constructor(target, keys, displayContener, sliderId, keyboardId, nbOfSliders = 1) {
        this.nbOfSliders = nbOfSliders;
        this.keyConf = {
            "÷": ["key colored", "÷", this.insertCmd("\\div"), "geteilt durch"],
            "×": ["key colored", "×", this.insertCmd("\\times"), "mal"],
            "*": ["key colored", "×", this.insertCmd("\\times"), "mal"],
            "-": ["key colored", "−", this.insertCmd("-"), "minus"],
            "mns": ["key colored", "−", this.insertCmd("\\text{ moins}"), "minus"],
            "(": ["key colored", "( )", this.insertCmd("(#0)"), "Klammern"],
            "{": ["key colored", "{ }", this.insertCmd("{#0;#0}"), "geschweifte Klammern"],
            "[": ["key colored", "[ ]", this.insertCmd("[#0]"), "eckige Klammern"],
            "x²": ["key times colored", "x²", this.insertCmd("^2"), "x Quadrat"],
            "x³": ["key times colored", "x³", this.insertCmd("^3"), "x hoch 3"],
            "√": ["key colored", keysSVG.srqt, this.insertCmd("\\sqrt{#0}"), "Quadratwurzel"],
          "/": ["key colored", keysSVG.fractionKey, this.insertCmd("\\dfrac{#0}{#0}"), "Bruch"],
            "vide":["key colored", "∅", this.insertCmd("\\emptyset"), "leere Menge"],
          "pi": ["key colored", "π", this.insertCmd("\\pi"), "pi"],
            "ln":["key colored", "ln", this.insertCmd("\\ln"), "ln"],
            "lgn": ["key colored", "log", this.insertCmd("\\log_{#0}(#0)"), "Logarithmus"],
            "lg": ["key colored", "log", this.insertCmd("\\log(#0))"), "Zehnerlogarithmus"],
            "GD": ["key colored", "groß", this.insertCmd("\\text{groß}"), "groß"],
            "pt": ["key colored", "klein", this.insertCmd("\\text{klein}"), "klein"],
            "^": ["key colored", "xⁿ", this.insertCmd("^{#0}", {format:"latex"}), "Potenz"],
            "10n": ["key colored", "10ⁿ", this.insertCmd("10^{#0}", {format:"latex"}), "Zehnerpotenz"],
            "aigu": ["key colored", "spitz", this.insertCmd("spitz"), "spitz"],
            "obtus": ["key colored", "stumpf", this.insertCmd("stumpf"), "stumpf"],
          "droit": ["key colored", "recht", this.insertCmd("recht"), "recht"],
          "ang": ["key colored", "Â", this.insertCmd("\\widehat{#0}"), "Winkel"],
          "corr": ["key colored", "Stufe", this.insertCmd("\\text{Stufenwinkel}"), "Stufenwinkel"],
          "supp": ["key colored", "suppl", this.insertCmd("\\text{Supplementwinkel}"), "Supplementwinkel (ergänzen sich zu 180°)"],
          "ad&sup": ["key colored", "Neben", this.insertCmd("\\text{Nebenwinkel}"), "Nebenwinkel"],
          "opps": ["key colored", "Scheit", this.insertCmd("\\text{Scheitelwinkel}"), "Scheitelwinkel"],
          "altint": ["key colored", "Wechs", this.insertCmd("\\text{Wechselwinkel}"), "Wechselwinkel"],
          "ssln": ["key colored", "keine", this.insertCmd("\\text{keine Beziehung}"), "keine Beziehung"],
          "qcq": ["key colored", "allg", this.insertCmd("\\text{allgemein}"), "allgemein"],
          "iso": ["key colored", "gl-sch", this.insertCmd("\\text{gleichschenklig}"), "gleichschenklig"],
          "equi": ["key colored", "gl-seit", this.insertCmd("\\text{gleichseitig}"), "gleichseitig"],
          "rect": ["key colored", "re-w", this.insertCmd("\\text{rechtwinklig}"), "rechtwinklig"],
          "rec&iso": ["key colored", "re+gs", this.insertCmd("\\text{rechtwinklig-gleichschenklig}"), "rechtwinklig und gleichschenklig"],
          "qdqcq": ["key colored", "Vier", this.insertCmd("\\text{allgemeines Viereck}"), "allgemeines Viereck"],
          "paral": ["key colored", "Para", this.insertCmd("\\text{Parallelogramm}"), "Parallelogramm"],
          "losg": ["key colored", "Raute", this.insertCmd("\\text{Raute}"), "Raute"],
          "carr": ["key colored", "Quadr", this.insertCmd("\\text{Quadrat}"), "Quadrat"],
          "rchk": ["key colored", "Recht", this.insertCmd("\\text{Rechteck}"), "Rechteck"],
          "arth": ["key colored", "arith", this.insertCmd("\\text{arithmetisch}"), "arithmetische Folge"],
          "geom": ["key colored", "geom", this.insertCmd("\\text{geometrisch}"), "geometrische Folge"],
          "kLsg": ["key colored", "keine", this.insertCmd("\\text{keine Lösung}"), "keine Lösung"],
          "uvLsg": ["key colored", "∞ Lsg", this.insertCmd("\\text{unendlich viele Lösungen}"), "unendlich viele Lösungen"],
          "nent": ["key colored", "n. ent", this.insertCmd("\\text{nicht entscheidbar}"), "nicht entscheidbar"],
          "benach": ["key colored", "benach", this.insertCmd("\\text{benachbart}"), "benachbart"],
            "vec": ["key colored", "→", this.insertCmd("\\vec{#0}"), "Vektor"],
            "o": ["key colored", "Ja", this.insertCmd("\\text{ja}"), "ja"],
            "n": ["key colored", "Nein", this.insertCmd("\\text{nein}"), "nein"],
            "V": ["key colored", "W", this.insertCmd("\\text{wahr}"), "wahr"],
            "F": ["key colored", "F", this.insertCmd("\\text{falsch}"), "falsch"],
            "A": ["key colored", "lin", this.insertCmd("\\text{linear, nicht proportional}"), "linear, aber nicht proportional"],
            "L": ["key colored", "prop", this.insertCmd("\\text{proportional}"), "proportional"],
            "lt": ["key colored", "L", this.insertCmd("\\text{ L}"), "Liter"],
            "ml": ["key colored", "mL", this.insertCmd("\\text{ mL}"), "Milliliter"],
            "cl": ["key colored", "cL", this.insertCmd("\\text{ cL}"), "Zentiliter"],
            "dl": ["key colored", "dL", this.insertCmd("\\text{ dL}"), "Deziliter"],
            "dal": ["key colored", "daL", this.insertCmd("\\text{ daL}"), "Dekaliter"],
            "hl": ["key colored", "hL", this.insertCmd("\\text{ hL}"), "Hektoliter"],
            "kl": ["key colored", "kL", this.insertCmd("\\text{ kL}"), "Kiloliter"],
            "mt": ["key colored", "m", this.insertCmd("\\text{ m}"), "Meter"],
            "mm": ["key colored", "mm", this.insertCmd("\\text{ mm}"), "Millimeter"],
            "cm": ["key colored", "cm", this.insertCmd("\\text{ cm}"), "Zentimeter"],
            "dm": ["key colored", "dm", this.insertCmd("\\text{ dm}"), "Dezimeter"],
            "km": ["key colored", "km", this.insertCmd("\\text{ km}"), "Kilometer"],
            "hm": ["key colored", "hm", this.insertCmd("\\text{ hm}"), "Hektometer"],
            "dam": ["key colored", "dam", this.insertCmd("\\text{ dam}"), "Dekameter"],
            "gr": ["key colored", "g", this.insertCmd("\\text{ g}"), "Gramm"],
            "mg": ["key colored", "mg", this.insertCmd("\\text{ mg}"), "Milligramm"],
            "cg": ["key colored", "cg", this.insertCmd("\\text{ cg}"), "Zentigramm"],
            "dg": ["key colored", "dg", this.insertCmd("\\text{ dg}"), "Dezigramm"],
            "kg": ["key colored", "kg", this.insertCmd("\\text{ kg}"), "Kilogramm"],
            "hg": ["key colored", "hg", this.insertCmd("\\text{ hg}"), "Hektogramm"],
            "dag": ["key colored", "dag", this.insertCmd("\\text{ dag}"), "Dekagramm"],
            "qt": ["key colored", "dt", this.insertCmd("\\text{ dt}"), "Doppelzentner"],
            "tn": ["key colored", "t", this.insertCmd("\\text{ t}"), "Tonne"],
            "%": ["key colored", "%", this.insertCmd("\\%"), "Prozent"],
            "Ø": ["key colored", "Ø", this.insertCmd("\\empty"), "leere Menge"],
            "hr": ["key colored", "h", this.insertCmd("\\text{ h}"), "Stunden"],
            "mn": ["key colored", "min", this.insertCmd("\\text{ min}"), "Minuten"],
            "sc": ["key colored", "s", this.insertCmd("\\text{ s}"), "Sekunden"],
            "jr": ["key colored", "d", this.insertCmd("\\text{ d}"), "Tage"],
            "sm": ["key colored", "Wo", this.insertCmd("\\text{ Wo.}"), "Wochen"],
            "an": ["key colored", "a", this.insertCmd("\\text{ a}"), "Jahre"],
            "scl": ["key colored", "Jh", this.insertCmd("\\text{ Jh.}"), "Jahrhunderte"],
            "1/2h": ["key colored", "½", this.insertCmd("\\text{halbe Stunde}"), "halbe Stunde"],
            "3/4h": ["key colored", "¾", this.insertCmd("\\text{Dreiviertelstunde}"), "Dreiviertelstunde"],
            "1/4h": ["key colored", "¼", this.insertCmd("\\text{Viertelstunde}"), "Viertelstunde"],
          "le1/4": ["key colored", "¼", this.insertCmd("\\text{ein Viertel}"), "ein Viertel"],
          "moit": ["key colored", "Hälfte", this.insertCmd("\\text{die Hälfte}"), "die Hälfte"],
          "dbl": ["key colored", "Dopp", this.insertCmd("\\text{das Doppelte}"), "das Doppelte"],
          "tiers": ["key colored", "Drittel", this.insertCmd("\\text{ein Drittel}"), "ein Drittel"],
          "trpl": ["key colored", "Dreif", this.insertCmd("\\text{das Dreifache}"), "das Dreifache"],
          "qrt": ["key colored", "Viertel", this.insertCmd("\\text{ein Viertel}"), "ein Viertel"],
            "qdpl": ["key colored", "Vierf", this.insertCmd("\\text{das Vierfache}"), "das Vierfache"],
        };
        // touches à insertion littérale directe (pas de mise en forme LaTeX)
        for(const ch of ["a","b","c","d","e","i","q","t",":",";","|","u","v","w","x","y","z","€","<",">","=","+","°","'"]){
            this.keyConf[ch] = ["key times colored", ch, this.insertCmd(ch), undefined];
        }
        this.targetField = target;
        this.sliderId = sliderId;
        this.container = displayContener;
        try{
            if(keys === undefined){
                this.defaut();
            } else {
                this.create(keys);
            }
            if(keyboardId !== undefined){
                this.content.id = keyboardId;
            }
            this.wrap(keyboardId);
            displayContener.appendChild(this.frame);
            keyBoard.instances.push(this);
            // état commun à tous les claviers, mémorisé d'une séance à l'autre
            this.setState(keyBoard.state, false);
            this.watchFocus();
            this.watchSize();
            keyBoard.watchEscape();
        } catch(err){
            console.log("Fehler beim Erzeugen der Tastatur "+keyboardId+"\n"+ err);
        }
    }
    /**
     * Emballe la grille de touches dans un cadre escamotable, surmonté de sa
     * poignée : replié, seule la poignée dépasse du bas de la diapo.
     * @param {String} keyboardId identifiant de la grille de touches
     */
    wrap(keyboardId){
        this.frame = utils.create("div",{className:"kb"});
        this.frame.setAttribute("role","group");
        this.frame.setAttribute("aria-label","Mathe-Tastatur");
        this.bar = utils.create("div",{className:"kb-bar"});
        this.smaller = this.barButton("kb-resize","−","Tastatur verkleinern",()=>keyBoard.scaleBy(-1));
        this.handle = utils.create("button",{
            type:"button",
            className:"kb-handle",
            innerHTML:keysSVG.chevronKey,
            title:"Tastatur ausblenden"
        });
        this.handle.setAttribute("aria-label","Tastatur ausblenden");
        this.handle.setAttribute("aria-expanded","true");
        if(keyboardId !== undefined)
            this.handle.setAttribute("aria-controls",keyboardId);
        // au clavier physique, Entrée/Espace sur la poignée (detail à 0)
        this.handle.addEventListener("click",(event)=>{
            if(event.detail === 0) keyBoard.toggleAll(this);
        });
        this.bigger = this.barButton("kb-resize","+","Tastatur vergrößern",()=>keyBoard.scaleBy(1));
        this.bar.appendChild(this.smaller);
        this.bar.appendChild(this.handle);
        this.bar.appendChild(this.bigger);
        this.frame.appendChild(this.bar);
        this.frame.appendChild(this.content);
        this.bindBarGestures();
        this.applyAnchor();
        this.setScale(keyBoard.scale);
    }
    /**
     * Gestes sur la barre : appui simple pour replier/déplier, glissement vers
     * le bas ou vers le haut pour fermer ou ouvrir, glissement latéral pour
     * coller le clavier à gauche, au centre ou à droite (dégager une figure).
     * Les boutons − / + gardent leur propre rôle.
     */
    bindBarGestures(){
        let start = null;
        this.bar.addEventListener("pointerdown",(event)=>{
            if(event.target.closest(".kb-resize") !== null) return;
            event.preventDefault();
            start = {x:event.clientX,y:event.clientY};
            this.bar.setPointerCapture?.(event.pointerId);
        });
        this.bar.addEventListener("pointerup",(event)=>{
            if(start === null) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            start = null;
            if(Math.abs(dx) < KB_GESTURE_MIN && Math.abs(dy) < KB_GESTURE_MIN){
                keyBoard.toggleAll(this);
            } else if(Math.abs(dy) >= Math.abs(dx)){
                keyBoard.setAll(dy > 0 ? "collapsed" : "open");
            } else {
                keyBoard.moveAnchor(dx > 0 ? 1 : -1);
            }
        });
        this.bar.addEventListener("pointercancel",()=>{start = null;});
    }
    /**
     * En mode automatique, le clavier suit le champ de réponse : il s'ouvre
     * quand l'élève y place le curseur et se replie quand il le quitte.
     */
    watchFocus(){
        if(this.targetField?.addEventListener === undefined) return;
        this.targetField.addEventListener("focusin",()=>{
            if(keyBoard.state === "auto") this.applyVisual("open");
        });
        this.targetField.addEventListener("focusout",()=>{
            if(keyBoard.state === "auto") this.applyVisual("collapsed");
        });
    }
    /**
     * Colle le clavier du côté choisi.
     */
    applyAnchor(){
        if(this.frame === undefined) return;
        this.frame.dataset.anchor = keyBoard.anchor;
    }
    /**
     * Bouton de la barre de contrôle (réduire / agrandir).
     * @param {String} className classe de la touche
     * @param {String} display contenu affiché
     * @param {String} label libellé lu par les lecteurs d'écran
     * @param {function} afunction ()=>{} à éxécuter à l'appui
     * @returns {DOMelt} le bouton
     */
    barButton(className,display,label,afunction){
        const btn = utils.create("button",{type:"button",className:className,innerHTML:display,title:label});
        btn.setAttribute("aria-label",label);
        btn.addEventListener("pointerdown",(event)=>{
            event.preventDefault();
            afunction();
        });
        return btn;
    }
    /**
     * Applique le facteur de taille des touches.
     * @param {Number} scale facteur multiplicatif de la taille de référence
     */
    setScale(scale){
        if(this.frame === undefined) return;
        this.frame.style.setProperty("--kb-scale",scale);
        this.updateHeight();
    }
    /**
     * Applique l'état demandé.
     * @param {String} state "auto" (le clavier suit le champ de réponse),
     *                       "open" ou "collapsed" (choix explicite du prof)
     * @param {Boolean} persist mémoriser le choix dans le navigateur
     */
    setState(state="auto", persist=true){
        if(this.frame === undefined) return;
        if(state === "auto"){
            // tant que personne n'a réglé le clavier à la main, il reste replié
            // et ne s'ouvre qu'au moment où le champ reçoit le curseur
            this.applyVisual(this.hasFocus() ? "open" : "collapsed");
        } else {
            this.applyVisual(state);
        }
        if(persist){
            keyBoard.state = state;
            keyBoard.safeSet(KB_STORAGE_KEY,state);
        }
    }
    /**
     * Ouvre ou replie le clavier à l'écran, sans toucher au mode mémorisé.
     * @param {String} visual "open" ou "collapsed"
     */
    applyVisual(visual){
        if(this.frame === undefined) return;
        const collapsed = visual === "collapsed";
        this.frame.dataset.state = collapsed ? "collapsed" : "open";
        this.handle.setAttribute("aria-expanded",collapsed ? "false" : "true");
        const label = collapsed ? "Tastatur einblenden" : "Tastatur ausblenden";
        this.handle.title = label;
        this.handle.setAttribute("aria-label",label);
        this.updateHeight();
    }
    /**
     * @returns {Boolean} le champ de réponse a-t-il le curseur ?
     */
    hasFocus(){
        return this.targetField !== undefined && document.activeElement === this.targetField;
    }
    show(){
        keyBoard.setAll("open");
    }
    hide(){
        keyBoard.setAll("collapsed");
    }
    toggle(){
        keyBoard.toggleAll(this);
    }
    /**
     * Écrit sur le conteneur la hauteur réellement occupée par le clavier.
     * La feuille de style s'en sert (padding-bottom) pour que le contenu de la
     * diapo ne passe pas sous les touches — et récupère la place au repli.
     */
    updateHeight(){
        if(this.frame === undefined || this.container === undefined) return;
        const height = this.frame.dataset.state === "collapsed"
            ? this.bar.offsetHeight
            : this.frame.offsetHeight;
        this.container.style.setProperty("--kb-h",(height + 12)+"px");
    }
    /**
     * La hauteur du clavier dépend de la taille de la fenêtre : on la resuit.
     */
    watchSize(){
        if(typeof ResizeObserver === "undefined") return;
        this.sizeObserver = new ResizeObserver(()=>this.updateHeight());
        this.sizeObserver.observe(this.frame);
    }
    /**
     * Change la taille de tous les claviers d'un cran et mémorise le choix.
     * @param {Number} steps nombre de crans (négatif pour réduire)
     */
    static scaleBy(steps){
        const scale = Math.min(KB_SCALE_MAX,
            Math.max(KB_SCALE_MIN,
                Math.round((keyBoard.scale + steps * KB_SCALE_STEP) * 100) / 100));
        if(scale === keyBoard.scale) return;
        keyBoard.scale = scale;
        keyBoard.liveInstances().forEach(kb=>kb.setScale(scale));
        keyBoard.safeSet(KB_SCALE_KEY,String(scale));
    }
    /**
     * @returns {Number} facteur de taille mémorisé, 1 par défaut
     */
    static storedScale(){
        const scale = Number(keyBoard.safeGet(KB_SCALE_KEY));
        if(!scale) return 1;
        return Math.min(KB_SCALE_MAX,Math.max(KB_SCALE_MIN,scale));
    }
    /**
     * @returns {String} état mémorisé : "open", "collapsed", ou "auto" tant que
     *          le prof n'a pas replié ou déplié le clavier lui-même
     */
    static storedState(){
        const state = keyBoard.safeGet(KB_STORAGE_KEY);
        return state === "collapsed" || state === "open" ? state : "auto";
    }
    /**
     * @returns {String} côté d'ancrage mémorisé, "center" par défaut
     */
    static storedAnchor(){
        const anchor = keyBoard.safeGet(KB_ANCHOR_KEY);
        return KB_ANCHORS.indexOf(anchor) > -1 ? anchor : "center";
    }
    /**
     * Tous les claviers de la page partagent le même état : replier celui d'une
     * diapo replie aussi ceux des diapos suivantes et des autres sliders. Le
     * choix est explicite, il met donc fin au mode automatique.
     * @param {String} state "open" ou "collapsed"
     */
    static setAll(state){
        keyBoard.state = state;
        keyBoard.liveInstances().forEach(kb=>kb.setState(state,false));
        keyBoard.safeSet(KB_STORAGE_KEY,state);
    }
    /**
     * @param {keyBoard} from clavier sur lequel l'appui a eu lieu : c'est son
     *        état affiché qui décide du sens de la bascule
     */
    static toggleAll(from){
        const collapsed = from?.frame?.dataset.state === "collapsed";
        keyBoard.setAll(collapsed ? "open" : "collapsed");
    }
    /**
     * Déplace tous les claviers d'un cran vers la gauche ou vers la droite.
     * @param {Number} dir -1 vers la gauche, 1 vers la droite
     */
    static moveAnchor(dir){
        const next = KB_ANCHORS[Math.min(KB_ANCHORS.length - 1,
            Math.max(0,KB_ANCHORS.indexOf(keyBoard.anchor) + dir))];
        if(next === keyBoard.anchor) return;
        keyBoard.anchor = next;
        keyBoard.liveInstances().forEach(kb=>kb.applyAnchor());
        keyBoard.safeSet(KB_ANCHOR_KEY,next);
    }
    /**
     * @returns {keyBoard[]} claviers encore présents dans la page ; oublie au
     *          passage ceux des diaporamas/diapos déjà remplacés
     */
    static liveInstances(){
        keyBoard.instances = keyBoard.instances.filter(kb=>kb.frame?.isConnected);
        return keyBoard.instances;
    }
    /**
     * @param {String} key clé de stockage
     * @returns {String|null} valeur mémorisée, ou null si indisponible
     */
    static safeGet(key){
        try{
            return window.localStorage.getItem(key);
        } catch(err){
            // navigation privée ou stockage refusé : pas de valeur mémorisée
            return null;
        }
    }
    /**
     * @param {String} key clé de stockage
     * @param {String} value valeur à mémoriser
     */
    static safeSet(key,value){
        try{
            window.localStorage.setItem(key,value);
        } catch(err){
            // navigation privée ou stockage refusé : la valeur vaut pour la séance
        }
    }
    /**
     * Échap replie les claviers. Écouteur unique pour toute la page.
     */
    static watchEscape(){
        if(keyBoard.escapeBound) return;
        keyBoard.escapeBound = true;
        document.addEventListener("keydown",(event)=>{
            if(event.key === "Escape") keyBoard.setAll("collapsed");
        });
    }
    /**
     * give the focus to the target if only one player
     */
    focus(){
        if(this.nbOfSliders < 2)
            this.targetField.focus();
    }
    /**
     * Fabrique le gestionnaire d'appui d'une touche : insère `cmd` dans le
     * champ cible puis lui rend le focus.
     * @param {String} cmd contenu à insérer (texte ou LaTeX)
     * @param {Object} [opts] options passées à executeCommand (ex. {format:"latex"})
     * @returns {function} gestionnaire ()=>{} à passer à bindKey
     */
    insertCmd(cmd, opts){
        return () => {
            this.targetField.executeCommand(opts ? ["insert", cmd, opts] : ["insert", cmd]);
            this.focus();
        };
    }
    /**
     * Branche l'appui sur une touche.
     * On écoute pointerdown (souris, stylet et tactile à la fois) : pas de délai
     * de 300 ms au doigt, et le preventDefault évite que la touche vole le focus
     * du champ MathLive. La classe "pressed" assure le retour visuel, que
     * :active ne garantit plus dès lors que l'événement est annulé.
     * @param {DOMelt} elm la touche
     * @param {function} afunction ()=>{} à éxécuter à l'appui de la touche
     */
    bindKey(elm, afunction){
        elm.addEventListener("pointerdown",(event)=>{
            event.preventDefault();
            elm.classList.add("pressed");
            afunction();
        });
        // pointerdown est annulé, donc Entrée et Espace sur une touche au clavier
        // ne produisent qu'un click sans pointeur (detail à 0) : on le traite ici.
        elm.addEventListener("click",(event)=>{
            if(event.detail === 0) afunction();
        });
        const release = ()=>elm.classList.remove("pressed");
        elm.addEventListener("pointerup",release);
        elm.addEventListener("pointercancel",release);
        elm.addEventListener("pointerleave",release);
    }
    /**
     * Crée une touche. C'est un vrai <button> : atteignable au clavier, annoncé
     * comme touche par les lecteurs d'écran. Les cases vides de la grille
     * restent de simples <div>, retirés de l'arbre d'accessibilité.
     * @param {String} className liste des classes de la touche
     * @param {String} display html à afficher sur la touche
     * @param {function} afunction ()=>{} à éxécuter à l'appui de la touche
     * @param {String} label libellé lu par les lecteurs d'écran, si le contenu
     *                       affiché ne suffit pas (pictogramme, abréviation)
     * @returns {DOMelt} la touche créée
     */
    addKey(className,display=undefined,afunction,label=undefined){
        let elm;
        if(display === undefined){
          if (className === "_") {
            elm = utils.create("div");
            elm.setAttribute("aria-hidden", "true");
            this.content.appendChild(elm);
            return elm;
          } else {
                elm = this.keyElement(this.keyConf[className][0],this.keyConf[className][1],this.keyConf[className][3]);
                this.bindKey(elm,this.keyConf[className][2]);
            }
        } else {
            elm = this.keyElement(className,display,label);
            try {
                this.bindKey(elm,afunction);
            } catch (err){
                console.log("Fehler beim Erzeugen einer Taste\n"+err)
            }
        }
        this.content.appendChild(elm);
        return elm;
    }
    /**
     * @param {String} className liste des classes de la touche
     * @param {String} display html à afficher sur la touche
     * @param {String} label libellé pour les lecteurs d'écran
     * @returns {DOMelt} le bouton de la touche
     */
    keyElement(className,display,label){
        const elm = utils.create("button",{type:"button",className:className,innerHTML:display});
        if(label !== undefined){
            elm.setAttribute("aria-label",label);
            elm.title = label;
        }
        return elm;
    }
    /**
     * Ajoute une ligne de touches d'insertion littérale (chiffres, lettres).
     * @param {String[]} chars valeurs à insérer, une touche par valeur
     * @param {String} className classe commune des touches
     */
    insertRow(chars,className="key"){
        chars.forEach(val=>this.addKey(className,val,this.insertCmd(val)));
    }
    /** touche « effacer » */
    addBackspaceKey(className="key colored"){
        this.addKey(className,keysSVG.backspaceKey,()=>{this.targetField.executeCommand("deleteBackward");this.focus();},"Löschen");
    }
    /** touche « valider » : complète le champ puis simule un Entrée */
    addEnterKey(className="key colored"){
        this.addKey(className,keysSVG.enterKey,()=>{
            this.targetField.executeCommand("complete");
            this.targetField.dispatchEvent(new KeyboardEvent("keyup",{"key":"Enter"}));
        },"Prüfen");
    }
    /** touche « annuler » */
    addUndoKey(className="key action"){
        this.addKey(className,keysSVG.undoKey,()=>{this.targetField.executeCommand("undo");this.focus();},"Rückgängig");
    }
    /** touche « refaire » */
    addRedoKey(className="key action"){
        this.addKey(className,keysSVG.redoKey,()=>{this.targetField.executeCommand("redo");this.focus();},"Wiederholen");
    }
    /** touche « reculer d'un caractère » */
    addLeftArrowKey(className="key action"){
        this.addKey(className,keysSVG.leftArrowKey,()=>{this.targetField.executeCommand("moveToPreviousChar");this.focus();},"ein Zeichen nach links");
    }
    /** touche « avancer d'un caractère » */
    addRightArrowKey(className="key action"){
        this.addKey(className,keysSVG.rightArrowKey,()=>{this.targetField.executeCommand("moveToNextChar");this.focus();},"ein Zeichen nach rechts");
    }
    create(config=[]){
        if(config === "alphabetique" || config[0] === "alphabetique"){
          this.content = utils.create("div", { className: "alphakey-base" });
          if (Array.isArray(config) && config[1] === "math") {
            ["(", "[", "/", "*", "-", "+", "=", "^"].forEach(val => {
              this.addKey(val);
            });
            this.addLeftArrowKey("key colored");
            this.addRightArrowKey("key colored");
          } else if (Array.isArray(config[1])) {
            config[1].forEach(val => {
              this.addKey(val);
            })
            const touchesvides = 10 - config[1].length;
            for (let i = 0; i < touchesvides; i++) {
              this.addKey("_");
            }
          } else {
            this.insertRow(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],"key colored");
          }
            this.insertRow(["Q","W","E","R","T","Z","U","I","O","P"]);
            this.insertRow(["A","S","D","F","G","H","J","K","L",";"]);
            this.insertRow(["Y","X","C","V","B","N","M",","]);
            this.addBackspaceKey("key colored");
            this.addEnterKey("key colored");

        } else if (config === 'numerique') {
          this.content = utils.create("div", { className: "numkey-simple" });
          this.insertRow(["7", "8", "9"]);
          this.addBackspaceKey("key backspace");
          this.insertRow(["4", "5", "6"]);
          this.addEnterKey("key enter");
          this.insertRow(["1","2","3"]);
          this.addKey("key zero","0",this.insertCmd("0"));
          this.addKey("key",",",this.insertCmd("."),"Komma");
        } else {
            this.content = utils.create("div",{className:"numkey-base"});
            /** Première ligne */
            this.insertRow(["7","8","9"]);
            // touche diviser
            this.addKey(config[0] !== undefined ? config[0] : "÷");
            this.addBackspaceKey("key backspace");
            // trou
            this.addKey("_");
            // touche parenthèses
            this.addKey(config[4] !== undefined ? config[4] : "(");
            // touche lettre x
            this.addKey(config[5] !== undefined ? config[5] : "x");
            /** Deuxième ligne */
            this.insertRow(["4","5","6"]);
            // touche multiplier
            this.addKey(config[1] !== undefined ? config[1] : "×");
            this.addEnterKey("key enter");
            // trou
            this.addKey("_");
            // touche carré
            this.addKey(config[6] !== undefined ? config[6] : "x²");
            // touche racine
            this.addKey(config[7] !== undefined ? config[7] : "√");
            /** Troisième ligne */
            this.insertRow(["1","2","3"]);
            // touche moins
            this.addKey(config[2] !== undefined ? config[2] : "-");
            // trou
            this.addKey("_");
            this.addUndoKey();
            // touche refaire
            if(config[8]!==undefined)
                this.addKey(config[8]);
            else this.addRedoKey();
            /** Quatrième ligne */
            this.addKey("key zero","0",this.insertCmd("0"));
            this.addKey("key",",",this.insertCmd("."),"Komma");
            // touche plus
            this.addKey(config[3] !== undefined ? config[3] : "+");
            // trou
            this.addKey("_");
            this.addLeftArrowKey();
            this.addRightArrowKey();
        }
    }
    /**
     * crée un clavier par défaut
     */
    defaut(){
        this.create();
    }
}
/** claviers présents dans la page, pour leur appliquer le même état */
keyBoard.instances = [];
/** état courant, partagé par tous les claviers */
keyBoard.state = keyBoard.storedState();
/** facteur de taille courant, partagé par tous les claviers */
keyBoard.scale = keyBoard.storedScale();
/** côté d'ancrage courant, partagé par tous les claviers */
keyBoard.anchor = keyBoard.storedAnchor();
