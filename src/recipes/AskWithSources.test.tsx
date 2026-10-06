import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { AskWithSourcesRecipe } from "./AskWithSources.js";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
test("Enter announces waiting, then exposes a response and reachable sources", async () => {
  vi.useFakeTimers();
  render(<AskWithSourcesRecipe />);
  const input = screen.getByRole("textbox", { name: "Your question" });
  fireEvent.change(input, { target: { value: "What should I prepare?" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(screen.getByRole("status")).toHaveTextContent("Sending…");
  expect(input).toBeDisabled();
  expect(screen.queryByRole("heading", { name: "Sample answer" })).toBeNull();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("heading", { name: "Sample answer" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Answer" })).toHaveTextContent(
    "Sample answer ready.",
  );
  expect(
    screen.getByRole("button", { name: "What should I prepare?" }),
  ).toBeVisible();
  expect(screen.getByRole("region", { name: "Answer" })).toHaveTextContent(
    "What should I prepare?",
  );
  expect(input).not.toBeDisabled();
  expect(input).toHaveValue("");
  vi.useRealTimers();
  const user = userEvent.setup();
  input.focus();
  await user.tab({ shift: true });
  const citation = screen.getByRole("link", { name: "Preparation checklist" });
  expect(citation).toHaveFocus();
  expect(citation).toHaveAttribute("href", "#sample-excerpt");
  expect(document.getElementById("sample-excerpt")).toHaveTextContent(
    "Bring your notes",
  );
});
test.each([false, true])(
  "A suggestion sends directly and remains available (mobile=%s)",
  async (mobile) => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: mobile && query.includes("640"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<AskWithSourcesRecipe />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "What should I prepare?" }));
    expect(screen.getByRole("textbox", { name: "Your question" })).toHaveValue(
      "",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Sending…");
    expect(
      screen.getByRole("button", { name: "What should I prepare?" }),
    ).toBeVisible();
  },
);

test("The composer stays in flow until an answer is available", () => {
  vi.useFakeTimers();
  render(<AskWithSourcesRecipe />);
  const input = screen.getByRole("textbox", { name: "Your question" });
  const container = input.closest(".bd-composer")?.parentElement;
  expect(container).toHaveStyle({ position: "static" });
  fireEvent.change(input, { target: { value: "A question" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(container).toHaveStyle({ position: "static" });
  act(() => vi.advanceTimersByTime(1000));
  expect(container).toHaveStyle({ position: "sticky" });
});

test("The header exposes the three example pages with Ask current", () => {
  render(<AskWithSourcesRecipe />);
  expect(screen.getByRole("link", { name: /Library/ })).toBeVisible();
  expect(screen.getByRole("link", { name: "Overview" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Ask" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
