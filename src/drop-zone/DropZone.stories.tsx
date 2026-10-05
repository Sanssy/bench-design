import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { DropZone } from "./DropZone.js";

export default {
  title: "Import/DropZone",
  component: DropZone,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DropZone>;
type Story = StoryObj<typeof DropZone>;
export const UploadDocuments: Story = {
  args: {
    label: "Drop documents here",
    description: "Choose files or drag them into this area.",
    acceptedFileTypes: [".txt", ".pdf"],
    maxSize: 10000000,
    allowsMultiple: true,
    onDrop: () => {},
  },
  render: function UploadDocuments(args) {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <>
        <DropZone {...args} onDrop={setFiles} />
        <p role="status">{files.map((file) => file.name).join(", ")}</p>
        {files.length > 0 && (
          <Button onPress={() => setFiles([])}>Clear files</Button>
        )}
      </>
    );
  },
};
export const Unavailable: Story = {
  args: {
    label: "Upload unavailable",
    description: "File import is currently unavailable.",
    isDisabled: true,
    onDrop: () => {},
  },
};
