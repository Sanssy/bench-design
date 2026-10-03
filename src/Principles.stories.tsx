import type { Meta, StoryObj } from "@storybook/react-vite";
import { Principles } from "../.storybook/PublicDocs";

export default { title: "Docs/Principles" } satisfies Meta;
export const Page: StoryObj = { render: () => <Principles /> };
