import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { Stack } from "../stack/Stack.js";
import { ComboBox } from "./ComboBox.js";

const documents = Array.from({ length: 10_000 }, (_, index) => ({
  id: String(index),
  label: `Document ${String(index).padStart(5, "0")}`,
  description: `Collection ${(index % 12) + 1}`,
}));
export default {
  title: "Form/ComboBox",
  component: ComboBox,
  args: {
    label: "Document",
    description: "Search the document library",
    isRequired: true,
    options: documents,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof ComboBox>;

/** The first search fails, as a dropped connection would; Try again succeeds. */
function UnreliableSearch() {
  const attempts = useRef(0);
  return (
    <ComboBox
      label="Shared drive document"
      description="The first search fails on purpose to show recovery."
      options={[]}
      loadItems={async ({ query }) => {
        attempts.current += 1;
        if (attempts.current === 1)
          throw new Error("The shared drive did not answer.");
        return {
          items: documents
            .filter((item) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 50),
        };
      }}
    />
  );
}
type Story = StoryObj<typeof ComboBox>;
export const Default: Story = {};
export const ServerSearch: Story = {
  render: (args) => (
    <Stack gap={24}>
      <ComboBox
        {...args}
        label="Remote document"
        defaultValue={{ id: "42", label: "Document 00042" }}
        options={[]}
        loadItems={async ({ query, signal, cursor }) => {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, 400);
            signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                reject(new DOMException("Cancelled", "AbortError"));
              },
              { once: true },
            );
          });
          const matches = documents.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          );
          const offset = Number(cursor ?? 0);
          return {
            items: matches.slice(offset, offset + 50),
            ...(offset + 50 < matches.length
              ? { cursor: String(offset + 50) }
              : {}),
          };
        }}
      />
      <UnreliableSearch />
      <ComboBox {...args} label="Archived document" isDisabled />
      <ComboBox {...args} label="Additional document" isRequired={false} />
      <ComboBox
        {...args}
        label="Document to review"
        isInvalid
        errorMessage="Choose an available document"
      />
    </Stack>
  ),
};
