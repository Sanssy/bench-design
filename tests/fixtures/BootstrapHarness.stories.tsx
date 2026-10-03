import type { Meta, StoryObj } from "@storybook/react-vite";
import { BootstrapHarness } from "./BootstrapHarness";

const meta = {
  title: "Technical/Bootstrap harness",
  component: BootstrapHarness,
  parameters: {
    docs: {
      description: {
        component: "Technical tooling fixture; not a Design System component.",
      },
    },
  },
} satisfies Meta<typeof BootstrapHarness>;
export default meta;
export const NativeControl: StoryObj<typeof meta> = {};
