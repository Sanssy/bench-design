import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Button } from "./Button";

test("pointer activation calls onPress once", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  render(<Button onPress={onPress}>Activate</Button>);
  await user.click(screen.getByRole("button", { name: "Activate" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

for (const key of ["{Enter}", " "]) {
  test(`${key} activation calls onPress once`, async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Activate</Button>);
    await user.tab();
    await user.keyboard(key);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
}

test("default button does not submit its form", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Button>Activate</Button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Activate" }));
  expect(onSubmit).not.toHaveBeenCalled();
});

test("explicit submit submits its form once", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit">Submit</Button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("explicit reset restores the native input value", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <label>
        Name
        <input defaultValue="Initial" />
      </label>
      <Button type="reset">Reset</Button>
    </form>,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  await user.clear(input);
  await user.type(input, "Edited");
  await user.click(screen.getByRole("button", { name: "Reset" }));
  expect(input).toHaveValue("Initial");
});

test("disabled button exposes native disabled semantics", () => {
  render(<Button isDisabled>Activate</Button>);
  expect(screen.getByRole("button", { name: "Activate" })).toBeDisabled();
});

for (const action of ["pointer", "{Enter}", " "]) {
  test(`disabled ${action} does not call onPress`, async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Activate
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Activate" });
    if (action === "pointer") await user.click(button);
    else {
      button.focus();
      await user.keyboard(action);
    }
    expect(onPress).not.toHaveBeenCalled();
  });

  test(`disabled submit ${action} does not submit`, async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button isDisabled type="submit">
          Submit
        </Button>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Submit" });
    if (action === "pointer") await user.click(button);
    else {
      button.focus();
      await user.keyboard(action);
    }
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test(`disabled reset ${action} preserves the edited field`, async () => {
    const user = userEvent.setup();
    render(
      <form>
        <label>
          Name
          <input defaultValue="Initial" />
        </label>
        <Button isDisabled type="reset">
          Reset
        </Button>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    await user.clear(input);
    await user.type(input, "Edited");
    const button = screen.getByRole("button", { name: "Reset" });
    if (action === "pointer") await user.click(button);
    else {
      input.blur();
      button.focus();
      await user.keyboard(action);
    }
    expect(input).toHaveValue("Edited");
  });
}

test("content supplies the accessible name", () => {
  render(<Button>Save</Button>);
  expect(screen.getByRole("button")).toHaveAccessibleName("Save");
});

for (const mechanism of ["aria-label", "aria-labelledby"] as const) {
  for (const name of ["Save the document", "Confirm"]) {
    test(`${mechanism} preserves native name ${name} without rewriting`, () => {
      render(
        <>
          <span id="button-name">{name}</span>
          <Button
            {...{
              [mechanism]: mechanism === "aria-label" ? name : "button-name",
            }}
          >
            Save
          </Button>
        </>,
      );
      expect(screen.getByRole("button")).toHaveAccessibleName(name);
      expect(screen.getByRole("button")).toHaveTextContent("Save");
    });
  }
}

test("aria-labelledby takes precedence over aria-label and content", () => {
  render(
    <>
      <span id="priority-name">Save the document</span>
      <Button aria-label="Save elsewhere" aria-labelledby="priority-name">
        Save
      </Button>
    </>,
  );
  expect(screen.getByRole("button")).toHaveAccessibleName("Save the document");
});

test("consumer restores focus through the DOM ref", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  render(
    <>
      <Button ref={ref}>Save</Button>
      <button type="button" onClick={() => ref.current?.focus()}>
        Restore focus
      </button>
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Restore focus" }));
  expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
});
