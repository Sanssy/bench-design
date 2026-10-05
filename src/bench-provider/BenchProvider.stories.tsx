import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "../link/Link";
import { Stack } from "../stack/Stack";
import { TextField } from "../text-field/TextField";
import { Value } from "../value/Value";
import { BenchProvider } from "./BenchProvider";
export default {
  title: "Foundations/BenchProvider",
  component: BenchProvider,
  parameters: { layout: "centered" },
} satisfies Meta<typeof BenchProvider>;
type Story = StoryObj<typeof BenchProvider>;
export const FrenchProfile: Story = {
  args: {
    locale: "fr-FR",
    children: (
      <Stack>
        <TextField label="Nom" />
        <Value value={1234} total={2000} />
        <Link href="https://example.com" external>
          Guide du profil
        </Link>
      </Stack>
    ),
  },
};
export const EnglishProfile: Story = {
  args: {
    locale: "en-US",
    children: (
      <Stack>
        <TextField label="Name" />
        <Value value={1234} total={2000} />
        <Link href="https://example.com" external>
          Profile guide
        </Link>
      </Stack>
    ),
  },
};
