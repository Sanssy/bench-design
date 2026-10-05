import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button";
import { Text } from "../text/Text";
import { Dialog } from "./Dialog";
export default {
  title: "Overlays/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;
type Story = StoryObj<typeof Dialog>;
export const DocumentDetails: Story = {
  args: {
    trigger: <Button>View details</Button>,
    title: "Document details",
    eyebrow: "Collection",
    children: <Text>Review the document before sharing it.</Text>,
  },
  render: function DocumentDetails(args) {
    const [ready, setReady] = useState(false);
    return (
      <Dialog
        {...args}
        actions={
          <>
            <Button variant="primary" onPress={() => setReady(true)}>
              Download
            </Button>
            <p role="status">{ready ? "Local download preview ready" : ""}</p>
            {ready && (
              <Button onPress={() => setReady(false)}>Reset preview</Button>
            )}
          </>
        }
      />
    );
  },
};
export const ReadingGuide: Story = {
  args: {
    trigger: <Button>Read guide</Button>,
    title: "Reading guide",
    children: Array.from(
      { length: 20 },
      (_, index) => `Section ${index + 1}`,
    ).map((section) => (
      <Text key={section}>
        {section}. Organize your collection with clear names and descriptions so
        readers can find and understand each document.
      </Text>
    )),
  },
  render: function ReadingGuide(args) {
    const [ready, setReady] = useState(false);
    return (
      <Dialog
        {...args}
        actions={
          <>
            <Button variant="primary" onPress={() => setReady(true)}>
              Download guide
            </Button>
            <p role="status">{ready ? "Local download preview ready" : ""}</p>
            {ready && (
              <Button onPress={() => setReady(false)}>Reset preview</Button>
            )}
          </>
        }
      />
    );
  },
};

export const ControlledHelp: Story = {
  args: {
    title: "Editing help",
    children: <Text>Use guides to align your composition.</Text>,
  },
  render: function ControlledHelp(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Read editing help</Button>
        <Dialog {...args} isOpen={open} onOpenChange={setOpen} />
      </>
    );
  },
};
