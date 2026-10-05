import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AppShell } from "../app-shell/AppShell.js";
import { Button } from "../button/Button.js";
import { ColorField } from "../color-field/ColorField.js";
import { Heading } from "../heading/Heading.js";
import { Inline } from "../inline/Inline.js";
import { Inspector } from "../inspector/Inspector.js";
import { NumberField } from "../number-field/NumberField.js";
import { SidePanel } from "../side-panel/SidePanel.js";
import { Slider } from "../slider/Slider.js";
import { Stack } from "../stack/Stack.js";
import { Text } from "../text/Text.js";
import { TextField } from "../text-field/TextField.js";

export default {
  title: "Recipes/Workspace",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export const EditInPanel: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("Sample board");
    const [copies, setCopies] = useState(2);
    const [color, setColor] = useState("#d8ed69");
    const [opacity, setOpacity] = useState(50);
    return (
      <AppShell
        header={
          <Heading level={1} size="lead">
            Editing workspace
          </Heading>
        }
        {...(open
          ? {
              end: {
                label: "Editor",
                content: (
                  <SidePanel title="Editor">
                    <Inspector
                      title="Board settings"
                      sections={[
                        {
                          id: "settings",
                          title: "Properties",
                          defaultExpanded: true,
                          content: (
                            <Stack gap={16}>
                              <TextField
                                label="Board name"
                                value={name}
                                onChange={setName}
                              />
                              <NumberField
                                label="Copies"
                                value={copies}
                                onChange={setCopies}
                                minValue={1}
                                maxValue={10}
                              />
                              <ColorField
                                label="Marker color"
                                value={color}
                                onChange={setColor}
                              />
                              <Slider
                                label="Opacity"
                                value={opacity}
                                onChange={setOpacity}
                              />
                            </Stack>
                          ),
                        },
                      ]}
                      actions={
                        <Button onPress={() => setOpen(false)}>
                          Close editor
                        </Button>
                      }
                    />
                  </SidePanel>
                ),
              },
            }
          : {})}
      >
        <Stack gap={16}>
          <Heading level={2}>Board preview</Heading>
          <div role="status" aria-label="Board preview">
            <Inline gap={8} align="center">
              <Text>
                {name} · {copies} copies ·
              </Text>
              <span
                className="bd-color-preview"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <Text>
                {/* Keeps the announced status text spaced around the swatch. */}{" "}
                {color} · {opacity}% opacity
              </Text>
            </Inline>
          </div>
          <Text tone="muted">Edits update this local preview immediately.</Text>
          <Inline>
            <Button onPress={() => setOpen(!open)}>
              {open ? "Hide editor" : "Open editor"}
            </Button>
          </Inline>
        </Stack>
      </AppShell>
    );
  },
};
