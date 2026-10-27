import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { register } from "node:module";

// src/js/libs n'est pas versionné : sans les bibliothèques (Compute Engine,
// MathLive, KaTeX…), analysereponse.js ne peut pas être importé. Les branches
// « liste » testées ici n'utilisent ni le Compute Engine ni MMmath, on remplace
// donc ces deux dépendances par des modules vides.
const computeEngine = new URL("../libs/compute-engine/compute-engine.esm.js", import.meta.url);
if (!existsSync(computeEngine)) {
  const hooks = `
    const stubs = {
      ${JSON.stringify(computeEngine.href)}: "export class ComputeEngine {}",
      ${JSON.stringify(new URL("./math.js", import.meta.url).href)}: "export default {}",
    };
    export async function load(url, context, nextLoad) {
      if (url in stubs) return { format: "module", source: stubs[url], shortCircuit: true };
      return nextLoad(url, context);
    }
    export async function resolve(specifier, context, nextResolve) {
      const url = new URL(specifier, context.parentURL).href;
      if (url in stubs) return { url, shortCircuit: true };
      return nextResolve(specifier, context);
    }`;
  register("data:text/javascript," + encodeURIComponent(hooks));
}

const { default: analyseReponse } = await import("./analysereponse.js");

// replaceVars (activity.js) transforme une valeur "8" en nombre 8
test("liste: goodAnswer numérique ne plante pas", () => {
  assert.equal(analyseReponse(8, "8", "liste"), true);
  assert.equal(analyseReponse(8, "9", "liste"), false);
  assert.equal(analyseReponse(8, 8, "liste"), true);
});

test("listeOrdonnee: goodAnswer numérique ne plante pas", () => {
  assert.equal(analyseReponse(8, "8", "listeOrdonnee"), true);
  assert.equal(analyseReponse(8, "9", "listeOrdonnee"), false);
  assert.equal(analyseReponse(8, 8, "listeOrdonnee"), true);
});

test("liste: ordre et espaces indifférents", () => {
  assert.equal(analyseReponse("2;3", "3; 2", "liste"), true);
  assert.equal(analyseReponse("2;3", "2;4", "liste"), false);
});

test("listeOrdonnee: espaces indifférents, ordre imposé", () => {
  assert.equal(analyseReponse("2;3", "2; 3", "listeOrdonnee"), true);
  assert.equal(analyseReponse("2; 3", "2;3", "listeOrdonnee"), true);
  assert.equal(analyseReponse("2;3", "3;2", "listeOrdonnee"), false);
});
