import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ComboBox } from "./ComboBox.js";

const options = [
  { id: "reading", label: "Reading", description: "Books" },
  { id: "research", label: "Research" },
];
test("filters local results as the user types", async () => {
  const user = userEvent.setup();
  render(<ComboBox label="Collection" options={options} />);
  await user.type(screen.getByRole("combobox"), "Read");
  expect(screen.getByRole("option", { name: /Reading/ })).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: "Research" }),
  ).not.toBeInTheDocument();
});

test("underlines every matching fragment", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox
      label="Collection"
      options={[{ id: "one", label: "Reading reading" }]}
    />,
  );
  await user.type(screen.getByRole("combobox"), "read");
  expect(
    [...screen.getByRole("option").querySelectorAll("u")].map(
      (node) => node.textContent,
    ),
  ).toEqual(["Read", "read"]);
});
test("announces the exact filtered count", async () => {
  const user = userEvent.setup();
  render(<ComboBox label="Collection" options={options} />);
  await user.type(screen.getByRole("combobox"), "Read");
  expect(screen.getByRole("status")).toHaveTextContent("1 results");
});
test("offers a hint when no option matches", async () => {
  const user = userEvent.setup();
  render(<ComboBox label="Collection" options={options} />);
  await user.type(screen.getByRole("combobox"), "unknown");
  expect(
    screen.getByText("No results. Try a different search."),
  ).toBeInTheDocument();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
test("debounces server searches for 250 ms and aborts at the next keystroke", async () => {
  vi.useFakeTimers();
  const loadItems = vi.fn(
    async (_request: {
      query: string;
      signal: AbortSignal;
      cursor?: string;
    }) => ({ items: options }),
  );
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  await act(() => vi.advanceTimersByTimeAsync(250));
  loadItems.mockClear();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "read" } });
  await act(() => vi.advanceTimersByTimeAsync(249));
  expect(loadItems).not.toHaveBeenCalled();
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(loadItems).toHaveBeenCalledTimes(1);
  expect(loadItems.mock.calls[0]?.[0]).toMatchObject({ query: "read" });
});
test("aborts an in-flight server request immediately and ignores a stale response", async () => {
  let resolveOld: ((value: { items: typeof options }) => void) | undefined;
  const loadItems = vi.fn(
    ({ query }: { query: string; signal: AbortSignal }) =>
      query === "old"
        ? new Promise<{ items: typeof options }>((resolve) => {
            resolveOld = resolve;
          })
        : Promise.resolve({ items: [] }),
  );
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "old" } });
  await waitFor(() =>
    expect(loadItems).toHaveBeenCalledWith(
      expect.objectContaining({ query: "old" }),
    ),
  );
  const signal = loadItems.mock.calls.find(
    ([request]) => request.query === "old",
  )?.[0].signal;
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "new" } });
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    resolveOld?.({ items: options });
  });
  await waitFor(() =>
    expect(loadItems).toHaveBeenCalledWith(
      expect.objectContaining({ query: "new" }),
    ),
  );
  expect(
    screen.queryByRole("option", { name: /Reading/ }),
  ).not.toBeInTheDocument();
});
test("shows server failure and retries the failed search", async () => {
  const user = userEvent.setup();
  const loadItems = vi
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue({ items: options });
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  await user.click(screen.getByRole("button"));
  await user.click(await screen.findByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("option", { name: /Reading/ }),
  ).toBeInTheDocument();
});

test("loads the next cursor at the sentinel and announces the final count", async () => {
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
  const loadItems = vi
    .fn()
    .mockResolvedValueOnce({ items: [options[0]], cursor: "page-2" })
    .mockResolvedValueOnce({ items: [options[1]] });
  const user = userEvent.setup();
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  await user.click(screen.getByRole("button"));
  expect(await screen.findByText("1 loaded")).toBeInTheDocument();
  act(() => intersect?.());
  await waitFor(() =>
    expect(loadItems).toHaveBeenCalledWith(
      expect.objectContaining({ query: "", cursor: "page-2" }),
    ),
  );
  expect(await screen.findByText("2 results")).toBeInTheDocument();
  expect(screen.getAllByRole("option")).toHaveLength(2);
});
test("retries a failed next page without discarding the first page", async () => {
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
  const loadItems = vi
    .fn()
    .mockResolvedValueOnce({ items: [options[0]], cursor: "page-2" })
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ items: [options[1]] });
  const user = userEvent.setup();
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  await user.click(screen.getByRole("button"));
  await screen.findByText("1 loaded");
  act(() => intersect?.());
  await user.click(await screen.findByRole("button", { name: "Try again" }));
  expect(await screen.findByText("2 results")).toBeInTheDocument();
  expect(loadItems.mock.calls.at(-1)?.[0]).toMatchObject({ cursor: "page-2" });
  expect(screen.getAllByRole("option")).toHaveLength(2);
});
test("shows loading while a server response is pending", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox label="Collection" loadItems={() => new Promise(() => {})} />,
  );
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Loading results…")).toBeInTheDocument();
  expect(
    screen.queryByText("No results. Try a different search."),
  ).not.toBeInTheDocument();
});
test("connects help and error and prevents disabled editing", () => {
  const { rerender } = render(
    <ComboBox
      label="Collection"
      description="Choose a collection"
      options={options}
    />,
  );
  expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
    "Choose a collection",
  );
  rerender(
    <ComboBox
      label="Collection"
      isInvalid
      errorMessage="Choose again"
      options={options}
    />,
  );
  expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
    "Choose again",
  );
  rerender(<ComboBox label="Collection" isDisabled options={options} />);
  expect(screen.getByRole("combobox")).toBeDisabled();
});
test("reports a selection and prevents disabled options", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(
    <ComboBox
      label="Collection"
      options={[
        ...options,
        { id: "disabled", label: "Archive", isDisabled: true },
      ]}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("option", { name: "Archive" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.click(screen.getByRole("option", { name: /Reading/ }));
  expect(onSelectionChange).toHaveBeenCalledWith(options[0]);
  expect(screen.getByRole("combobox")).toHaveValue("Reading");
});

test("underlines accent-insensitive local matches", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox label="Collection" options={[{ id: "one", label: "Résumé" }]} />,
  );
  await user.type(screen.getByRole("combobox"), "resume");
  expect(screen.getByRole("option").querySelector("u")).toHaveTextContent(
    "Résumé",
  );
});

test("does not offer stale options after a different server search fails", async () => {
  const user = userEvent.setup();
  const loadItems = vi
    .fn()
    .mockResolvedValueOnce({ items: options })
    .mockRejectedValue(new Error("offline"));
  render(<ComboBox label="Collection" loadItems={loadItems} />);
  await user.click(screen.getByRole("button"));
  await screen.findByRole("option", { name: /Reading/ });
  await user.type(screen.getByRole("combobox"), "new");
  await screen.findByRole("button", { name: "Try again" });
  expect(
    screen.queryByRole("option", { name: /Reading/ }),
  ).not.toBeInTheDocument();
});
test("ComboBox shows every option when opened with the button after a choice", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox
      label="City"
      options={[
        { id: "a", label: "Paris" },
        { id: "b", label: "Lyon" },
        { id: "c", label: "Nice" },
      ]}
    />,
  );
  await user.type(screen.getByRole("combobox"), "Ly");
  await user.click(screen.getByRole("option", { name: "Lyon" }));
  expect(screen.getByRole("combobox")).toHaveValue("Lyon");
  await user.click(screen.getByRole("button", { name: /City/ }));
  expect(screen.getAllByRole("option")).toHaveLength(3);
});

for (const controlled of [false, true]) {
  test(`shows server preselection and submits ids (${controlled ? "controlled" : "uncontrolled"})`, () => {
    const saved = { id: "doc-42", label: "Saved document" };
    const loadItems = vi.fn(
      () => new Promise<{ items: typeof options }>(() => {}),
    );
    const { container, rerender } = render(
      <form>
        <ComboBox
          label="Saved"
          name="documents"
          loadItems={loadItems}
          {...(controlled
            ? { selectedOption: saved }
            : { defaultSelectedOption: saved })}
        />
      </form>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Saved document");
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
          <ComboBox
            label="Saved"
            name="documents"
            loadItems={loadItems}
            selectedOption={renamed}
          />
        </form>,
      );
      expect(screen.getByRole("combobox")).toHaveValue("Renamed document");
      rerender(
        <form>
          <ComboBox
            label="Saved"
            name="documents"
            loadItems={loadItems}
            selectedOption={null}
          />
        </form>,
      );
      expect(screen.getByRole("combobox")).toHaveValue("");
    }
  });
}

test("keeps a controlled server choice until the owner accepts another option", async () => {
  const user = userEvent.setup();
  const saved = { id: "doc-42", label: "Saved document" };
  const onSelectionChange = vi.fn();
  render(
    <ComboBox
      label="Saved"
      selectedOption={saved}
      loadItems={async () => ({ items: options })}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button"));
  await user.click(await screen.findByRole("option", { name: /Reading/ }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(options[0]);
  expect(screen.getByRole("combobox")).toHaveValue("Saved document");
});
test("restores a saved server label when a search is dismissed", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox
      label="Saved"
      defaultSelectedOption={{ id: "doc-42", label: "Saved document" }}
      loadItems={async () => ({ items: [] })}
    />,
  );
  await user.click(screen.getByRole("combobox"));
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "unknown" },
  });
  await user.keyboard("{Escape}");
  expect(screen.getByRole("combobox")).toHaveValue("Saved document");
});

test("clears a saved server selection when the input is emptied", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const { container } = render(
    <form>
      <ComboBox
        label="Saved"
        name="document"
        defaultSelectedOption={{ id: "doc-42", label: "Saved document" }}
        loadItems={async () => ({ items: [] })}
        onSelectionChange={onSelectionChange}
      />
    </form>,
  );
  await user.clear(screen.getByRole("combobox"));
  await user.tab();
  expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(
    new FormData(container.querySelector("form") as HTMLFormElement).get(
      "document",
    ),
  ).toBe("");
});

test("keeps typed text when a parent re-renders an equal selected option", async () => {
  const user = userEvent.setup();
  const view = (
    <ComboBox
      label="City"
      selectedOption={{ id: "a", label: "Paris" }}
      options={[{ id: "a", label: "Paris" }]}
    />
  );
  const { rerender } = render(view);
  const input = screen.getByRole("combobox");
  await user.clear(input);
  await user.type(input, "Ly");
  // A new but equal option object, as an inline prop on each parent render.
  rerender(
    <ComboBox
      label="City"
      selectedOption={{ id: "a", label: "Paris" }}
      options={[{ id: "a", label: "Paris" }]}
    />,
  );
  expect(input).toHaveValue("Ly");
});
