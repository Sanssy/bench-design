import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tree, type TreeNode } from "./Tree.js";

const items: TreeNode[] = [
  {
    id: "resources",
    label: "Resources",
    count: 3,
    children: [
      { id: "notes", label: "Field notes" },
      { id: "images", label: "Reference images" },
      { id: "reading", label: "Reading list" },
    ],
  },
  {
    id: "archive",
    label: "Archive",
    count: 1,
    children: [{ id: "drafts", label: "Draft outlines" }],
  },
];
export default {
  title: "Collections/Tree",
  component: Tree,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tree>;
type Story = StoryObj<typeof Tree>;
export const ResourceFolders: Story = {
  render: () => {
    const [opened, setOpened] = useState<string>();
    return (
      <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
        <Tree
          label="Resource folders"
          items={items}
          selectionMode="single"
          onAction={setOpened}
        />
        {opened && <p>Opened {opened}</p>}
      </div>
    );
  },
};
export const ExpandedFolders: Story = {
  render: () => {
    const [keys, setKeys] = useState<string[]>(["notes"]);
    return (
      <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
        <Tree
          label="Selected folders"
          items={items}
          defaultExpandedKeys={["resources", "archive"]}
          selectionMode="multiple"
          selectedKeys={keys}
          onSelectionChange={setKeys}
        />
        <Tree label="Empty folders" items={[]} />
      </div>
    );
  },
};
