import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ActionList } from "./ActionList.js";

test("a named list preserves link destinations and native list semantics", () => {
  render(
    <ActionList
      label="Explore"
      items={[{ id: "a", title: "Archive", href: "/archive" }]}
    />,
  );
  expect(screen.getByRole("list", { name: "Explore" }).tagName).toBe("UL");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Archive" })).toHaveAttribute(
    "href",
    "/archive",
  );
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("actions activate once by pointer, Enter and Space without submitting", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  const submit = vi.fn();
  render(
    <form onSubmit={submit}>
      <ActionList
        label="Actions"
        items={[{ id: "a", title: "Create draft", onPress }]}
      />
    </form>,
  );
  const button = screen.getByRole("button", { name: "Create draft" });
  await user.click(button);
  await user.keyboard("{Enter}");
  await user.keyboard(" ");
  expect(onPress).toHaveBeenCalledTimes(3);
  expect(submit).not.toHaveBeenCalled();
});

test("descriptions supplement titles while numbering stays decorative", () => {
  render(
    <ActionList
      label="Resources"
      numbered
      items={[
        {
          id: "a",
          title: "Reference",
          description: "Read the complete guide",
          href: "https://example.com",
          external: true,
          icon: "file-text",
        },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: /Reference/ });
  expect(link).toHaveAccessibleDescription("Read the complete guide");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.getByText("1")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByRole("list").tagName).toBe("UL");
});

test("an empty list renders its labelled container without rows", () => {
  render(<ActionList label="Resources" items={[]} />);
  expect(screen.queryAllByRole("link")).toHaveLength(0);
  expect(screen.queryAllByRole("button")).toHaveLength(0);
});
