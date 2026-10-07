import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { BenchProvider } from "../bench-provider/BenchProvider.js";
import { UploadQueue, type UploadQueueProps } from "./UploadQueue.js";

const item = { id: "a", name: "A", status: "uploading" as const };
test("names the list and shows controlled and indeterminate progress", () => {
  const { rerender } = render(
    <UploadQueue label="Uploads" items={[{ ...item, progress: 35 }]} />,
  );
  expect(screen.getByRole("list", { name: "Uploads" })).toBeInTheDocument();
  expect(
    screen.getByRole("progressbar", { name: "Progress of A" }),
  ).toHaveAttribute("aria-valuenow", "35");
  rerender(<UploadQueue label="Uploads" items={[item]} />);
  expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
});
test("exposes completion, errors and actions only after completion", async () => {
  const onAction = vi.fn();
  const action = { label: "Open", onAction };
  const done = { ...item, status: "complete" as const, action };
  const items: UploadQueueProps["items"] = [
    { ...item, action },
    {
      id: "b",
      name: "B",
      status: "complete",
      description: "Ready",
      action: { label: "View", href: "#details" },
    },
    { ...item, id: "c", status: "error", action },
  ];
  const { rerender } = render(<UploadQueue label="Uploads" items={items} />);
  expect(screen.getByRole("img", { name: "Complete" })).toBeInTheDocument();
  expect(screen.getByLabelText("Upload failed")).toBeInTheDocument();
  expect(screen.getByText("Ready")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
    "href",
    "#details",
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  rerender(<UploadQueue label="Uploads" items={[done]} />);
  await userEvent.setup().click(screen.getByRole("button", { name: "Open" }));
  expect(onAction).toHaveBeenCalledOnce();
});
test("announces status transitions once in French, without progress chatter", () => {
  const view = (
    status: typeof item.status | "complete" | "error",
    progress = 20,
  ) => (
    <BenchProvider locale="fr">
      <UploadQueue label="Imports" items={[{ ...item, status, progress }]} />
    </BenchProvider>
  );
  const { container, rerender } = render(view("uploading"));
  const live = screen.getByRole("status");
  expect(container.querySelectorAll("[aria-live]")).toHaveLength(1);
  expect(live).toBeEmptyDOMElement();
  expect(screen.getByLabelText("Progression de A")).toBeInTheDocument();
  rerender(view("complete"));
  expect(live).toHaveTextContent("A, Terminé");
  rerender(view("error"));
  expect(live).toHaveTextContent("A, Échec de l’envoi");
  rerender(view("uploading"));
  expect(live).toHaveTextContent("A, Envoi en cours");
  rerender(view("uploading", 60));
  expect(live).toHaveTextContent("A, Envoi en cours");
});
