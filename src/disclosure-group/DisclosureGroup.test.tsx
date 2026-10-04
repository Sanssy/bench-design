import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Disclosure } from "../disclosure/Disclosure.js";
import { DisclosureGroup } from "./DisclosureGroup.js";

for (const multiple of [false, true])
  for (const activation of ["keyboard", "pointer"])
    test(`group multiple=${multiple}, ${activation}`, async () => {
      render(
        <DisclosureGroup allowsMultipleExpanded={multiple}>
          <Disclosure title="First">One</Disclosure>
          <Disclosure title="Second">Two</Disclosure>
        </DisclosureGroup>,
      );
      if (activation === "keyboard") {
        await userEvent.tab();
        expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await userEvent.tab();
        expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
      } else {
        await userEvent.click(screen.getByRole("button", { name: "First" }));
        await userEvent.click(screen.getByRole("button", { name: "Second" }));
      }
      expect(screen.getByRole("button", { name: "First" })).toHaveAttribute(
        "aria-expanded",
        String(multiple),
      );
      expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
