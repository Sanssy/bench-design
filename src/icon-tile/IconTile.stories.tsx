import type { Meta, StoryObj } from "@storybook/react-vite";
import { icons } from "../icon/icons";
import { IconTile } from "./IconTile";

export default {
  title: "Media/IconTile",
  component: IconTile,
  parameters: { layout: "centered" },
  argTypes: { icon: { control: "select", options: Object.keys(icons) } },
  args: { icon: "search" },
} satisfies Meta<typeof IconTile>;
type Story = StoryObj<typeof IconTile>;
export const SearchIllustration: Story = {
  args: { label: "Search", tone: "accent" },
};
export const CategoryMarkers: Story = {
  render: () => (
    <div>
      {(
        [
          "neutral",
          "accent",
          "green",
          "orange",
          "violet",
          "magenta",
          "teal",
          "blue",
        ] as const
      ).map((tone) => (
        <p key={tone}>
          <IconTile icon="file-text" tone={tone} size="sm" />{" "}
          <IconTile icon="file-text" tone={tone} /> {tone}
        </p>
      ))}
    </div>
  ),
};
