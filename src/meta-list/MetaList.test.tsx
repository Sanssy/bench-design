import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MetaList } from "./MetaList.js";

test("metadata pairs preserve terms, rich details and an explicit list name", () => {
  render(
    <MetaList
      label="Source details"
      items={[
        { term: "Source", details: <a href="/archive">Archive</a> },
        { term: "Year", details: "2026" },
      ]}
    />,
  );
  const list = screen.getByLabelText("Source details");
  expect(list.tagName).toBe("DL");
  expect(screen.getAllByRole("term").map((node) => node.textContent)).toEqual([
    "Source",
    "Year",
  ]);
  expect(
    screen.getAllByRole("definition").map((node) => node.textContent),
  ).toEqual(["Archive", "2026"]);
  expect(screen.getByRole("link", { name: "Archive" })).toHaveAttribute(
    "href",
    "/archive",
  );
  for (const pair of list.children)
    expect([...pair.children].map((node) => node.tagName)).toEqual([
      "DT",
      "DD",
    ]);
});
test("an empty unnamed list stays a native dl", () => {
  const { container } = render(<MetaList items={[]} />);
  expect(container.querySelector("dl")).toBeEmptyDOMElement();
  expect(container.querySelector("dl")).not.toHaveAttribute("aria-label");
});
