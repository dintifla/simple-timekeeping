const fs = require("fs");

const inDir = "./dist/timekeeping/browser";

try {
  const outFile = "./dist/Zeitmessung.html";
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  let html = fs.readFileSync(`${inDir}/index.html`, "utf8");

  html = removeFavicon(html);
  html = replaceWithInternalStyles(html);
  html = replaceWithInternalScript(html);

  fs.writeFileSync(outFile, html);
} catch (err) {
  console.error(err);
}

function removeFavicon(html) {
  return html.replace(/<link.*icon.*>/, "");
}

function replaceWithInternalStyles(html) {
  let styles = fs.readFileSync(`${inDir}/styles.css`, "utf8");
  styles = `<style>${styles}</style>`;
  html = html.replace(/<link.*stylesheet.*<\/noscript>/, "");
  html = html.replace(/<link.*stylesheet.*>/, "");
  html = html.replace(/<style>.*<\/style>/, styles);
  return html;
}

function replaceWithInternalScript(html) {
  html = html.replaceAll(/<script.*<\/script>/gi, "");
  const scriptFiles = ["polyfills.js", "main.js"];
  const scripts = [];
  for (const scriptFile of scriptFiles) {
    let script = fs.readFileSync(`${inDir}/${scriptFile}`, "utf8");
    script = `<script type="module">${script}</script>`;
    scripts.push(script);
  }
  const indexOfHtmlEndTag = html.indexOf("</html>");
  html =
    html.substring(0, indexOfHtmlEndTag) +
    scripts.join("") +
    html.substring(indexOfHtmlEndTag);
  return html;
}
