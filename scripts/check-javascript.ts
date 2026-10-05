import { readdirSync } from "node:fs";
import { join } from "node:path";

const exceptions = new Set(["public/theme-init.js"]);
const excludedDirectories = new Set([
  "node_modules",
  "dist",
  "storybook-static",
  "site-dist",
  ".git",
  "coverage",
  "test-results",
  "playwright-report",
  ".verification",
  ".claude",
]);
const files: string[] = [];
function collect(directory: string) {
  for (const entry of readdirSync(directory || ".", { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) collect(file);
    } else if (entry.isFile() && /\.(?:ts|tsx|js|mjs|cjs)$/.test(file)) {
      files.push(file);
    }
  }
}
collect("");
const errors = files.filter(
  (file) => /\.(?:js|mjs|cjs)$/.test(file) && !exceptions.has(file),
);
for (const file of errors)
  console.error(`Forbidden JavaScript: ${JSON.stringify(file)}`);
if (!files.length) console.error("No source files to check");
if (errors.length || !files.length) process.exitCode = 1;
else console.log(`JavaScript policy PASS (${files.length} source files)`);
