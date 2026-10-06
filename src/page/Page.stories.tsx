import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppHeader } from "../app-header/AppHeader";
import { Heading } from "../heading/Heading";
import { Text } from "../text/Text";
import { Page } from "./Page";

export default {
  title: "Layout/Page",
  component: Page,
  parameters: { layout: "fullscreen" },
  args: {
    header: (
      <AppHeader brand="Archive" navigation={<a href="#reading">Reading</a>} />
    ),
    footer: <Text>Collected essays and field notes.</Text>,
    children: (
      <>
        <Heading level={1}>A place for ideas</Heading>
        {Array.from({ length: 40 }, (_, index) => index + 1).map((number) => (
          <Text key={`chapter-${number}`}>
            Chapter {number}. Observation and conversation bring new
            perspectives to everyday life. Take time to read and explore.
          </Text>
        ))}
      </>
    ),
  },
} satisfies Meta<typeof Page>;
type Story = StoryObj<typeof Page>;
export const Document: Story = {};
export const Narrow: Story = { args: { width: "narrow" } };
export const ContentOnly: Story = {
  args: {
    header: undefined,
    footer: undefined,
    children: (
      <>
        <Heading level={1}>A quiet afternoon</Heading>
        <Text>Space for a short reading.</Text>
      </>
    ),
  },
};
