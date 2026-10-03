import type { Preview } from "@storybook/react-vite";
import "../dist/styles.css";
import "./foundations.css";

const preview: Preview = {
  parameters: { a11y: { test: "error" } },
  initialGlobals: { theme: "system" },
  globalTypes: {
    theme: {
      description: "Thème",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Clair" },
          { value: "dark", title: "Sombre" },
          { value: "system", title: "Système" },
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
