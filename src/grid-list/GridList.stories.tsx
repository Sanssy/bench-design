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
      <div style={{ width: "min(var(--bd-measure), calc(100vw - 2rem))" }}>
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
    <div style={{ width: "min(var(--bd-measure), calc(100vw - 2rem))" }}>
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

export const ReorderableResources: Story = {
  render: () => {
    const [ordered, setOrdered] = useState([
      { id: "notes", label: "Field notes" },
      { id: "images", label: "Reference images" },
      { id: "reading", label: "Reading list" },
    ]);
    return (
      <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
        <GridList
          label="Ordered resources"
          items={ordered}
          renderItem={(item) => item.label}
          layout="list"
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
