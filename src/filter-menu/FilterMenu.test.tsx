import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { FilterMenu } from "./FilterMenu.js";

const options = [
  { id: "a", label: "Reading" },
  { id: "b", label: "Research" },
  { id: "c", label: "Archive" },
];
beforeEach(() => {
  for (const name of ["IntersectionObserver", "ResizeObserver"])
    vi.stubGlobal(
      name,
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
});
afterEach(() => vi.unstubAllGlobals());
test("draft edits wait for Apply, then update the uncontrolled chip", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();
  render(
    <FilterMenu label="Collections" options={options} onApply={onApply} />,
  );
  await user.click(screen.getByRole("button", { name: "Collections" }));
  await user.click(screen.getByRole("button", { name: /Show suggestions/ }));
  await user.click(screen.getByRole("option", { name: "Reading" }));
  expect(onApply).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).toHaveBeenCalledExactlyOnceWith([options[0]]);
  expect(
    screen.getByRole("button", { name: "Collections: Reading" }),
  ).toBeVisible();
});
test("dismissal discards the draft; Clear explicitly applies an empty selection", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();
  render(
    <FilterMenu
      label="Collections"
      options={options}
      defaultValue={options.slice(0, 1)}
      onApply={onApply}
    />,
  );
  await user.click(
    screen.getByRole("button", { name: "Collections: Reading" }),
  );
  await user.click(screen.getByRole("button", { name: "Remove Reading" }));
  screen.getByRole("button", { name: "Clear" }).focus();
  await user.keyboard("{Escape}");
  expect(onApply).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Collections: Reading" }),
  );
  expect(screen.getByRole("button", { name: "Remove Reading" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(onApply).toHaveBeenCalledExactlyOnceWith([]);
  expect(screen.getByRole("button", { name: "Collections" })).toBeVisible();
});
test("controlled values wait for the owner and summarize two values plus N", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();
  const { rerender } = render(
    <FilterMenu label="Collections" value={options} onApply={onApply} />,
  );
  const chip = screen.getByRole("button", {
    name: /Collections: Reading, Research/,
  });
  expect(chip).toHaveTextContent("+1");
  expect(chip).not.toHaveTextContent("Archive");
  await user.click(chip);
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(onApply).toHaveBeenCalledWith([]);
  expect(chip).toHaveAttribute("data-selected", "true");
  rerender(<FilterMenu label="Collections" value={[]} onApply={onApply} />);
  expect(chip).not.toHaveAttribute("data-selected");
});
