import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button.js";
import { FileTrigger } from "./FileTrigger.js";
export default {
  title: "Import/FileTrigger",
  component: FileTrigger,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FileTrigger>;
type Story = StoryObj<typeof FileTrigger>;
export const SelectDocument: Story = {
  render: () => (
    <FileTrigger acceptedFileTypes={[".txt", ".pdf"]} onSelect={() => {}}>
      <Button>Add document</Button>
    </FileTrigger>
  ),
};
export const SelectImages: Story = {
  render: () => (
    <FileTrigger
      acceptedFileTypes={["image/*"]}
      allowsMultiple
      onSelect={() => {}}
    >
      <Button variant="primary">Add images</Button>
    </FileTrigger>
  ),
};
