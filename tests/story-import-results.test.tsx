import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import * as DropStories from "../src/drop-zone/DropZone.stories";
import * as FileStories from "../src/file-trigger/FileTrigger.stories";

const { UploadDocuments } = composeStories(DropStories);
const { SelectDocument, SelectImages } = composeStories(FileStories);
for (const Story of [UploadDocuments, SelectDocument, SelectImages]) {
  test(`${Story.storyName} receives files and clears the result`, async () => {
    const user = userEvent.setup();
    const { container } = render(<Story />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(
      ["notes"],
      Story === SelectImages ? "notes.png" : "notes.txt",
      { type: Story === SelectImages ? "image/png" : "text/plain" },
    );
    await user.upload(input, file);
    expect(screen.getByRole("status")).toHaveTextContent(file.name);
    await user.click(screen.getByRole("button", { name: "Clear files" }));
    expect(screen.queryByText(file.name)).not.toBeInTheDocument();
  });
}
