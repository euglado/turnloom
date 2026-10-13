import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const allowed = new Set(["MIT", "Apache-2.0", "0BSD", "MIT OR Apache-2.0"]);
const entries = Object.entries(lock.packages).filter(([name]) => name);
for (const [name, data] of entries) {
  assert.ok(allowed.has(data.license), `Unreviewed license: ${name}`);
  assert.match(data.integrity ?? "", /^sha512-/u, `Missing integrity: ${name}`);
  assert.ok(data.resolved?.startsWith("https://registry.npmjs.org/"), `Unreviewed source: ${name}`);
}
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }))
  assert.match(version, /^\d+\.\d+\.\d+$/u, `Unpinned dependency: ${name}`);
const inventory =
  "# Dependency license inventory\n\nGenerated from package-lock.json. Dependencies are installed separately, not vendored.\nTheir complete copyright/license notices remain in the installed packages.\n\n" +
  entries
    .map(
      ([name, data]) =>
        `- ${name.replace(/^node_modules\//u, "")} ${data.version}: ${data.license}`,
    )
    .join("\n") +
  "\n";
if (process.argv.includes("--write")) writeFileSync("DEPENDENCIES.md", inventory);
assert.equal(
  readFileSync("DEPENDENCIES.md", "utf8"),
  inventory,
  "Regenerate inventory: node scripts/check-supply.mjs --write",
);
let count = 0;
const secretPatterns = [
  /mfa\.[\w-]{60,}/u,
  /[\w-]{23,28}\.[\w-]{6}\.[\w-]{27,}/u,
  /AKIA[A-Z0-9]{16}/u,
  new RegExp(["-----BEGIN", "(?:RSA |OPENSSH |EC )?PRIVATE KEY-----"].join(" "), "u"),
  /(?:ghp|github_pat)_[A-Za-z0-9_]{30,}/u,
];
function scan(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) {
      scan(file);
      continue;
    }
    assert.ok(
      !(item.name.startsWith(".env") && item.name !== ".env.example"),
      "Private configuration exists in scanned source; run checks in a clean checkout without .env",
    );
    assert.ok(!/\.(?:pem|key|p12)$/iu.test(item.name), `Key file in source: ${file}`);
    const content = readFileSync(file, "utf8");
    for (const pattern of secretPatterns)
      assert.ok(!pattern.test(content), `Potential credential pattern: ${file}`);
    if (file.includes(`${path.sep}workflows${path.sep}`)) {
      for (const match of content.matchAll(/uses:\s*([^\s]+)/gu))
        assert.match(match[1], /^[\w./-]+@[a-f0-9]{40}$/u, "Unpinned CI action");
    }
    count++;
  }
}
scan(".");
console.log(
  `License/source/integrity review: ${entries.length} packages; credential-pattern/source scan: ${count} files passed. Pattern scanning is not a guarantee of absence.`,
);
