// Node.js
// F8 pour lancer dans Visual Studio Code
// Analyse la structure et crée le fichier de référence aux exercices
// remplace le fichier scan.php
const fs = require("fs");
const path = require("path");
const yaml = require('js-yaml');

const listOfActivities = {};
const activities = {};
const { off } = require("process");
// MatheVomFranz : une activité est « nouvelle » si elle a été ajoutée au dépôt
// git depuis moins de 15 jours, et après l'import de MathsMentales (commit
// IMPORT_COMMIT) ; la date de création du fichier n'a pas de sens après un clone.
// Une activité pas encore versionnée est considérée comme nouvelle.
const IMPORT_COMMIT = "64a07c4";
const ajoutGit = {};
let dateImport = Infinity;
try {
  const { execSync } = require("child_process");
  dateImport = Number(execSync("git show -s --format=%ct " + IMPORT_COMMIT, { encoding: "utf8" })) * 1000;
  let date = 0;
  execSync("git log --diff-filter=A --name-only --format=@%ct --relative -- .", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split("\n").forEach(ligne => {
      if (ligne.startsWith("@")) date = Number(ligne.slice(1)) * 1000;
      else if (ligne) ajoutGit[path.basename(ligne)] ??= date; // log du plus récent au plus ancien : on garde le dernier ajout
    });
} catch (e) {
  console.log("git indisponible : aucune activité marquée comme nouvelle");
}
const getAllFiles = function(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
 
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      // on stocke la date de création du fichier
      arrayOfFiles.push([
                      file, // nom du fichier
                      path.join(__dirname, dirPath, "/", file), // chemin du fichier local
                      fs.statSync(dirPath + "/" + file).birthtime, // date de création du fichier
                      path.join(dirPath, "/", file) // chemin du fichier relatif
                    ])
    }
  })
  return arrayOfFiles
};
const structure = JSON.parse(fs.readFileSync("./structure.json"));
// initialisation du nombre de fichiers/activités
structure.activitiesNumber=0;
for (let niveau in structure){
  // initialisation du nombre d'activités par niveau.
  structure[niveau].activitiesNumber=0;
  for(let theme in structure[niveau].themes){
    for (let chapter in structure[niveau].themes[theme].chapitres){
      structure[niveau].themes[theme].chapitres[chapter] = {
        "n":structure[niveau].themes[theme].chapitres[chapter],//name
        e:[]};//exercices
    }
  }
}
// MatheVomFranz : on parcourt tous les dossiers N*, car une activité peut être
// rangée dans un dossier dont le niveau n'existe plus (école primaire retirée)
// tout en restant destinée à des niveaux conservés.
const dossiers = fs.readdirSync(".").filter(d => /^N/.test(d) && fs.statSync(d).isDirectory());
for (const dossier of dossiers){
  let now = new Date().getTime()-15*24*3600*1000;
  let listOfFiles = getAllFiles("./"+dossier);
  listOfFiles.forEach(function(fichierExo){
    let nouveau = false;
    let dt = ajoutGit[fichierExo[0]] ?? (dateImport === Infinity ? 0 : Date.now());
    if(dt > now && dt > dateImport){nouveau = true;console.log(fichierExo[0])}
    //console.log(fichierExo);
    let json
    const fileContent = fs.readFileSync(fichierExo[1])
    if (fichierExo[0].indexOf('.json')>-1)
      json = JSON.parse(fileContent);
    else if(fichierExo[0].indexOf('.yml')>-1) {
      json = yaml.load(fileContent)
    }
    const ID = fichierExo[0].replace('.json', '').replace('.yml','')
    listOfActivities[ID]=json;
    listOfActivities[ID].url = fichierExo[3]
    let exo = {"t":json.title+(json.speech?" 📣":"")};
    if(nouveau) exo.new = true;
    // descriptif
    if(json.description !== undefined){
      exo.d = json.description;
    }
    activities[ID] = exo;
    structure.activitiesNumber++;
    for(let i in json.dest){
      let codechap = json.dest[i];
      let destLevel = codechap.match(/(^\d+|T|G|K|H)/i)[0];
      let themecode = codechap.match(/^(\d+|T|G|K|H)[A-Z]/i)[0];
      if(structure[destLevel] !== undefined){
        structure[destLevel].activitiesNumber++;
        structure[destLevel].themes[themecode].chapitres[codechap].e.push(ID);
      }
    }
  })
}
// rangement alpha des exercices
for(const niveau in structure){
  for(const them in structure[niveau].themes){
    for (const chap in structure[niveau].themes[them].chapitres){
      if(structure[niveau].themes[them].chapitres[chap].e.length)
        structure[niveau].themes[them].chapitres[chap].e.sort((a,b)=>{
          return activities[a].t.localeCompare(activities[b].t, 'fr', { usage: 'sort'})
        })
    }
  }
}
// création d'un fichier html qui contient toutes les références aux exercices avec chacun un lien vers index.html?u=ID de l'exercice
fs.writeFileSync("../liste-des-exercices.html",
  "<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'><title>Liste des exercices</title></head><body><h1>Liste des activités MathsMentales</h1><ol>"+
  Object.keys(listOfActivities).map(
    id => `<li><a href='index.html?u=${id}'>${listOfActivities[id].title}</a></li>`
  ).join("")+
  "</ol></body></html>"
);
const dataActivities = {}
Object.keys(listOfActivities).forEach(id => {dataActivities[id]=listOfActivities[id].url});
fs.writeFileSync("../../src/js/mods/activitiesurl.js","export {activitiesURL as default};"+
"const activitiesURL="+JSON.stringify(dataActivities));
let data = JSON.stringify(structure);
fs.writeFileSync("../../src/js/mods/content.js",
  "export {content as default, activities};" +
  "const activities="+JSON.stringify(activities)+";" +
  "const content="+data);
