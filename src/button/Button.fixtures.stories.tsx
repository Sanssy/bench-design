import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { userEvent } from "storybook/test";
import { Button } from "./Button";

export default {
  title: "Tests/Button",
  // Harness for browser and visual tests: reachable by URL, hidden from the sidebar.
  tags: ["!dev", "!autodocs"],
  component: Button,
  args: { children: "Activer" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Fixtures des tests navigateur et des captures visuelles. Pas des exemples d’usage : voir Components/Button.",
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
// play uses actual interactions, preserving React Aria ownership of state.
const visualStory = (
  variant: "primary" | "secondary",
  state: "rest" | "hover" | "pressed" | "focus" | "disabled",
): Story => ({
  args: { variant, children: "Enregistrer", isDisabled: state === "disabled" },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button");
    if (!button) throw new Error("Button story has no button");
    if (state === "hover") await userEvent.hover(button);
    if (state === "focus" || state === "pressed") {
      await userEvent.tab();
      if (document.activeElement !== button) button.focus();
    }
    if (state === "pressed") await userEvent.keyboard("[Space>]");
  },
});
export const PrimaryRest = visualStory("primary", "rest");
export const PrimaryHover = visualStory("primary", "hover");
export const PrimaryPressed = visualStory("primary", "pressed");
export const PrimaryFocus = visualStory("primary", "focus");
export const PrimaryDisabled = visualStory("primary", "disabled");
export const SecondaryRest = visualStory("secondary", "rest");
export const SecondaryHover = visualStory("secondary", "hover");
export const SecondaryPressed = visualStory("secondary", "pressed");
export const SecondaryFocus = visualStory("secondary", "focus");
export const SecondaryDisabled = visualStory("secondary", "disabled");
