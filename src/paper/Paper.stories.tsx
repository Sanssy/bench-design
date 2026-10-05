import type { Meta, StoryObj } from "@storybook/react-vite";
import { Paper } from "./Paper";
export default { title: "Layout/Paper", component: Paper } satisfies Meta<
  typeof Paper
>;
type Story = StoryObj<typeof Paper>;
export const Document: Story = {
  args: {
    children: (
      <>
        <h2>Document excerpt</h2>
        <p>
          Highlighted passage: <mark>Keep a copy of the signed document.</mark>
        </p>
        <p>Record the publication date alongside the full reference.</p>
      </>
    ),
  },
};
