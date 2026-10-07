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

export const AddDocuments: Story = {
  args: {
    trigger: <Button>Add documents</Button>,
    title: (
      <>
        Add <em>documents</em>
      </>
    ),
    placement: "end",
    children: (
      <>
        <Text>Choose documents to add to your collection.</Text>
        <Button>Choose files</Button>
      </>
    ),
  },
};
export const WideSheet: Story = {
  args: {
    ...ReadingGuide.args,
    trigger: <Button>Open reading workspace</Button>,
    title: "Reading workspace",
    placement: "end",
    size: "wide",
  },
};
export const WideDialog: Story = {
  args: { ...ReadingGuide.args, size: "wide" },
};

export const ViewNavigation: Story = {
  args: {
    title: "Overview",
    placement: "end",
    trigger: <Button>Open overview</Button>,
  },
  render: function ViewNavigation(args) {
    const [detail, setDetail] = useState(false);
    return (
      <Dialog
        {...args}
        title={detail ? "Source details" : "Overview"}
        eyebrow={detail ? "Source" : "Summary"}
        {...(detail
          ? { backLabel: "Back to overview", onBack: () => setDetail(false) }
          : {})}
      >
        {detail ? (
          <Text>Read the source description and its supporting context.</Text>
        ) : (
          <>
            <Text>Explore the source behind this summary.</Text>
            <Button onPress={() => setDetail(true)}>Read source</Button>
          </>
        )}
      </Dialog>
    );
  },
};
