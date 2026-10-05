import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Card } from "./Card.js";

for (const as of ["article", "section", "div"] as const) {
  test(`Card renders ${as}`, () => {
    render(<Card as={as}>Saved collection</Card>);
    expect(screen.getByText("Saved collection").tagName).toBe(as.toUpperCase());
  });
}
test("Card defaults to an article", () => {
  render(<Card>Saved collection</Card>);
  expect(screen.getByRole("article")).toHaveTextContent("Saved collection");
});

test("Card places optional media before padded content", () => {
  render(<Card media={<img alt="Preview" src="preview.png" />}>Details</Card>);
  const card = screen.getByRole("article");
  expect(card.firstElementChild).toContainElement(screen.getByRole("img"));
  expect(card.lastElementChild).toHaveTextContent("Details");
  expect(card.lastElementChild).toHaveClass("bd-card-content");
});

test("Card defaults remain raised with no padding override", () => {
  render(<Card>Details</Card>);
  const card = screen.getByRole("article");
  expect(card).toHaveAttribute("data-variant", "raised");
  expect(card.style.getPropertyValue("--bd-card-padding")).toBe("");
  expect(card.querySelector(".bd-card-media")).toBeNull();
});

test("Card accepts outlined and token padding", () => {
  render(
    <Card variant="outlined" padding={24}>
      Details
    </Card>,
  );
  const card = screen.getByRole("article");
  expect(card).toHaveAttribute("data-variant", "outlined");
  expect(card.style.getPropertyValue("--bd-card-padding")).toBe(
    "var(--bd-space-24)",
  );
});

for (const variant of ["raised", "outlined"] as const) {
  test(`Card preserves internal activation in ${variant}`, async () => {
    const onPress = vi.fn();
    render(
      <Card variant={variant} media={<span>Preview</span>}>
        <Button onPress={onPress}>Open</Button>
      </Card>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("article")).not.toHaveAttribute("tabindex");
  });
}
