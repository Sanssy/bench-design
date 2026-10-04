import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DropZone } from "./DropZone.js";

test("picker rejects type and size, accepts valid files and clears rejection", () => {
  const drop = vi.fn(),
    reject = vi.fn();
  const { container } = render(
    <DropZone
      label="Upload files"
      acceptedFileTypes={[".txt"]}
      maxSize={4}
      allowsMultiple
      onDrop={drop}
      onReject={reject}
    />,
  );
  const input = container.querySelector('input[type="file"]');
  expect(input).not.toBeNull();
  if (!input) throw new Error("Missing file input");
  const type = new File(["x"], "image.png"),
    size = new File(["12345"], "large.txt"),
    valid = new File(["ok"], "note.txt");
  fireEvent.change(input, { target: { files: [type, size, valid] } });
  expect(reject).toHaveBeenCalledWith([
    { file: type, reason: "type" },
    { file: size, reason: "size" },
  ]);
  expect(drop).toHaveBeenCalledWith([valid]);
  expect(screen.getByRole("alert")).toHaveTextContent("✕");
  fireEvent.change(input, { target: { files: [valid] } });
  expect(screen.queryByRole("alert")).toBeNull();
});
test("disabled picker cannot be activated", () => {
  render(<DropZone label="Upload" isDisabled onDrop={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Add files" })).toBeDisabled();
});
for (const acceptedFileTypes of [["image/*"], ["image/png"], [".PNG"]])
  test(`accepts ${acceptedFileTypes[0]}`, () => {
    const drop = vi.fn();
    const { container } = render(
      <DropZone
        label="Images"
        acceptedFileTypes={acceptedFileTypes}
        onDrop={drop}
      />,
    );
    const input = container.querySelector("input");
    if (!input) throw new Error("Missing input");
    const file = new File(["png"], "photo.PNG", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(drop).toHaveBeenCalledWith([file]);
  });
test("single selection only delivers the first accepted file", () => {
  const drop = vi.fn();
  const { container } = render(<DropZone label="File" onDrop={drop} />);
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing input");
  const one = new File(["1"], "one.txt"),
    two = new File(["2"], "two.txt");
  fireEvent.change(input, { target: { files: [one, two] } });
  expect(drop).toHaveBeenCalledWith([one]);
});

test("disabled zone keeps muted text without reducing opacity", () => {
  const style = document.createElement("style");
  style.textContent = readFileSync("public/surfaces.css", "utf8");
  document.head.append(style);
  try {
    const { container } = render(
      <DropZone label="Unavailable" isDisabled onDrop={vi.fn()} />,
    );
    const zone = container.querySelector(".bd-drop-zone");
    if (!zone) throw new Error("Missing zone");
    expect(Number(getComputedStyle(zone).opacity || 1)).toBe(1);
    const rule = Array.from(style.sheet?.cssRules ?? []).find(
      (rule) =>
        rule instanceof CSSStyleRule &&
        rule.selectorText === ".bd-drop-zone[data-disabled]",
    ) as CSSStyleRule | undefined;
    expect(rule?.style.getPropertyValue("color")).toBe("var(--bd-text-muted)");
  } finally {
    style.remove();
  }
});

for (const entry of ["native", "file-fallback", "synthetic-null"] as const)
  test(`dragged file with ${entry} entry`, async () => {
    const drop = vi.fn(),
      reject = vi.fn();
    const { container } = render(
      <DropZone
        label="Upload"
        acceptedFileTypes={[".txt"]}
        onDrop={drop}
        onReject={reject}
      />,
    );
    const zone = container.querySelector(".bd-drop-zone");
    if (!zone) throw new Error("Missing zone");
    const file = new File(["bad"], "image.png", { type: "image/png" });
    const dataTransfer = {
      items: [
        {
          kind: "file",
          type: file.type,
          getAsFile: () => file,
          webkitGetAsEntry:
            entry === "file-fallback"
              ? undefined
              : () =>
                  entry === "native"
                    ? { isFile: true, isDirectory: false }
                    : null,
        },
      ],
      types: ["Files"],
      effectAllowed: "all",
      dropEffect: "none",
    };
    fireEvent.dragEnter(zone, { dataTransfer });
    fireEvent.dragOver(zone, { dataTransfer });
    expect(zone).toHaveAttribute("data-drop-target", "true");
    fireEvent.drop(zone, { dataTransfer });
    if (entry !== "synthetic-null") {
      expect(await screen.findByRole("alert")).toHaveTextContent("image.png");
      expect(reject).toHaveBeenCalledWith([{ file, reason: "type" }]);
    } else {
      await Promise.resolve();
      expect(reject).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).toBeNull();
    }
    expect(drop).not.toHaveBeenCalled();
  });

test("shows formats and size in readable units, one rejection per line", async () => {
  const { container } = render(
    <DropZone
      label="Drop documents"
      acceptedFileTypes={["application/pdf", "image/png"]}
      maxSize={20_000_000}
      allowsMultiple
      onDrop={() => {}}
    />,
  );
  expect(screen.getByText("PDF, PNG · 20 MB max.")).toBeVisible();
  const input = container.querySelector("input[type=file]") as HTMLInputElement;
  await userEvent.upload(
    input,
    [
      new File(["a"], "scan.heic", { type: "image/heic" }),
      new File(["b"], "notes.txt", { type: "text/plain" }),
    ],
    { applyAccept: false },
  );
  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent(
    "✕ scan.heic: this format is not accepted. Use PDF, PNG.",
  );
});
