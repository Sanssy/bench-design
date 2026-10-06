import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { storyWidth } from "../../.storybook/story-width";

function renderStory(parameters: Record<string, unknown> = {}) {
  return render(
    storyWidth(() => <button type="button">Example</button>, { parameters }),
  );
}

describe("Storybook canvas width", () => {
  it("limits ordinary examples without imposing a minimum width", () => {
    const { container } = renderStory();
    expect(container.firstElementChild).toHaveStyle({
      inlineSize: "100%",
      maxInlineSize: "720px",
    });
    expect(screen.getByRole("button", { name: "Example" })).toBeVisible();
  });

  it.each([{ fullWidth: true }, { layout: "fullscreen" }])(
    "leaves wide examples unwrapped: %j",
    (parameters) => {
      const { container } = renderStory(parameters);
      expect(container.firstElementChild).toBe(
        screen.getByRole("button", { name: "Example" }),
      );
    },
  );
});
