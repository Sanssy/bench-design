import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Icon } from "../icon/Icon";
import { ActionCard } from "./ActionCard";
export default {
  title: "Surfaces/ActionCard",
  component: ActionCard,
} satisfies Meta<typeof ActionCard>;
type Story = StoryObj<typeof ActionCard>;
export const Archive: Story = {
  args: {
    href: "#archive",
    title: "Field notes",
    description: "Browse notes from the spring workshop.",
    eyebrow: "Archive",
    media: <Icon name="file-text" />,
  },
};
export const CreateNote: Story = {
  render: function CreateNote() {
    const [created, setCreated] = useState(false);
    return (
      <>
        <ActionCard
          title="Create a note"
          description="Start a blank page."
          onPress={() => setCreated(true)}
        />
        <p role="status">{created ? "New note ready." : ""}</p>
      </>
    );
  },
};
export const Unavailable: Story = {
  args: {
    title: "Create a note",
    description: "Creation is temporarily unavailable.",
    onPress: () => {},
    isDisabled: true,
  },
};

export const SuggestedReading: Story = {
  args: {
    href: "#guide",
    title: "Where should I start?",
    eyebrow: "01",
    layout: "stacked",
  },
};

export const EditorialEntity: Story = {
  args: {
    ...Archive.args,
    variant: "editorial",
    tone: "green",
    supportingText: "4 source records",
  },
};
