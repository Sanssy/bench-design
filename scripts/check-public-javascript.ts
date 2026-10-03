import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function checkPublicJavaScript(root: string) {
  const files = readdirSync(root, {
    recursive: true,
    encoding: "utf8",
  }).filter((file) => file.endsWith(".js"));
  assert(files.length > 0, "published JavaScript is missing");
  for (const file of files) {
    assert.doesNotMatch(
      readFileSync(join(root, file), "utf8"),
      /rolldown\/runtime\.js|Calling `require`|node_modules\/|react(?:-dom)?(?:-jsx-runtime)?\.(?:development|production)|__CLIENT_INTERNALS_DO_NOT_USE|__SECRET_INTERNALS_DO_NOT_USE|Symbol\.for\(["']react\./,
      `published JavaScript ${file} contains bundled third-party code`,
    );
  }
}
