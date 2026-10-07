import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  expect(screen.getByRole("region", { name: "Answer" })).toHaveTextContent(
    "Reading your documents…",
  );
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
  const citation = screen.getByRole("button", {
    name: "Preparation checklist",
  });
  expect(citation).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("dialog", { name: "Preparation checklist" }),
  ).toBeVisible();
  expect(document.querySelector("mark")).toHaveTextContent("Bring your notes");
  expect(screen.getByText("Page 2 / 2")).toBeVisible();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(citation).toHaveFocus());
  await user.click(screen.getByRole("button", { name: "Workshop guide" }));
  expect(document.querySelector("mark")).toHaveTextContent("shared reading");
  expect(screen.getByText("Page 1 / 2")).toBeVisible();
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

test("Conversation keeps previous turns while sending and after answering", () => {
  vi.useFakeTimers();
  render(<AskWithSourcesRecipe />);
  const input = screen.getByRole("textbox", { name: "Your question" });
  fireEvent.click(
    screen.getByRole("button", { name: "What should I prepare?" }),
  );
  act(() => vi.advanceTimersByTime(1000));
  fireEvent.change(input, {
    target: { value: "Where can I find the schedule?" },
  });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(screen.getByRole("heading", { name: "Sample answer" })).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("Sending…");
  act(() => vi.advanceTimersByTime(1000));
  expect(
    screen.getAllByRole("heading", { name: "Sample answer" }),
  ).toHaveLength(2);
  expect(screen.getByRole("region", { name: "Answer" })).toHaveTextContent(
    "What should I prepare?",
  );
  expect(
    screen.getAllByRole("button", { name: "Preparation checklist" }),
  ).toHaveLength(2);
});

test.each([
  [
    "What should I prepare?",
    "The checklist does not specify any additional materials.",
  ],
  [
    "Where can I find the schedule?",
    "The guide does not specify session times.",
  ],
  [
    "What happens after the workshop?",
    "The guide does not specify when the summary will arrive.",
  ],
])("A sourced answer includes its own reserve: %s", (question, reserve) => {
  vi.useFakeTimers();
  render(<AskWithSourcesRecipe />);
  fireEvent.click(screen.getByRole("button", { name: question }));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText(reserve)).toBeVisible();
});

test("An unsupported question shows help without sources", () => {
  vi.useFakeTimers();
  render(<AskWithSourcesRecipe />);
  const input = screen.getByRole("textbox", { name: "Your question" });
  fireEvent.change(input, {
    target: { value: "What is the weather tomorrow?" },
  });
  fireEvent.keyDown(input, { key: "Enter" });
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText("Answer unavailable")).toBeVisible();
  const eyebrow = screen.getByText("Answer unavailable");
  const explanation = screen.getByText(
    "Try a suggested question to explore the sample records.",
  );
  expect(eyebrow).toHaveAttribute("data-variant", "mono");
  expect(
    eyebrow.compareDocumentPosition(explanation) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(explanation).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Preparation checklist" }),
  ).toBeNull();
  expect(screen.queryByRole("heading", { name: "Source excerpt" })).toBeNull();
});
