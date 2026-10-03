import type { Meta, StoryObj } from "@storybook/react-vite";
import { Principles } from "../.storybook/PublicDocs";

export default { title: "Documentation/Principes" } satisfies Meta;
export const Page: StoryObj = { render: () => <Principles /> };
