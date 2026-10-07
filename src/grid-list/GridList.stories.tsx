import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { Text } from "../text/Text.js";
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
  parameters: { fullWidth: true, layout: "centered" },
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

export const WideResourceCards: Story = {
  render: () => (
    <div
      style={{ width: "min(calc(var(--bd-measure) * 2), calc(100vw - 2rem))" }}
    >
      <GridList
        label="Resources"
        items={[
          ...items,
          { id: "e", label: "Research archive" },
          { id: "f", label: "Source index" },
        ]}
        columns={4}
        selectionVariant="strong"
        selectionMode="single"
        defaultSelectedKeys={["a"]}
        renderItem={(item) => <strong>{item.label}</strong>}
      />
    </div>
  ),
};

export const StrongSelectionDetails: Story = {
  render: () => (
    <GridList
      label="Fields"
      items={items}
      layout="list"
      itemVariant="ruled"
      selectionVariant="strong"
      selectionMode="single"
      defaultSelectedKeys={["a"]}
      renderItem={(item) => (
        <>
          <Text>
            <strong>{item.label}</strong>
          </Text>
          <Text tone="muted" size="meta">
            Updated weekly
          </Text>
        </>
      )}
    />
  ),
};

export const AccentSelectionDetails: Story = {
  render: () => (
    <GridList
      label="Fields"
      items={items}
      layout="list"
      itemVariant="ruled"
      selectionMode="single"
      defaultSelectedKeys={["a"]}
      renderItem={(item) => (
        <>
          <Text>
            <strong>{item.label}</strong>
          </Text>
          <Text tone="muted" size="meta">
            Updated weekly
          </Text>
        </>
      )}
    />
  ),
};

export const MediaCards: Story = {
  render: () => (
    <div
      style={{ width: "min(calc(var(--bd-measure) * 2), calc(100vw - 2rem))" }}
    >
      <GridList
        label="Resource previews"
        items={items}
        columns={4}
        itemPadding="none"
        renderPreview={(item) => <strong>{item.label}</strong>}
        renderItem={(item) => <strong>{item.label}</strong>}
        renderFooter={() => <span>Updated today</span>}
      />
    </div>
  ),
};

export const RuledResources: Story = {
  render: () => (
    <GridList
      label="Resources"
      items={items}
      layout="list"
      itemVariant="ruled"
      renderItem={(item) => item.label}
    />
  ),
};
