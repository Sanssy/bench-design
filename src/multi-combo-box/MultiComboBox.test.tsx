import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MultiComboBox } from "./MultiComboBox.js";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const options = [
  { id: "reading", label: "Reading" },
  { id: "research", label: "Research" },
];
test("selects multiple choices without replacing the earlier choice", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Collections/ }));
  await user.click(screen.getByRole("option", { name: "Reading" }));
  await user.click(screen.getByRole("option", { name: "Research" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(options);
});
test("removes a selected choice with its pointer button", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      defaultSelectedOptions={options}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Remove Reading" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([options[1]]);
});
for (const key of ["{Delete}", "{Backspace}"]) {
  test(`removes a focused tag with ${key}`, async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <MultiComboBox
        label="Collections"
        options={options}
        defaultSelectedOptions={options}
        onSelectionChange={onSelectionChange}
      />,
    );
    screen.getByRole("row", { name: "Reading" }).focus();
    await user.keyboard(key);
    expect(onSelectionChange).toHaveBeenLastCalledWith([options[1]]);
    expect(
      screen.queryByRole("row", { name: "Reading" }),
    ).not.toBeInTheDocument();
  });
}
test("clears every choice from the list footer", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      defaultSelectedOptions={options}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Show suggestions/ }));
  await user.click(screen.getByRole("button", { name: "Clear all" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  await user.keyboard("{Escape}");
  expect(screen.queryAllByRole("row")).toHaveLength(0);
});
test("submits one form value per selected identifier", () => {
  const { container } = render(
    <form>
      <MultiComboBox
        label="Collections"
        name="collections"
        options={options}
        defaultSelectedOptions={options}
      />
    </form>,
  );
  expect(
    new FormData(container.querySelector("form") as HTMLFormElement).getAll(
      "collections",
    ),
  ).toEqual(["reading", "research"]);
});
test("validates the selected identifiers on form submission", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <MultiComboBox
        label="Collections"
        options={options}
        defaultSelectedOptions={options.slice(0, 1)}
        validate={(keys) => (keys.length < 2 ? "Choose two collections" : null)}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Choose two collections")).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
test("respects controlled selection and disabled tags", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const { rerender } = render(
    <MultiComboBox
      label="Collections"
      options={options}
      selectedOptions={options.slice(0, 1)}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Remove Reading" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  expect(screen.getByRole("row", { name: "Reading" })).toBeInTheDocument();
  rerender(
    <MultiComboBox
      label="Collections"
      options={options}
      selectedOptions={options.slice(0, 1)}
      isDisabled
      onSelectionChange={onSelectionChange}
    />,
  );
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Remove Reading" })).toBeDisabled();
});
test("summarizes choices that would exceed two tag lines", () => {
  const measure = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const width = this.classList.contains("bd-tag-measure") ? 240 : 100;
      return {
        width,
        height: 28,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: 28,
        toJSON() {},
      };
    });
  const many = Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    label: `Choice ${i}`,
  }));
  render(
    <MultiComboBox
      label="Collections"
      options={many}
      defaultSelectedOptions={many}
    />,
  );
  expect(screen.getByText("+3")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(3);
  measure.mockRestore();
});
test("keeps selected tags while searching a different local result", async () => {
  const user = userEvent.setup();
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      defaultSelectedOptions={options.slice(0, 1)}
    />,
  );
  await user.type(screen.getByRole("combobox"), "research");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByRole("option").querySelector("u")).toHaveTextContent(
    "Research",
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 results");
  await user.keyboard("{Escape}");
  expect(screen.getByRole("row", { name: "Reading" })).toBeInTheDocument();
});
test("retains a server choice across subsequent searches", async () => {
  const user = userEvent.setup();
  const loadItems = vi.fn(
    async ({ query }: { query: string; signal: AbortSignal }) => ({
      items:
        query === "research"
          ? [options[1] as (typeof options)[number]]
          : [options[0] as (typeof options)[number]],
    }),
  );
  render(<MultiComboBox label="Collections" loadItems={loadItems} />);
  await user.click(screen.getByRole("button", { name: /Show suggestions/ }));
  await user.click(await screen.findByRole("option", { name: "Reading" }));
  await user.type(screen.getByRole("combobox"), "research");
  await screen.findByRole("option", { name: "Research" });
  await user.keyboard("{Escape}");
  expect(screen.getByRole("row", { name: "Reading" })).toBeInTheDocument();
});

test("makes selected tags inert only while the list is open", async () => {
  const user = userEvent.setup();
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      defaultSelectedOptions={options.slice(0, 1)}
    />,
  );
  const tags = screen
    .getByRole("row", { name: "Reading" })
    .closest(".bd-tag-container")?.parentElement;
  expect(tags).not.toHaveAttribute("inert");
  await user.click(screen.getByRole("button", { name: /Show suggestions/ }));
  expect(tags).toHaveAttribute("inert");
  await user.keyboard("{Escape}");
  expect(tags).not.toHaveAttribute("inert");
});

test("describes the input with field messages rather than the tag group", () => {
  render(
    <MultiComboBox
      label="Collections"
      options={options}
      defaultSelectedOptions={options.slice(0, 1)}
      description="Search collections"
      isInvalid
      errorMessage="Choose an available collection"
    />,
  );
  expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
    "Search collections Choose an available collection",
  );
  expect(
    screen.getByRole("grid", { name: "Selected choices" }),
  ).toBeInTheDocument();
});

test("does not restart the server search when selecting a result", async () => {
  const user = userEvent.setup();
  let intersect: (() => void) | undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = () => callback([{ isIntersecting: true }]);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const loadItems = vi.fn(
    async (request: { query: string; signal: AbortSignal; cursor?: string }) =>
      request.cursor
        ? { items: [{ id: "writing", label: "Writing" }] }
        : { items: options, cursor: "next" },
  );
  render(<MultiComboBox label="Collections" loadItems={loadItems} />);
  await user.type(screen.getByRole("combobox"), "read");
  await user.click(await screen.findByRole("option", { name: "Reading" }));
  expect(screen.getByRole("combobox")).toHaveValue("read");
  expect(screen.getByRole("status")).toHaveTextContent("2 loaded");
  expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
  expect(loadItems).toHaveBeenCalledTimes(1);
  expect(intersect).toBeDefined();
  await act(async () => intersect?.());
  expect(
    await screen.findByRole("option", { name: "Writing" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("3 results");
  expect(loadItems).toHaveBeenLastCalledWith(
    expect.objectContaining({ query: "read", cursor: "next" }),
  );
});

for (const controlled of [false, true]) {
  test(`shows server preselection and submits ids (${controlled ? "controlled" : "uncontrolled"})`, () => {
    const saved = { id: "doc-42", label: "Saved document" };
    const loadItems = vi.fn(
      () => new Promise<{ items: typeof options }>(() => {}),
    );
    const { container, rerender } = render(
      <form>
        <MultiComboBox
          label="Saved"
          name="documents"
          loadItems={loadItems}
          {...(controlled
            ? { selectedOptions: [saved] }
            : { defaultSelectedOptions: [saved] })}
        />
      </form>,
    );
    expect(
      screen.getByRole("row", { name: "Saved document" }),
    ).toBeInTheDocument();
    expect(
      new FormData(container.querySelector("form") as HTMLFormElement).getAll(
        "documents",
      ),
    ).toEqual(["doc-42"]);
    expect(loadItems).not.toHaveBeenCalled();
    if (controlled) {
      const renamed = { ...saved, label: "Renamed document" };
      rerender(
        <form>
          <MultiComboBox
            label="Saved"
            name="documents"
            loadItems={loadItems}
            selectedOptions={[renamed]}
          />
        </form>,
      );
      expect(
        screen.getByRole("row", { name: "Renamed document" }),
      ).toBeInTheDocument();
      rerender(
        <form>
          <MultiComboBox
            label="Saved"
            name="documents"
            loadItems={loadItems}
            selectedOptions={[]}
          />
        </form>,
      );
      expect(screen.queryByRole("row")).not.toBeInTheDocument();
    }
  });
}

test("returns saved server options alongside newly selected results", async () => {
  const user = userEvent.setup();
  const saved = { id: "doc-42", label: "Saved document" };
  const onSelectionChange = vi.fn();
  render(
    <MultiComboBox
      label="Saved"
      defaultSelectedOptions={[saved]}
      loadItems={async () => ({ items: options })}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Show suggestions/ }));
  await user.click(await screen.findByRole("option", { name: "Reading" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([saved, options[0]]);
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Remove Reading" }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([saved]);
});
