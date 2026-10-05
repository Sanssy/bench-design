import { expect, test } from "vitest";
import { manifestControls } from "../.storybook/manifest-controls.js";

test("Controls lists string and numeric literal options from the manifest", () => {
  expect(manifestControls("RadioGroup").variant?.options).toEqual([
    "list",
    "cards",
  ]);
  expect(manifestControls("Avatar").size?.options).toEqual([24, 32, 40]);
  expect(manifestControls("Avatar").name).toBeUndefined();
  expect(manifestControls(undefined)).toEqual({});
});
