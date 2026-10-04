import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar.js";

export default {
  title: "Data/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Avatar>;
type Story = StoryObj<typeof Avatar>;
export const Person: Story = {
  args: { name: "Ada Lovelace" },
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--bd-space-8)",
      }}
    >
      <Avatar
        {...args}
        src={
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="13" r="7"/><path d="M6 40v-6a14 14 0 0 1 28 0v6z"/></svg>',
          )
        }
      />
      <Avatar name="Grace Hopper" isDecorative />
      <span>Grace Hopper</span>
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--bd-space-16)",
      }}
    >
      {([24, 32, 40] as const).map((size) => (
        <Avatar key={size} name="Grace Hopper" size={size} />
      ))}
    </div>
  ),
};
