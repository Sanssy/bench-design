import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";
import { type IconName, icons } from "./icons";
export default {
  title: "Media/Icon",
  component: Icon,
  parameters: { layout: "centered" },
  args: { name: "search" },
} satisfies Meta<typeof Icon>;
type Story = StoryObj<typeof Icon>;
export const Gallery: Story = {
  render: () => (
    <div>
      {(Object.keys(icons) as IconName[]).map((name) => (
        <p key={name}>
          <Icon name={name} /> {name}
        </p>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div>
      {([16, 20, 24] as const).map((size) => (
        <p key={size}>
          <Icon name="search" size={size} label="Search" /> {size} px
        </p>
      ))}
    </div>
  ),
};
