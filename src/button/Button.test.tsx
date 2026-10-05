import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { FileTrigger } from "../file-trigger/FileTrigger";
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

for (const position of [undefined, "start", "end"] as const) {
  test(`decorative icon order ${position ?? "default"} preserves name`, () => {
    render(
      <Button icon="plus" {...(position ? { iconPosition: position } : {})}>
        Add item
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Add item" });
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(
      (position === "end" ? button.lastChild : button.firstChild)?.nodeName,
    ).toBe("svg");
  });
}

for (const action of ["pointer", "{Enter}", " "]) {
  test(`pending ${action} is inert, keeps focus and resumes`, async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { rerender } = render(<Button onPress={onPress}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    button.focus();
    rerender(
      <Button isPending onPress={onPress}>
        Save
      </Button>,
    );
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("data-pending", "true");
    expect(button).toHaveFocus();
    expect(button).toHaveAccessibleName("Save");
    if (action === "pointer") await user.click(button);
    else await user.keyboard(action);
    expect(onPress).not.toHaveBeenCalled();
    rerender(<Button onPress={onPress}>Save</Button>);
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).not.toHaveAttribute("data-pending");
  });
}

test("pending submit blocks button submission", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <input aria-label="Name" />
      <Button type="submit" isPending>
        Save
      </Button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  expect(onSubmit).not.toHaveBeenCalled();
});

test("pending reset preserves edited input", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <input aria-label="Name" defaultValue="Initial" />
      <Button type="reset" isPending>
        Reset
      </Button>
    </form>,
  );
  const input = screen.getByRole("textbox");
  await user.clear(input);
  await user.type(input, "Edited");
  await user.click(screen.getByRole("button"));
  expect(input).toHaveValue("Edited");
});

test("pending transitions are announced by React Aria", async () => {
  const { rerender } = render(<Button>Save</Button>);
  const user = userEvent.setup();
  await user.tab();
  rerender(<Button isPending>Save</Button>);
  await waitFor(() =>
    expect(
      document.querySelector(
        `[aria-live="assertive"] [aria-labelledby="${screen.getByRole("button").id}"]`,
      ),
    ).toHaveAccessibleName("Save"),
  );
});

test("end icon preserves FileTrigger activation", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <FileTrigger onSelect={() => {}}>
      <Button icon="plus" iconPosition="end">
        Choose file
      </Button>
    </FileTrigger>,
  );
  const input = container.querySelector('input[type="file"]');
  expect(input).not.toBeNull();
  const click = vi.spyOn(input as HTMLInputElement, "click");
  await user.click(screen.getByRole("button", { name: "Choose file" }));
  expect(click).toHaveBeenCalledTimes(1);
});

for (const name of ["aria-label", "aria-labelledby"] as const) {
  test(`pending preserves explicit ${name}`, () => {
    render(
      <>
        <span id="save-context">Save document</span>
        <Button
          isPending
          {...{
            [name]: name === "aria-label" ? "Save document" : "save-context",
          }}
        >
          Save
        </Button>
      </>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName("Save document");
  });
}
