import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
};
export default config;
