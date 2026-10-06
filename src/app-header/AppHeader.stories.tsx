import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "../app-shell/AppShell.js";
import { Button } from "../button/Button.js";
import { Heading } from "../heading/Heading.js";
import { Link } from "../link/Link.js";
import { TopNav } from "../top-nav/TopNav.js";
import { AppHeader } from "./AppHeader.js";

export default {
  parameters: { fullWidth: true },
  title: "Layout/AppHeader",
  component: AppHeader,
  args: {
    brand: <Link href="#home">Workspace</Link>,
    navigation: (
      <TopNav
        label="Main pages"
        currentId="browse"
        items={[
          { id: "browse", label: "Browse", href: "#browse" },
          { id: "saved", label: "Saved", href: "#saved", count: 123 },
        ]}
      />
    ),
  },
} satisfies Meta<typeof AppHeader>;
type Story = StoryObj<typeof AppHeader>;
export const Basic: Story = {};
export const WithUtilities: Story = {
  args: {
    actions: <Button variant="secondary">Account</Button>,
    meta: "Online",
  },
};
export const Workspace: Story = {
  parameters: { layout: "fullscreen" },
  args: {
    brand: <Link href="#home">Research workspace</Link>,
    navigation: (
      <TopNav
        label="Main pages"
        currentId="browse"
        items={[
          {
            id: "browse",
            label: "Browse all available resources",
            href: "#browse",
          },
          {
            id: "saved",
            label: "Saved collections and references",
            href: "#saved",
            count: 123,
          },
        ]}
      />
    ),
    actions: <Button variant="secondary">Account</Button>,
    meta: "Online",
  },
  render: (args) => (
    <AppShell header={<AppHeader {...args} />}>
      <Heading level={1}>Your collections</Heading>
    </AppShell>
  ),
};
