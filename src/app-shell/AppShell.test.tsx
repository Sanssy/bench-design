import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { BenchProvider } from "../bench-provider/BenchProvider.js";
import { AppShell } from "./AppShell.js";

let wide = false;
let resize: (() => void) | undefined;
beforeEach(() => {
  wide = false;
  vi.stubGlobal("matchMedia", () => ({
    matches: wide,
    addEventListener: (_: string, listener: () => void) => {
      resize = listener;
    },
    removeEventListener: () => {
      resize = undefined;
    },
  }));
});
afterEach(() => vi.unstubAllGlobals());

test("AppShell exposes header, main and optional footer without panel labels", () => {
  render(
    <AppShell header="Header" footer="Footer">
      Document
    </AppShell>,
  );
  expect(screen.getByRole("banner")).toHaveTextContent("Header");
  expect(screen.getByRole("main")).toHaveTextContent("Document");
  expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
});

test("AppShell keeps named panels mounted and input state across selection", async () => {
  const user = userEvent.setup();
  render(
    <AppShell
      header="Header"
      start={{
        label: "Library",
        content: <input aria-label="Search library" />,
      }}
      end={{ label: "Details", content: "Properties" }}
    >
      Document
    </AppShell>,
  );
  const start = document.querySelector(".bd-app-shell-start") as HTMLElement;
  const end = document.querySelector(".bd-app-shell-end") as HTMLElement;
  const input = screen.getByRole("textbox");
  const library = screen.getByRole("tab", { name: "Library" });
  const details = screen.getByRole("tab", { name: "Details" });
  expect(library).toHaveAttribute("aria-controls", start.id);
  expect(details).toHaveAttribute("aria-controls", end.id);
  expect(library).toHaveAttribute("aria-selected", "true");
  expect(start).toHaveAttribute("aria-labelledby", library.id);
  expect(
    screen
      .getByRole("tablist")
      .compareDocumentPosition(screen.getByRole("main")) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  await user.type(input, "Saved search");
  await user.click(details);
  expect(details).toHaveAttribute("aria-selected", "true");
  expect(end.closest(".bd-app-shell")).toHaveAttribute(
    "data-active-panel",
    "end",
  );
  await user.click(library);
  expect(screen.getByRole("textbox")).toHaveValue("Saved search");
  expect(screen.getByRole("textbox")).toBe(input);
  expect(document.querySelector(".bd-app-shell-start")).toBe(start);
  expect(document.querySelector(".bd-app-shell-end")).toBe(end);
  await user.click(library);
  expect(library).toHaveAttribute("aria-selected", "true");
  act(() => {
    wide = true;
    resize?.();
  });
  expect(screen.getByRole("complementary", { name: "Library" })).toBe(start);
  expect(screen.getByRole("complementary", { name: "Details" })).toBe(end);
  expect(end).not.toHaveAttribute("inert");
  expect(screen.getByRole("textbox")).toBe(input);
  act(() => {
    wide = false;
    resize?.();
  });
  expect(screen.getByRole("tabpanel", { name: "Library" })).toBe(start);
  expect(end).toHaveAttribute("inert");
});

test("AppShell supports either optional panel and updates the active panel", () => {
  const { rerender } = render(
    <AppShell header="Header" start={{ label: "Library", content: "Assets" }}>
      Document
    </AppShell>,
  );
  expect(screen.getAllByRole("tab")).toHaveLength(1);
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Assets");
  rerender(
    <AppShell header="Header" end={{ label: "Details", content: "Properties" }}>
      Document
    </AppShell>,
  );
  expect(screen.getAllByRole("tab")).toHaveLength(1);
  expect(screen.getByRole("tab")).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tabpanel").closest(".bd-app-shell")).toHaveAttribute(
    "data-active-panel",
    "end",
  );
  expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
});

test("AppShell offers the first keyboard stop and focuses its stable main target", async () => {
  const user = userEvent.setup();
  const content = (
    <AppShell header={<button type="button">Menu</button>}>Document</AppShell>
  );
  const { rerender } = render(content);
  const main = screen.getByRole("main");
  const id = main.id;
  const link = screen.getByRole("link", { name: "Skip to main content" });
  expect(id).not.toBe("");
  expect(link).toHaveAttribute("href", `#${id}`);
  await user.tab();
  expect(link).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(main).toHaveFocus();
  rerender(<AppShell header="Updated">Document</AppShell>);
  expect(screen.getByRole("main")).toHaveAttribute("id", id);
});

test("AppShell localizes its skip link and accepts internal message overrides", () => {
  const { rerender } = render(
    <BenchProvider locale="fr-FR">
      <AppShell header="Header">Document</AppShell>
    </BenchProvider>,
  );
  expect(
    screen.getByRole("link", { name: "Aller au contenu principal" }),
  ).toBeInTheDocument();
  rerender(
    <BenchProvider
      locale="fr-FR"
      messages={{ skipToMain: "Passer au document" }}
    >
      <AppShell header="Header">Document</AppShell>
    </BenchProvider>,
  );
  expect(
    screen.getByRole("link", { name: "Passer au document" }),
  ).toBeInTheDocument();
});
