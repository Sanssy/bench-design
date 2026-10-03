import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  args: { children: "Activer" },
  parameters: {
    docs: {
      description: {
        component:
          "Activation, désactivation, noms accessibles, ref et focus. Styles des variantes différés à S4.",
      },
    },
  },
} satisfies Meta<typeof Button>;
type Story = StoryObj<typeof Button>;

export const Activation: Story = {
  render: function Activation() {
    const [count, setCount] = useState(0);
    return (
      <main>
        <Button onPress={() => setCount((value) => value + 1)}>Activer</Button>
        <p role="status">Activations: {count}</p>
      </main>
    );
  },
};
export const Form: Story = {
  render: function Form() {
    const [submissions, setSubmissions] = useState(0);
    return (
      <main>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmissions((value) => value + 1);
          }}
        >
          <label>
            Nom
            <input defaultValue="Initial" />
          </label>
          <Button>Action</Button>
          <Button type="submit">Envoyer</Button>
          <Button type="reset">Réinitialiser</Button>
        </form>
        <p role="status">Soumissions: {submissions}</p>
      </main>
    );
  },
};

export const Disabled: Story = {
  name: "Désactivé",
  render: function Disabled() {
    const [activations, setActivations] = useState(0);
    const [submissions, setSubmissions] = useState(0);
    const [resets, setResets] = useState(0);
    return (
      <main>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmissions((value) => value + 1);
          }}
          onReset={() => setResets((value) => value + 1)}
        >
          <label>
            Nom
            <input defaultValue="Initial" />
          </label>
          <Button
            isDisabled
            onPress={() => setActivations((value) => value + 1)}
          >
            Activer
          </Button>
          <Button isDisabled type="submit">
            Envoyer
          </Button>
          <Button isDisabled type="reset">
            Réinitialiser
          </Button>
        </form>
        <p role="status">
          Activations: {activations}; Soumissions: {submissions};
          Réinitialisations: {resets}
        </p>
      </main>
    );
  },
};

export const ShortContent: Story = { args: { children: "Enregistrer" } };
export const LongContent: Story = {
  args: {
    children:
      "Enregistrer toutes les modifications du document et revenir à la liste des documents disponibles — RéférenceSansEspaceABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  },
  render: function LongContent(args) {
    const [count, setCount] = useState(0);
    return (
      <main>
        <Button {...args} onPress={() => setCount((value) => value + 1)} />
        <p role="status">Activations: {count}</p>
      </main>
    );
  },
};
export const AccessibleName: Story = {
  render: () => (
    <>
      <span id="save-label">Enregistrer le document</span>
      <Button aria-label="Enregistrer ailleurs" aria-labelledby="save-label">
        Enregistrer
      </Button>
    </>
  ),
};
export const RestoreFocus: Story = {
  render: function RestoreFocus() {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <>
        <Button ref={ref}>Enregistrer</Button>
        <Button onPress={() => ref.current?.focus()}>Rendre le focus</Button>
      </>
    );
  },
};
