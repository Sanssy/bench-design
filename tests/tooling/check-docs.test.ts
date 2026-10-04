import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { docsReferenceErrors } from "../../scripts/check-docs.ts";

test("a Docs page referencing a missing story fails", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-docs-"));
  try {
    writeFileSync(join(root, "A.stories.tsx"), "export const Primary = {};");
    const mdx =
      "import * as Stories from './A.stories';\n<Canvas of={Stories.Primary} />\n<Canvas of={Stories.Gone} />";
    assert.deepEqual(docsReferenceErrors(mdx, join(root, "A.mdx")), [
      `${join(root, "A.mdx")}: Stories.Gone is not a story export`,
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
