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

export const ReorderableResources: Story = {
  render: () => {
    const [ordered, setOrdered] = useState([
      { id: "notes", label: "Field notes" },
      { id: "images", label: "Reference images" },
      { id: "reading", label: "Reading list" },
    ]);
    return (
      <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
        <Tree
          label="Ordered resources"
          items={ordered}
          getItemLabel={(item) => item.label}
          onReorder={(keys, target) => {
            setOrdered((current) => {
              if (keys.includes(target.key)) return current;
              const moving = current.filter((item) => keys.includes(item.id));
              const remaining = current.filter(
                (item) => !keys.includes(item.id),
              );
              const index = remaining.findIndex(
                (item) => item.id === target.key,
              );
              if (index < 0) return current;
              remaining.splice(
                index + (target.position === "after" ? 1 : 0),
                0,
                ...moving,
              );
              return remaining;
            });
          }}
        />
      </div>
    );
  },
};
