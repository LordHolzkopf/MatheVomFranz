// Lädt Seiten im Browser und meldet JavaScript-Fehler, Konsolenfehler und
// fehlende Dateien (HTTP >= 400). Optional mit Screenshot.
// Aufruf: node tools/pagecheck.cjs [--shots=ORDNER] URL [URL …]
// Benötigt Playwright (in der Cloud-Umgebung vorinstalliert).
const { chromium } = require("playwright");

(async () => {
  const args = process.argv.slice(2);
  const shots = (args.find((a) => a.startsWith("--shots=")) || "").slice(8);
  const urls = args.filter((a) => !a.startsWith("--"));
  const browser = await chromium.launch();
  let total = 0;
  for (const [i, url] of urls.entries()) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const problems = [];
    page.on("pageerror", (e) => problems.push("JS-Fehler: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") problems.push("Konsole: " + m.text()); });
    page.on("response", (r) => { if (r.status() >= 400) problems.push("HTTP " + r.status() + ": " + r.url()); });
    page.on("dialog", (d) => { problems.push("Dialog: " + d.message()); d.dismiss(); });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      problems.push("Laden fehlgeschlagen: " + e.message);
    }
    if (shots) await page.screenshot({ path: `${shots}/seite${i + 1}.png`, fullPage: true }).catch(() => {});
    console.log((problems.length ? "✗ " : "✓ ") + url);
    problems.forEach((p) => console.log("    " + p));
    total += problems.length;
    await page.close();
  }
  await browser.close();
  process.exit(total ? 1 : 0);
})();
