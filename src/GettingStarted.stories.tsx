import type { Meta, StoryObj } from "@storybook/react-vite";
import { GettingStarted } from "../.storybook/PublicDocs";

export default { title: "Docs/Getting started" } satisfies Meta;
export const Page: StoryObj = { render: () => <GettingStarted /> };
