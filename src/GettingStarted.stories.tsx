import type { Meta, StoryObj } from "@storybook/react-vite";
import { GettingStarted } from "../.storybook/PublicDocs";

export default { title: "Documentation/Démarrer" } satisfies Meta;
export const Page: StoryObj = { render: () => <GettingStarted /> };
