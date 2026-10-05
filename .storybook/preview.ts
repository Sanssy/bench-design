import type { Preview } from "@storybook/react-vite";
import { manifestControls } from "./manifest-controls.js";
import "../dist/styles.css";
import "./foundations.css";

const preview: Preview = {
  argTypesEnhancers: [
    (context) => {
      const component = context.component as { name?: string } | undefined;
      const choices = manifestControls(
        context.title.split("/").at(-1) ?? component?.name,
      );
      return {
        ...context.argTypes,
        ...Object.fromEntries(
          Object.entries(choices).map(([name, value]) => [
            name,
            { ...context.argTypes[name], ...value },
          ]),
        ),
      };
    },
  ],
  parameters: { a11y: { test: "error" } },
  initialGlobals: { theme: "system" },
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const root = document.documentElement;
      if (globals.theme === "light" || globals.theme === "dark")
        root.setAttribute("data-theme", globals.theme);
      else root.removeAttribute("data-theme");
      return Story();
    },
  ],
};
export default preview;
