import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { GridList } from "./GridList.js";

const items = [
  { id: "a", label: "Field notes" },
  { id: "b", label: "Reference images" },
  { id: "c", label: "Reading list" },
  { id: "d", label: "Draft outlines" },
];
export default {
  title: "Collections/GridList",
  component: GridList,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GridList>;
type Story = StoryObj<typeof GridList>;
export const ResourceCards: Story = {
  render: () => {
    const [opened, setOpened] = useState<string>();
    return (
      <div style={{ width: "var(--bd-measure)", maxWidth: "100%" }}>
        <GridList
          label="Resources"
          items={items}
          selectionMode="multiple"
          onAction={(key) =>
            setOpened(items.find((item) => item.id === key)?.label)
          }
          renderItem={(item) => <strong>{item.label}</strong>}
          selectionBar={(keys) => (
            <>
              <span>{keys.length} selected</span>
              <Button variant="secondary">Export selected</Button>
            </>
          )}
        />
        {opened && <p>Opened {opened}</p>}
      </div>
    );
  },
};
export const ResourceList: Story = {
  render: () => (
    <div style={{ width: "var(--bd-measure)", maxWidth: "100%" }}>
      <GridList
        label="Resources"
        items={items}
        layout="list"
        selectionMode="single"
        defaultSelectedKeys={["b"]}
        renderItem={(item) => item.label}
      />
      <GridList
        label="Archived resources"
        items={[]}
        renderItem={() => null}
        renderEmpty={() => <p>No archived resources.</p>}
      />
    </div>
  ),
};
