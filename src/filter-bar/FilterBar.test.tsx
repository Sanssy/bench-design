import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { FilterBar } from "./FilterBar.js";

test("announces results, clears active filters and follows application counts", async () => {
  const user = userEvent.setup();
  const clear = vi.fn();
  const { rerender } = render(
    <FilterBar resultCount={42} activeCount={2} onClearFilters={clear}>
      Filters
    </FilterBar>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("42 results");
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(clear).toHaveBeenCalledTimes(1);
  rerender(
    <FilterBar resultCount={100} activeCount={0} onClearFilters={clear}>
      Filters
    </FilterBar>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("100 results");
  expect(
    screen.queryByRole("button", { name: "Clear filters" }),
  ).not.toBeInTheDocument();
});

test("mobile mounts controls only in the sheet and closes with Show results", async () => {
  const media = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  try {
    const user = userEvent.setup();
    render(
      <FilterBar
        resultCount={12}
        activeCount={3}
        onClearFilters={vi.fn()}
        search={<input aria-label="Search" />}
      >
        <button type="button">Available</button>
      </FilterBar>,
    );
    expect(
      screen.queryByRole("button", { name: "Available" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filters 3" }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Available" })).toHaveLength(
      1,
    );
    expect(screen.getAllByRole("textbox", { name: "Search" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Show 12 results" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters 3" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  } finally {
    vi.unstubAllGlobals();
  }
});

test("crossing the breakpoint while open leaves one desktop set of controls", async () => {
  let changed = () => {};
  const media = {
    matches: true,
    addEventListener: vi.fn((_event: string, callback: () => void) => {
      changed = callback;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  try {
    const user = userEvent.setup();
    const { unmount } = render(
      <FilterBar resultCount={0} activeCount={0} onClearFilters={vi.fn()}>
        <button type="button">Available</button>
      </FilterBar>,
    );
    await user.click(screen.getByRole("button", { name: "Filters 0" }));
    act(() => {
      media.matches = false;
      changed();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Available" })).toHaveLength(
      1,
    );
    expect(screen.getByRole("status")).toHaveTextContent("0 results");
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
