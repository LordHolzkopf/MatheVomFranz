import CodeMirror from './libs/codemirror/codemirror.js'
import yaml from './libs/codemirror/addon/yaml.min.js'
import js from './libs/codemirror/addon/javascript.min.js'
import ylt from './libs/codemirror/addon/yaml-lint.min.js'
// MatheVomFranz : la classe dérivée de MM.js porte la méthode display()
import MM, { Activity as activity } from './mods/MM.js'
import utils from './mods/utils.js'
import library from './mods/library.js'
import jsYaml from './libs/js-yaml.mjs.js'

const activitiesIDs = []

MM.content = library.openContents();
for (const niv of Object.values(MM.content)){
    if(niv.themes === undefined) continue
    for(const theme of Object.values(niv.themes)){
        for(const chap of Object.values(theme.chapitres)){
            for (const id of Object.values(chap.e)){
                if(!activitiesIDs.includes(id)){
                    activitiesIDs.push(id)
                }
            }
        }
    }
}

let initialData = `title: Titel der Aufgabe
type: text oder latex
dest: [chap1, chap2, ...]
speech: 1 # die Fragen werden so vorgelesen, wie sie dastehen – außer Sie legen mit audio fest, was gelesen werden soll

consts: # global verwendete Konstanten.
# Achtung: Enthalten sie Variablen, müssen diese Variablen in allen Varianten (options) definiert sein
  name1: Werte
  name2: Werte
vars: # globale Variablen, in allen Varianten verfügbar
  v1: Wert
  v2: Wert
options:
  - name: ein Text, der die Variante beschreibt
    vars:
      v3: Wert # keine Namen verwenden, die schon bei den Konstanten oder globalen Variablen vorkommen
      v4: Wert
    question: ein Text oder eine Formel – das, was gefragt wird
    answer: :question übernimmt die Frage
    shortq: Kurzfassung der Frage
    audio: der Text zum Vorlesen, der die Frage wiedergibt
    value: der erwartete kurze Wert für die Gürtel oder die Online-Version. # fehlt er, wird vermutlich answer verwendet
`
function saveYaml() {
    const yamlString = source.getValue()
    localStorage.setItem('activityEditorYaml', yamlString)
}
function loadYaml() {
    const yamlString = localStorage.getItem('activityEditorYaml')
    if (yamlString){
       initialData = yamlString
       source.setValue(yamlString)
       parse()
    } else {
        source.setValue(initialData)
        parse()
    }
}

let timer
const source = CodeMirror.fromTextArea(document.getElementById('inputTextArea'), {
    lineNumbers: true,
    mode: 'yaml',
    lineWrapping: true
    }
)

loadYaml()

function parse() {
    const yamlSource = source.getValue()
    const jsonSource = jsYaml.load(yamlSource)
    const act = new activity(jsonSource)
    document.getElementById('errors').innerHTML = '';
    MM.editedActivity = act
    act.display('sample',MM)
    saveYaml()
}

document.getElementById('saveBtn').onclick = () => {
    const blob = new Blob([source.getValue()],{
        type: 'application/x-yaml;charset:utf-8'
    })
    const fileName = "activity.yml";
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // For IE
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        // For other browsers
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    saveYaml()
}
document.getElementById('testBtn').onclick = () => {
    parse()
}
document.getElementById('actIDImport').oninput = async (evt) => {
    const id = evt.target.value
    if (activitiesIDs.includes(id)){
        // on charge le json (library renvoie tjs un json)
        const activ = await library.load(id)
        // on convertit en yaml
        source.setValue(jsYaml.dump(activ[0]))
        saveYaml()
        try {
            const act = new activity(activ[0])
            MM.editedActivity = act
            act.display('sample',MM)
        }
        catch (err) {
            document.getElementById('activityTitle').innerHTML = "<span class='red'>Fehler im Code: </span>"+err
        }
    }
}
document.getElementById('randomBtn').onclick = async()=>{
    // set json
    const json = await library.load(activitiesIDs[Math.floor(Math.random()*activitiesIDs.length)])
    source.setValue(jsYaml.dump(json[0]))
    saveYaml()
    try {
        const act = new activity(json[0])
        MM.editedActivity = act
        act.display('sample',MM)
    } catch (err){
            document.getElementById('activityTitle').innerHTML = "<span class='red'>Fehler im Code: </span>"+err
    }
}
document.getElementById('openFileInput').onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let lasource
            if(e.target.result.indexOf('{')===0){
                const jsonContent = JSON.parse(e.target.result);
                lasource = jsYaml.dump(jsonContent)
            } else {
                lasource = e.target.result
            }
            source.setValue(lasource);
            saveYaml()
            try{
                const act = new activity(lasource)
                MM.editedActivity = act
                act.display('sample',MM)
            }catch(err){
                document.getElementById('activityTitle').innerHTML = "<span class='red'>Fehler im Code: </span>"+err
            }
        } catch (error) {
            utils.debug("Error parsing Yaml: ", error);
        }
    };
    reader.readAsText(file);
};