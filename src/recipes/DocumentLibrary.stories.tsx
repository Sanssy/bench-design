import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocumentLibrary } from "./DocumentLibrary.js";
export default {
  title: "Recipes/Document library",
  component: DocumentLibrary,
  parameters: { fullWidth: true, layout: "fullscreen" },
} satisfies Meta<typeof DocumentLibrary>;
export const BrowseDocuments: StoryObj<typeof DocumentLibrary> = {};
