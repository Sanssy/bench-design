import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { AppHeader } from "../app-header/AppHeader.js";
import { BenchProvider } from "../bench-provider/BenchProvider.js";
import { Page } from "./Page.js";

test("Page exposes a single banner, main and optional footer", () => {
  const { rerender } = render(
    <Page
      header={<AppHeader brand="Archive" navigation="Browse" />}
      footer="End"
    >
      Document
    </Page>,
  );
  expect(screen.getAllByRole("banner")).toHaveLength(1);
  expect(screen.getByRole("main")).toHaveTextContent("Document");
  expect(screen.getByRole("contentinfo")).toHaveTextContent("End");
  rerender(<Page>Document</Page>);
  expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
});

test("Page skip link localizes and focuses a stable main without navigation", async () => {
  const user = userEvent.setup();
  const content = (
    <BenchProvider locale="fr-FR">
      <Page header={<button type="button">Menu</button>}>Document</Page>
    </BenchProvider>
  );
  const { rerender } = render(content);
  const main = screen.getByRole("main");
  const id = main.id;
  const hash = window.location.hash;
  const skip = screen.getByRole("link", { name: "Aller au contenu principal" });
  expect(skip).toHaveAttribute("href", `#${id}`);
  await user.tab();
  expect(skip).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(main).toHaveFocus();
  expect(window.location.hash).toBe(hash);
  rerender(
    <BenchProvider locale="fr-FR">
      <Page header="Updated">New content</Page>
    </BenchProvider>,
  );
  expect(screen.getByRole("main")).toHaveAttribute("id", id);
});
