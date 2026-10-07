import { useEffect, useRef, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Icon } from "../icon/Icon.js";
import { Link } from "../link/Link.js";
import { ProgressBar } from "../progress-bar/ProgressBar.js";
/** Controlled upload presentation; the application owns transport and state. */
export interface UploadQueueProps {
  /** Accessible name of the list. */
  label: string;
  items: {
    /** Stable unique identifier. */
    id: string;
    name: string;
    status: "uploading" | "complete" | "error";
    /** Percentage from 0 to 100; absent means indeterminate. */
    progress?: number;
    description?: string;
    /** Available after completion; navigation or an application callback. */
    action?: { label: string } & (
      | { href: string; onAction?: never }
      | { onAction: () => void; href?: never }
    );
  }[];
}
/** Displays upload states with one polite region announcing status changes. */
export function UploadQueue({ label, items }: UploadQueueProps) {
  const { messages: m } = useBenchMessages();
  const previous = useRef(new Map(items.map((item) => [item.id, item.status])));
  const [announcement, setAnnouncement] = useState("");
  const statusText = {
    uploading: m.uploading,
    complete: m.uploadComplete,
    error: m.uploadError,
  };
  useEffect(() => {
    const changed = items.filter(
      (item) => previous.current.get(item.id) !== item.status,
    );
    previous.current = new Map(items.map((item) => [item.id, item.status]));
    if (changed.length)
      setAnnouncement(
        changed
          .map((item) => `${item.name}, ${statusText[item.status]}`)
          .join(". "),
      );
  });
  return (
    <>
      <ul
        className="bd-upload-queue"
        aria-label={label}
        // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none.
        role="list"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="bd-upload-item"
            data-status={item.status}
          >
            <div className="bd-upload-heading">
              <Icon name="file-text" size={20} />
              <span className="bd-upload-name">{item.name}</span>
              {item.status !== "uploading" && (
                <Icon
                  name={item.status === "complete" ? "check" : "triangle-alert"}
                  size={20}
                  label={statusText[item.status]}
                />
              )}
            </div>
            {item.status !== "error" && (
              <ProgressBar
                label={m.uploadProgress(item.name)}
                hideLabel
                value={item.status === "complete" ? 100 : (item.progress ?? 0)}
                isIndeterminate={
                  item.status === "uploading" && item.progress === undefined
                }
              />
            )}
            {item.description && (
              <div className="bd-upload-description">{item.description}</div>
            )}
            {item.status === "complete" &&
              item.action &&
              (item.action.href !== undefined ? (
                <Link href={item.action.href} trailingIcon="arrow-up-right">
                  {item.action.label}
                </Link>
              ) : (
                <AriaButton
                  className="bd-link bd-upload-action"
                  onPress={item.action.onAction}
                >
                  {item.action.label}
                  <span className="bd-link-icon-trailing">
                    <Icon name="arrow-up-right" size={16} />
                  </span>
                </AriaButton>
              ))}
          </li>
        ))}
      </ul>
      <div
        className="bd-field-hidden-label"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
    </>
  );
}
