// Typographie française : espace insécable avant : ; ! ? » € et après «, uniquement dans les textes
// (chaînes et texte JSX), jamais dans le code. Usage : node scripts/typo-fr.mjs [--check]
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const NB = " ";
const check = process.argv.includes("--check");
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|mts)$/.test(f)) files.push(p); } })("src");
const fix = (t) => t
  .replace(/(\S)[ \t]+([:;!?»])(?=\s|$|["'`<)}.,]|$)/g, `$1${NB}$2`)
  .replace(/«[ \t]+/g, `«${NB}`)
  .replace(/(\d)[ \t]+(€|%)/g, `$1${NB}$2`);
let changed = 0, hits = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  const visit = (n) => {
    const k = n.kind;
    let start, end;
    if (k === ts.SyntaxKind.StringLiteral || k === ts.SyntaxKind.NoSubstitutionTemplateLiteral) { start = n.getStart(sf) + 1; end = n.getEnd() - 1; }
    else if (k === ts.SyntaxKind.TemplateHead || k === ts.SyntaxKind.TemplateMiddle) { start = n.getStart(sf) + 1; end = n.getEnd() - 2; }
    else if (k === ts.SyntaxKind.TemplateTail) { start = n.getStart(sf) + 1; end = n.getEnd() - 1; }
    else if (k === ts.SyntaxKind.JsxText) { start = n.getStart(sf); end = n.getEnd(); }
    if (start !== undefined) {
      // ignorer les imports, directives et noms de classes
      const p = n.parent;
      const skip = ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || (ts.isJsxAttribute(p) && /^(className|href|src|id|type|name|key|rel|target|d|viewBox|transform|style|sizes)$/.test(p.name.getText(sf))) || ts.isExpressionStatement(p);
      if (!skip) { const t = src.slice(start, end); const u = fix(t); if (u !== t) edits.push([start, end, u]); }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (edits.length) {
    hits += edits.length;
    if (check) { console.log(f, edits.length); continue; }
    let out = src;
    for (const [s, e, u] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, s) + u + out.slice(e);
    fs.writeFileSync(f, out); changed++;
  }
}
console.log(check ? `${hits} textes à corriger` : `${changed} fichiers corrigés (${hits} textes)`);
