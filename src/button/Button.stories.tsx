import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  args: { children: "Activer" },
  parameters: {
    docs: {
      description: {
        component:
          "S1 : activation et types natifs. Styles, états et documentation complète différés à S3/S4.",
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
