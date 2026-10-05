import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../avatar/Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";
export default {
  title: "Data/AvatarGroup",
  component: AvatarGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof AvatarGroup>;
type Story = StoryObj<typeof AvatarGroup>;
export const Collaborators: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
    </AvatarGroup>
  ),
};
export const LimitedCollaborators: Story = {
  render: () => (
    <AvatarGroup max={2}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
    </AvatarGroup>
  ),
};

export const CompactCollaborators: Story = {
  render: () => (
    <AvatarGroup max={1}>
      <Avatar name="Ada Lovelace" size={24} />
      <Avatar name="Grace Hopper" size={24} />
    </AvatarGroup>
  ),
};
export const LargeCollaborators: Story = {
  render: () => (
    <AvatarGroup max={1}>
      <Avatar name="Ada Lovelace" size={40} />
      <Avatar name="Grace Hopper" size={40} />
    </AvatarGroup>
  ),
};
