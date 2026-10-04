import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button.js";
import { ToastRegion, useToast } from "./Toast.js";
export default {
  title: "Feedback/Toast",
  component: ToastRegion,
  parameters: { layout: "centered", docs: { story: { inline: false } } },
} satisfies Meta<typeof ToastRegion>;
type Story = StoryObj<typeof ToastRegion>;
export const SaveDocument: Story = {
  render: () => {
    const toast = useToast();
    return (
      <>
        <Button
          onPress={() =>
            toast.show({
              title: "Document saved",
              description: "Your changes are ready.",
              tone: "success",
            })
          }
        >
          Save document
        </Button>
        <Button
          onPress={() => toast.show({ title: "Link copied", tone: "neutral" })}
        >
          Copy link
        </Button>
        <ToastRegion />
      </>
    );
  },
};
export const RecoverDocument: Story = {
  render: () => {
    const toast = useToast();
    return (
      <>
        <Button
          onPress={() =>
            toast.show({
              title: "Document removed",
              description: "You can restore it.",
              tone: "danger",
              action: { label: "Undo", onPress: () => {} },
            })
          }
        >
          Remove document
        </Button>
        <ToastRegion />
      </>
    );
  },
};
