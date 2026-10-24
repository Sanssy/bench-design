import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl.js";

test("SegmentedControl connects its name and help", () => {
  render(
    <SegmentedControl
      label="Setting"
      description="Choose carefully"
      isRequired
      options={[
        { id: "all", label: "All" },
        { id: "recent", label: "Recent" },
      ]}
    />,
  );
  expect(
    screen.getByRole("radiogroup", { name: "Setting" }),
  ).toHaveAccessibleDescription("Choose carefully");
});
test("SegmentedControl connects an external error", () => {
  render(
    <SegmentedControl
      label="Setting"
      isRequired
      isInvalid
      errorMessage="Review setting"
      options={[
        { id: "all", label: "All" },
        { id: "recent", label: "Recent" },
      ]}
    />,
  );
  expect(
    screen.getByRole("radiogroup", { name: "Setting" }),
  ).toHaveAccessibleDescription("Review setting");
});
const options = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "disabled", label: "Disabled", isDisabled: true },
];
const tooManyOptions = Array.from({ length: 7 }, (_, i) => ({
  id: String(i),
  label: String(i),
}));
test("SegmentedControl keeps a mandatory selection and reports keyboard edits", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <SegmentedControl
      label="View"
      options={options}
      onChange={onChange}
      name="view"
    />,
  );
  const all = screen.getByRole("radio", { name: "All" });
  expect(all).toHaveAttribute("aria-checked", "true");
  await user.click(all);
  expect(all).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Recent" })).toHaveFocus();
  await user.keyboard(" ");
  expect(screen.getByRole("radio", { name: "Recent" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(onChange).toHaveBeenLastCalledWith("recent");
  expect(document.querySelector('input[name="view"]')).toHaveValue("recent");
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Disabled" })).not.toHaveFocus();
});
test("SegmentedControl follows controlled IDs and names icon choices", () => {
  const { rerender } = render(
    <SegmentedControl
      label="View"
      hideLabel
      options={[
        { id: "search", label: "Search", icon: "search" },
        { id: "menu", label: "Menu", icon: "menu" },
      ]}
      value="search"
    />,
  );
  rerender(
    <SegmentedControl
      label="View"
      hideLabel
      options={[
        { id: "search", label: "Search", icon: "search" },
        { id: "menu", label: "Menu", icon: "menu" },
      ]}
      value="menu"
    />,
  );
  expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Menu" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("radio", { name: "Menu" }).textContent).toBe("");
});

test("icon choices stay icon-only in track and pills variants", () => {
  const props = {
    label: "View",
    options: [{ id: "search", label: "Search", icon: "search" }],
  } as const;
  const { rerender } = render(<SegmentedControl {...props} variant="track" />);
  let choice = screen.getByRole("radio", { name: "Search" });
  expect(choice.textContent).toBe("");
  expect(choice.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1);

  rerender(<SegmentedControl {...props} variant="pills" />);
  choice = screen.getByRole("radio", { name: "Search" });
  expect(choice.querySelector(".bd-segment-label")?.textContent).toBe(
    "✓\u00a0",
  );
  expect(choice.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1);
});

test("includes the visible count in the accessible name", () => {
  render(
    <SegmentedControl
      label="Category"
      options={[
        { id: "all", label: "All", count: 12 },
        { id: "housing", label: "Housing", count: 5 },
      ]}
    />,
  );
  expect(screen.getByRole("radio", { name: "Housing, 5" })).toBeVisible();
});

test("wrap is explicit and limited to six single-choice options", () => {
  const { rerender } = render(
    <SegmentedControl label="Category" options={options} />,
  );
  expect(screen.getByRole("radiogroup")).toHaveAttribute(
    "data-layout",
    "inline",
  );
  rerender(
    <SegmentedControl label="Category" options={options} layout="wrap" />,
  );
  expect(screen.getByRole("radiogroup")).toHaveAttribute("data-layout", "wrap");
  expect(() =>
    rerender(
      <SegmentedControl
        label="Category"
        layout="wrap"
        options={tooManyOptions}
      />,
    ),
  ).toThrow(/six/);
});

test("a zero count is visible and included in the name", () => {
  render(
    <SegmentedControl
      label="Category"
      options={[{ id: "empty", label: "Empty", count: 0 }]}
    />,
  );
  expect(screen.getByRole("radio", { name: "Empty, 0" })).toHaveTextContent(
    "Empty0",
  );
});

test("pills always wrap and keep the six-option limit", () => {
  const props = { label: "Category", options, variant: "pills" as const };
  const { rerender } = render(<SegmentedControl {...props} />);
  const group = screen.getByRole("radiogroup", { name: "Category" });
  expect(group).toHaveAttribute("data-variant", "pills");
  expect(group).toHaveAttribute("data-layout", "wrap");
  const invalid = {
    ...props,
    layout: "inline" as const,
    options: tooManyOptions,
  };
  expect(() => rerender(<SegmentedControl {...invalid} />)).toThrow(/six/);
});

test("pills mark only the selected radio without changing its name or form value", async () => {
  const user = userEvent.setup();
  const choices = [
    { id: "comparison", label: "A comparison", count: 5 },
    { id: "summary", label: "A summary", count: 0 },
  ] as const;
  const props = {
    label: "Expected answer",
    name: "answer",
    variant: "pills" as const,
    options: choices,
  };
  render(<SegmentedControl {...props} />);
  const comparison = screen.getByRole("radio", { name: "A comparison, 5" });
  const summary = screen.getByRole("radio", { name: "A summary, 0" });
  const check = (radio: HTMLElement) =>
    radio.querySelector(".bd-segment-check[aria-hidden]");
  const labelRun = (radio: HTMLElement) => check(radio)?.parentElement;

  expect(comparison).toHaveAttribute("aria-checked", "true");
  expect(labelRun(comparison)?.textContent).toBe("✓\u00a0A comparison");
  expect(check(summary)).toBeNull();
  expect(document.querySelector('input[name="answer"]')).toHaveValue(
    "comparison",
  );

  await user.click(summary);
  expect(summary).toHaveAccessibleName("A summary, 0");
  expect(summary).toHaveAttribute("aria-checked", "true");
  expect(labelRun(summary)?.textContent).toBe("✓\u00a0A summary");
  expect(summary.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(0);
  expect(check(comparison)).toBeNull();
  expect(document.querySelector('input[name="answer"]')).toHaveValue("summary");
});

test("pills preserve invalid description and disabled radio semantics", () => {
  const disabledOptions = [
    { id: "housing", label: "Housing", icon: "search", count: 5 },
    { id: "travel", label: "Travel", icon: "menu", count: 0, isDisabled: true },
  ] as const;
  const props = {
    label: "Category",
    variant: "pills" as const,
    isInvalid: true,
    errorMessage: "Choose an available category",
    options: disabledOptions,
  };
  render(<SegmentedControl {...props} />);
  const group = screen.getByRole("radiogroup", { name: "Category" });
  expect(group).toHaveAccessibleDescription("Choose an available category");
  expect(screen.getByRole("radio", { name: "Travel, 0" })).toBeDisabled();
  expect(screen.getByRole("radio", { name: "Housing, 5" })).toBeEnabled();
});

test("SegmentedControl exposes its selected visual variant", () => {
  const props = {
    label: "Category",
    options: [{ id: "all", label: "All" }],
  };
  const { rerender } = render(<SegmentedControl {...props} />);
  expect(screen.getByRole("radiogroup", { name: "Category" })).toHaveAttribute(
    "data-variant",
    "default",
  );
  expect(
    screen.getByRole("radio", { name: "All" }).querySelector("svg"),
  ).toBeNull();
  rerender(<SegmentedControl {...props} variant="track" />);
  expect(screen.getByRole("radiogroup", { name: "Category" })).toHaveAttribute(
    "data-variant",
    "track",
  );
  expect(
    screen.getByRole("radio", { name: "All" }).querySelector("svg"),
  ).toBeNull();
});

for (const layout of ["inline", "wrap"] as const) {
  test(`counts remain visible and named through selection in ${layout}`, async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl
        label="Category"
        layout={layout}
        options={[
          { id: "housing", label: "Housing", count: 5 },
          { id: "empty", label: "Empty", count: 0 },
          { id: "other", label: "Other" },
        ]}
      />,
    );
    const housing = screen.getByRole("radio", { name: "Housing, 5" });
    const empty = screen.getByRole("radio", { name: "Empty, 0" });
    expect(housing).toHaveTextContent("Housing5");
    expect(empty).toHaveTextContent("Empty0");
    expect(screen.getByRole("radio", { name: "Other" })).toHaveTextContent(
      "Other",
    );
    await user.click(empty);
    expect(empty).toHaveAttribute("aria-checked", "true");
    expect(housing).toHaveAttribute("aria-checked", "false");
    expect(empty).toHaveAccessibleName("Empty, 0");
  });
}
