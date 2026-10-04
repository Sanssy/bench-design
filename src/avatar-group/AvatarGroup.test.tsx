import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Avatar } from "../avatar/Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";

test("overflow preserves hidden names", () => {
  render(
    <AvatarGroup max={1}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
    </AvatarGroup>,
  );
  expect(screen.getAllByRole("img")).toHaveLength(2);
  expect(
    screen.getByRole("img", { name: "Grace Hopper, Alan Turing" }),
  ).toHaveTextContent("+2");
});
