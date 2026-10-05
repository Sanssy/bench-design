import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "../heading/Heading";
import { SidePanel } from "../side-panel/SidePanel";
import { Text } from "../text/Text";
import { AppShell } from "./AppShell";

export default {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: {
    header: (
      <Heading level={1} size="lead">
        Reading workspace
      </Heading>
    ),
    footer: <Text>All changes saved</Text>,
  },
} satisfies Meta<typeof AppShell>;
type Story = StoryObj<typeof AppShell>;

export const ShortWorkspace: Story = {
  args: {
    start: {
      label: "Library",
      content: (
        <SidePanel title="Library">
          <Text>Field notes</Text>
          <Text>Reading list</Text>
        </SidePanel>
      ),
    },
    children: (
      <>
        <Heading level={2}>Field notes</Heading>
        <Text>
          Select a collection, read its introduction and keep its details
          nearby.
        </Text>
      </>
    ),
    end: {
      label: "Details",
      content: (
        <SidePanel title="Details">
          <Text>Two documents ready to read.</Text>
        </SidePanel>
      ),
    },
  },
};

export const Workspace: Story = {
  args: {
    start: {
      label: "Library",
      content: (
        <SidePanel title="Library">
          {Array.from({ length: 40 }, (_, index) => index + 1).map((number) => (
            <Text key={`entry-${number}`}>
              Collection {number}: essays and field notes.
            </Text>
          ))}
        </SidePanel>
      ),
    },
    children: (
      <>
        <Heading level={2}>A place for ideas</Heading>
        {Array.from({ length: 40 }, (_, index) => index + 1).map((number) => (
          <Text key={`entry-${number}`}>
            Chapter {number}. Ideas take shape through observation, conversation
            and time. Keep your reading nearby and explore each collection at
            your own pace.
          </Text>
        ))}
      </>
    ),
    end: {
      label: "Details",
      content: (
        <SidePanel title="Details">
          {Array.from({ length: 40 }, (_, index) => index + 1).map((number) => (
            <Text key={`entry-${number}`}>
              Note {number}: a new perspective for your reading.
            </Text>
          ))}
        </SidePanel>
      ),
    },
  },
};
export const Reading: Story = {
  args: {
    footer: undefined,
    children: (
      <>
        <Heading level={2}>A quiet afternoon</Heading>
        <Text>Space to read without side panels.</Text>
      </>
    ),
  },
};
