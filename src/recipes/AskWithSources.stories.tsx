import type { Meta, StoryObj } from "@storybook/react-vite";
import { AskWithSourcesRecipe } from "./AskWithSources.js";

export default {
  title: "Recipes/Ask with sources",
  component: AskWithSourcesRecipe,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AskWithSourcesRecipe>;
export const AskAndRead: StoryObj<typeof AskWithSourcesRecipe> = {};
