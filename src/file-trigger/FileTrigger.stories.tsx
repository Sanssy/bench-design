import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { FileTrigger } from "./FileTrigger.js";
export default {
  title: "Import/FileTrigger",
  component: FileTrigger,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FileTrigger>;
type Story = StoryObj<typeof FileTrigger>;
export const SelectDocument: Story = {
  render: function SelectDocument() {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <>
        <FileTrigger acceptedFileTypes={[".txt", ".pdf"]} onSelect={setFiles}>
          <Button>Add document</Button>
        </FileTrigger>
        <p role="status">{files.map((file) => file.name).join(", ")}</p>
        {files.length > 0 && (
          <Button onPress={() => setFiles([])}>Clear files</Button>
        )}
      </>
    );
  },
};
export const SelectImages: Story = {
  render: function SelectImages() {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <>
        <FileTrigger
          acceptedFileTypes={["image/*"]}
          allowsMultiple
          onSelect={setFiles}
        >
          <Button variant="primary">Add images</Button>
        </FileTrigger>
        <p role="status">{files.map((file) => file.name).join(", ")}</p>
        {files.length > 0 && (
          <Button onPress={() => setFiles([])}>Clear files</Button>
        )}
      </>
    );
  },
};
