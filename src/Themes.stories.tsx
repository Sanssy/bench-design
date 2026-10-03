import type { Meta, StoryObj } from "@storybook/react-vite";
import { Themes } from "../.storybook/PublicDocs";

export default { title: "Docs/Themes" } satisfies Meta;
export const Page: StoryObj = { render: () => <Themes /> };
