import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { MetaList } from "../meta-list/MetaList.js";
import { Inspector } from "./Inspector.js";

export default {
  title: "Collections/Inspector",
  component: Inspector,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Inspector>;
type Story = StoryObj<typeof Inspector>;
export const ResourceDetails: Story = {
  render: () => (
    <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
      <Inspector
        title="Field notes"
        eyebrow="Selected resource"
        sections={[
          {
            id: "details",
            title: "Details",
            meta: "2 fields",
            defaultExpanded: true,
            content: (
              <MetaList
                items={[
                  { term: "Format", details: "Text" },
                  { term: "Source", details: "Research archive" },
                ]}
              />
            ),
          },
          {
            id: "notes",
            title: "Notes",
            content: <p>Observations from the first research session.</p>,
          },
        ]}
        actions={
          <>
            <Button variant="primary">Edit resource</Button>
            <Button>Duplicate</Button>
          </>
        }
      />
    </div>
  ),
};
export const NoSelection: Story = {
  render: () => (
    <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
      <Inspector
        emptyState={
          <EmptyState title="No resource selected">
            Select a resource to inspect its details.
          </EmptyState>
        }
      />
    </div>
  ),
};
