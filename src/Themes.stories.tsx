import type { Meta, StoryObj } from "@storybook/react-vite";
import { Themes } from "../.storybook/PublicDocs";

export default { title: "Documentation/Thèmes" } satisfies Meta;
export const Page: StoryObj = { render: () => <Themes /> };
