import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPublicJavaScript } from "../../scripts/check-public-javascript.ts";

test("published JavaScript keeps third-party code external, including chunks", () => {
  const root = mkdtempSync(join(tmpdir(), "bench-design-public-js-"));
  try {
    writeFileSync(
      join(root, "index.js"),
      'import { jsx } from "react/jsx-runtime"; import { Button } from "react-aria-components"; export { Button };',
    );
    assert.doesNotThrow(() => checkPublicJavaScript(root));
    mkdirSync(join(root, "chunks"));
    const chunk = join(root, "chunks/button.js");
    for (const source of [
      "//#region \\0rolldown/runtime.js\nexport {};",
      'throw Error("Calling `require` for a module");',
      "//#region node_modules/react-aria-components/Button.js\nexport {};",
      "/** react-jsx-runtime.production.js */ export {};",
      "const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;",
      "const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;",
      'const element = Symbol.for("react.transitional.element");',
    ]) {
      writeFileSync(chunk, source);
      assert.throws(
        () => checkPublicJavaScript(root),
        /button.js contains bundled third-party code/,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
