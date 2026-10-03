import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const script = () => readFileSync("public/theme-init.js", "utf8");
test("initialization can load without window on the server", () => {
  const context = {};
  Object.defineProperty(context, "window", {
    get() {
      assert.fail("SSR accessed window");
    },
  });
  assert.doesNotThrow(() => runInNewContext(script(), context));
});
const initialize = (stored, existing) => {
  const attrs = new Map(existing ? [["data-theme", existing]] : []);
  runInNewContext(script(), {
    document: {
      documentElement: {
        hasAttribute: (name) => attrs.has(name),
        setAttribute: (name, value) => attrs.set(name, value),
      },
    },
    localStorage: {
      getItem: (key) => {
        assert.equal(key, "bench-design-theme");
        return stored;
      },
    },
  });
  return attrs.get("data-theme");
};
test("saved explicit choices initialize before render and system stays implicit", () => {
  for (const theme of ["light", "dark"]) assert.equal(initialize(theme), theme);
  for (const theme of [null, "system", "invalid"])
    assert.equal(initialize(theme), undefined);
  assert.equal(initialize("dark", "light"), "light");
});
test("blocked storage leaves system mode intact", () => {
  const attrs = new Map();
  const context = {
    document: {
      documentElement: {
        hasAttribute: (name) => attrs.has(name),
        setAttribute: (name, value) => attrs.set(name, value),
      },
    },
  };
  Object.defineProperty(context, "localStorage", {
    get() {
      throw new Error("storage blocked");
    },
  });
  assert.doesNotThrow(() => runInNewContext(script(), context));
  assert.equal(attrs.size, 0);
});
