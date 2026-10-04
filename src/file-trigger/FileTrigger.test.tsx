import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button.js";
import { FileTrigger } from "./FileTrigger.js";

test("file selection reaches the consumer", () => {
  const selected = vi.fn();
  const { container } = render(
    <FileTrigger onSelect={selected}>
      <Button>Add files</Button>
    </FileTrigger>,
  );
  const input = container.querySelector('input[type="file"]');
  expect(input).not.toBeNull();
  if (!input) throw new Error("Missing file input");
  const file = new File(["text"], "notes.txt");
  fireEvent.change(input, { target: { files: [file] } });
  expect(selected).toHaveBeenCalledWith([file]);
});
test("picker metadata follows the public options", () => {
  const { container } = render(
    <FileTrigger
      acceptedFileTypes={["image/*"]}
      allowsMultiple
      onSelect={vi.fn()}
    >
      <Button>Add images</Button>
    </FileTrigger>,
  );
  expect(container.querySelector("input")).toHaveAttribute("accept", "image/*");
  expect(container.querySelector("input")).toHaveAttribute("multiple");
});

test("Tab reaches the trigger and Enter activates the native picker", async () => {
  const { container } = render(
    <FileTrigger onSelect={vi.fn()}>
      <Button>Add files</Button>
    </FileTrigger>,
  );
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error("Missing input");
  const click = vi.spyOn(input as HTMLInputElement, "click");
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Add files" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(click).toHaveBeenCalledOnce();
});
