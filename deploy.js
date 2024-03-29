const fs = require("fs");

try {
  const outFile = "./dist/Zeitmessung.html";
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  let html = fs.readFileSync("./dist/timekeeping/index.html", "utf8");
  html = replaceWithInternalStyles(html);
  html = replaceWithInternalScript(html);

  fs.writeFileSync(outFile, html);
} catch (err) {
  console.error(err);
}

function replaceWithInternalStyles(html) {
  let styles = fs.readFileSync("./dist/timekeeping/styles.css", "utf8");
  styles = `<style>${styles}</style>`;
  html = html.replace(/<link.*stylesheet.*<\/noscript>/, "");
  html = html.replace(/<style>.*<\/style>/, styles);
  return html;
}

function replaceWithInternalScript(html) {
  html = html.replaceAll(/<script.*<\/script>/gi, "");
  let script = fs.readFileSync("./dist/timekeeping/bundle.js", "utf8");
  script = `<script>${script}</script>`;
  const indexOfHtmlEndTag = html.indexOf("</html>");
  html =
    html.substring(0, indexOfHtmlEndTag) +
    script +
    html.substring(indexOfHtmlEndTag);
  return html;
}
