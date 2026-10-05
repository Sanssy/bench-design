import type { Meta, StoryObj } from "@storybook/react-vite";
import { Overview } from "./Overview.js";

export default {
  title: "Recipes/Overview",
  component: Overview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Overview>;

export const PersonalRecords: StoryObj<typeof Overview> = {};
