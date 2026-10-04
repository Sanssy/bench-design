import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Toolbar } from "./Toolbar.js";

test("Toolbar exposes its required accessible name and actions", () => {
  render(
    <Toolbar label="Canvas tools">
      <IconButton icon="plus" label="Zoom in" />
      <Button>Fit canvas</Button>
    </Toolbar>,
  );
  expect(
    screen.getByRole("toolbar", { name: "Canvas tools" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Fit canvas" }),
  ).toBeInTheDocument();
});
