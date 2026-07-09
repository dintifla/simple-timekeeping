import fs from "node:fs";

// Vite (with vite-plugin-singlefile) already emits a single self-contained
// index.html with all JS and CSS inlined. This script just renames it to the
// distributable file name.
const inFile = "./dist/app/index.html";
const outFile = "./dist/Zeitmessung.html";

try {
  if (!fs.existsSync(inFile)) {
    throw new Error(`Build output not found: ${inFile}. Run "npm run build" first.`);
  }
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  fs.copyFileSync(inFile, outFile);
  console.log(`Created ${outFile}`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
