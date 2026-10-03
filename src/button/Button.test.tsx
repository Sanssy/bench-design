import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Button } from "./Button";

test("pointer activation calls onPress once", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  render(<Button onPress={onPress}>Activer</Button>);
  await user.click(screen.getByRole("button", { name: "Activer" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

for (const key of ["{Enter}", " "]) {
  test(`${key} activation calls onPress once`, async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Activer</Button>);
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
      <Button>Activer</Button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Activer" }));
  expect(onSubmit).not.toHaveBeenCalled();
});

test("explicit submit submits its form once", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit">Envoyer</Button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Envoyer" }));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("explicit reset restores the native input value", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <label>
        Nom
        <input defaultValue="Initial" />
      </label>
      <Button type="reset">Réinitialiser</Button>
    </form>,
  );
  const input = screen.getByRole("textbox", { name: "Nom" });
  await user.clear(input);
  await user.type(input, "Modifié");
  await user.click(screen.getByRole("button", { name: "Réinitialiser" }));
  expect(input).toHaveValue("Initial");
});

test("disabled button exposes native disabled semantics", () => {
  render(<Button isDisabled>Activer</Button>);
  expect(screen.getByRole("button", { name: "Activer" })).toBeDisabled();
});

for (const action of ["pointer", "{Enter}", " "]) {
  test(`disabled ${action} does not call onPress`, async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Activer
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Activer" });
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
          Envoyer
        </Button>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Envoyer" });
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
          Nom
          <input defaultValue="Initial" />
        </label>
        <Button isDisabled type="reset">
          Réinitialiser
        </Button>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Nom" });
    await user.clear(input);
    await user.type(input, "Modifié");
    const button = screen.getByRole("button", { name: "Réinitialiser" });
    if (action === "pointer") await user.click(button);
    else {
      input.blur();
      button.focus();
      await user.keyboard(action);
    }
    expect(input).toHaveValue("Modifié");
  });
}

test("content supplies the accessible name", () => {
  render(<Button>Enregistrer</Button>);
  expect(screen.getByRole("button")).toHaveAccessibleName("Enregistrer");
});

for (const mechanism of ["aria-label", "aria-labelledby"] as const) {
  for (const name of ["Enregistrer le document", "Valider"]) {
    test(`${mechanism} preserves native name ${name} without rewriting`, () => {
      render(
        <>
          <span id="button-name">{name}</span>
          <Button
            {...{
              [mechanism]: mechanism === "aria-label" ? name : "button-name",
            }}
          >
            Enregistrer
          </Button>
        </>,
      );
      expect(screen.getByRole("button")).toHaveAccessibleName(name);
      expect(screen.getByRole("button")).toHaveTextContent("Enregistrer");
    });
  }
}

test("aria-labelledby takes precedence over aria-label and content", () => {
  render(
    <>
      <span id="priority-name">Enregistrer le document</span>
      <Button aria-label="Enregistrer ailleurs" aria-labelledby="priority-name">
        Enregistrer
      </Button>
    </>,
  );
  expect(screen.getByRole("button")).toHaveAccessibleName(
    "Enregistrer le document",
  );
});

test("consumer restores focus through the DOM ref", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  render(
    <>
      <Button ref={ref}>Enregistrer</Button>
      <button type="button" onClick={() => ref.current?.focus()}>
        Rendre le focus
      </button>
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Rendre le focus" }));
  expect(screen.getByRole("button", { name: "Enregistrer" })).toHaveFocus();
});
