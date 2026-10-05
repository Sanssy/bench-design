import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { MultiComboBox } from "./MultiComboBox.js";

const documents = Array.from({ length: 10_000 }, (_, index) => ({
  id: String(index),
  label: `Document ${String(index).padStart(5, "0")}`,
  description: `Collection ${(index % 12) + 1}`,
}));
export default {
  title: "Form/MultiComboBox",
  component: MultiComboBox,
  args: {
    label: "Documents",
    description: "Search the document library",
    isRequired: true,
    defaultValue: documents.slice(0, 2),
    options: documents,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof MultiComboBox>;
type Story = StoryObj<typeof MultiComboBox>;
export const Default: Story = {};
export const ServerSearch: Story = {
  render: (args) => (
    <Stack gap={24}>
      <MultiComboBox
        {...args}
        label="Remote documents"
        options={[]}
        defaultValue={[{ id: "42", label: "Document 00042" }]}
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
      <MultiComboBox {...args} label="Archived documents" isDisabled />
      <MultiComboBox
        {...args}
        label="Additional documents"
        isRequired={false}
      />
      <MultiComboBox
        {...args}
        label="Documents to review"
        isInvalid
        errorMessage="Choose an available document"
      />
    </Stack>
  ),
};
