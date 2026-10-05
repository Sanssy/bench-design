import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { Card } from "../card/Card.js";
import { CategoryLabel } from "../category-label/CategoryLabel.js";
import { Heading } from "../heading/Heading.js";
import { Notice } from "../notice/Notice.js";
import { RadioGroup } from "../radio-group/RadioGroup.js";
import { Stack } from "../stack/Stack.js";
import { Text } from "../text/Text.js";
import { Value } from "../value/Value.js";

export default {
  title: "Recipes/Choice",
  parameters: { layout: "padded" },
} satisfies Meta;
const options = [
  { id: "compact", label: "Compact", detail: "4 items" },
  { id: "extended", label: "Extended", detail: "8 items" },
] as const;
export const ConfirmSelection: StoryObj = {
  render: () => {
    const [choice, setChoice] = useState("compact");
    const [confirmed, setConfirmed] = useState<string | null>(null);
    const option = options.find((item) => item.id === choice) ?? options[0];
    return (
      <Stack gap={24}>
        <Heading level={1}>Choose a sample set</Heading>
        <RadioGroup
          label="Sample set"
          variant="cards"
          options={options}
          value={choice}
          onChange={(value) => {
            setChoice(value);
            setConfirmed(null);
          }}
        />
        <Card as="section">
          <Stack gap={16}>
            <CategoryLabel category="teal">Sample collection</CategoryLabel>
            <Heading level={2}>Review your choice</Heading>
            <Text>{option.label}</Text>
            <Text>
              <Value value={choice === "compact" ? 4 : 8} mode="plain" /> items
              included
            </Text>
            <Button
              variant="primary"
              onPress={() => setConfirmed(option.label)}
            >
              Confirm choice
            </Button>
          </Stack>
        </Card>
        {confirmed && (
          <Notice tone="success" title="Choice confirmed">
            {confirmed} sample set is ready. Change your choice to start again.
          </Notice>
        )}
      </Stack>
    );
  },
};
