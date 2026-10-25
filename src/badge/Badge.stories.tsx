import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Inline } from "../inline/Inline";
import { Text } from "../text/Text";
import { Badge } from "./Badge";
export default {
  title: "Feedback/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "neutral",
        "success",
        "warning",
        "danger",
        "teal",
        "magenta",
        "orange",
        "violet",
        "green",
        "blue",
      ],
    },
  },
} satisfies Meta<typeof Badge>;
type Story = StoryObj<typeof Badge>;
export const DocumentCount: Story = {
  args: { children: 12, variant: "outline" },
  render: (args) => (
    <Inline gap={8} align="center">
      <Text as="span">Documents</Text>
      <Badge {...args} />
    </Inline>
  ),
};
export const PublicationStates: Story = {
  args: { children: "Published", tone: "success" },
  render: () => (
    <Inline gap={8} align="center">
      <Badge tone="success" variant="solid">
        Published
      </Badge>
      <Badge tone="warning">Draft</Badge>
      <Badge tone="danger">Blocked</Badge>
      <Badge variant="solid">SVG</Badge>
    </Inline>
  ),
};

export const RelatedTopics: Story = {
  render: () => (
    <div
      style={
        {
          "--bd-metadata-radius": "999px",
          "--bd-metadata-padding-vertical": "2px",
          "--bd-metadata-padding-horizontal": "10px",
          "--bd-metadata-gap": "6px",
          "--bd-badge-min-height": "0px",
        } as CSSProperties
      }
    >
      <Inline gap={8}>
        <Badge variant="meta" icon="file-text">
          PDF
        </Badge>
        {(
          [
            "neutral",
            "teal",
            "magenta",
            "orange",
            "violet",
            "green",
            "blue",
          ] as const
        ).map((tone) => (
          <Badge key={tone} variant="tag" tone={tone} icon="link">
            Related research and supporting documentation
          </Badge>
        ))}
      </Inline>
    </div>
  ),
};
