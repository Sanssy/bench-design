import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { AppShell } from "./AppShell.js";

test("AppShell exposes header, main and optional footer without panel labels", () => {
  render(
    <AppShell header="Header" footer="Footer">
      Document
    </AppShell>,
  );
  expect(screen.getByRole("banner")).toHaveTextContent("Header");
  expect(screen.getByRole("main")).toHaveTextContent("Document");
  expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
  expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
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
  const start = screen.getByRole("complementary", { name: "Library" });
  const end = screen.getByRole("complementary", { name: "Details" });
  const input = screen.getByRole("textbox");
  const library = screen.getByRole("radio", { name: "Library" });
  const details = screen.getByRole("radio", { name: "Details" });
  expect(library).toHaveAttribute("aria-controls", start.id);
  expect(details).toHaveAttribute("aria-controls", end.id);
  expect(library).toHaveAttribute("aria-checked", "true");
  expect(
    screen
      .getByRole("main")
      .compareDocumentPosition(screen.getByRole("radiogroup")) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  await user.type(input, "Saved search");
  await user.click(details);
  expect(details).toHaveAttribute("aria-checked", "true");
  expect(end.closest(".bd-app-shell")).toHaveAttribute(
    "data-active-panel",
    "end",
  );
  await user.click(library);
  expect(screen.getByRole("textbox")).toHaveValue("Saved search");
  expect(screen.getByRole("textbox")).toBe(input);
  expect(screen.getByRole("complementary", { name: "Library" })).toBe(start);
  expect(screen.getByRole("complementary", { name: "Details" })).toBe(end);
  await user.click(library);
  expect(library).toHaveAttribute("aria-checked", "true");
});

test("AppShell supports either optional panel and updates the active panel", () => {
  const { rerender } = render(
    <AppShell header="Header" start={{ label: "Library", content: "Assets" }}>
      Document
    </AppShell>,
  );
  expect(screen.getAllByRole("radio")).toHaveLength(1);
  expect(screen.getByRole("complementary")).toHaveTextContent("Assets");
  rerender(
    <AppShell header="Header" end={{ label: "Details", content: "Properties" }}>
      Document
    </AppShell>,
  );
  expect(screen.getAllByRole("radio")).toHaveLength(1);
  expect(screen.getByRole("radio")).toHaveAttribute("aria-checked", "true");
  expect(
    screen.getByRole("complementary").closest(".bd-app-shell"),
  ).toHaveAttribute("data-active-panel", "end");
  expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
});
