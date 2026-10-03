import type { Meta, StoryObj } from "@storybook/react-vite";
import { Palette as ColorPalette } from "../.storybook/Foundations";

export default { title: "Foundations/Colors" } satisfies Meta;
export const Palette: StoryObj = {
  render: (_, { globals }) => <ColorPalette theme={globals.theme} />,
};
