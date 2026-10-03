import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  args: { children: "Enregistrer" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };

export const Disabled: Story = {
  name: "Désactivé",
  args: { isDisabled: true },
};

export const Variants: Story = {
  name: "Variantes",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--bd-space-16)",
        alignItems: "center",
      }}
    >
      <Button variant="primary">Enregistrer</Button>
      <Button variant="secondary">Annuler</Button>
      <Button isDisabled>Indisponible</Button>
    </div>
  ),
};
