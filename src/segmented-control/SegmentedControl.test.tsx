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
        options={Array.from({ length: 7 }, (_, i) => ({
          id: String(i),
          label: String(i),
        }))}
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
  const { rerender } = render(
    <SegmentedControl label="Category" options={options} variant="pills" />,
  );
  const group = screen.getByRole("radiogroup", { name: "Category" });
  expect(group).toHaveAttribute("data-variant", "pills");
  expect(group).toHaveAttribute("data-layout", "wrap");

  expect(() =>
    rerender(
      <SegmentedControl
        label="Category"
        layout="inline"
        variant="pills"
        options={Array.from({ length: 7 }, (_, i) => ({
          id: String(i),
          label: String(i),
        }))}
      />,
    ),
  ).toThrow(/six/);
});

test("pills mark only the selected radio without changing its name or form value", async () => {
  const user = userEvent.setup();
  render(
    <SegmentedControl
      label="Expected answer"
      name="answer"
      variant="pills"
      options={[
        { id: "comparison", label: "A comparison", icon: "search", count: 5 },
        { id: "summary", label: "A summary", icon: "menu", count: 0 },
      ]}
    />,
  );
  const comparison = screen.getByRole("radio", { name: "A comparison, 5" });
  const summary = screen.getByRole("radio", { name: "A summary, 0" });
  const check = (radio: HTMLElement) =>
    radio.querySelector('svg path[d^="M4.7311"]');

  expect(comparison).toHaveAttribute("aria-checked", "true");
  expect(check(comparison)).toBeInTheDocument();
  expect(check(summary)).toBeNull();
  expect(document.querySelector('input[name="answer"]')).toHaveValue(
    "comparison",
  );

  await user.click(summary);
  expect(summary).toHaveAccessibleName("A summary, 0");
  expect(summary).toHaveAttribute("aria-checked", "true");
  expect(check(summary)).toBeInTheDocument();
  expect(summary.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  expect(check(comparison)).toBeNull();
  expect(document.querySelector('input[name="answer"]')).toHaveValue("summary");
});

test("pills preserve invalid description and disabled radio semantics", () => {
  render(
    <SegmentedControl
      label="Category"
      variant="pills"
      isInvalid
      errorMessage="Choose an available category"
      options={[
        { id: "housing", label: "Housing", icon: "search", count: 5 },
        {
          id: "travel",
          label: "Travel",
          icon: "menu",
          count: 0,
          isDisabled: true,
        },
      ]}
    />,
  );
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
