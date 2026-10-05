import { useId } from "react";
import { Button, Link } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** One destination or action; the two activation modes are mutually exclusive. */
export type ActionListItem = {
  id: string;
  title: string;
  description?: string;
  icon?: IconName;
} & (
  | { href: string; external?: boolean; onPress?: never }
  | { href?: never; external?: never; onPress: () => void }
);
/** Caller-owned rows in a named, non-selectable list. */
export interface ActionListProps {
  label: string;
  items: ActionListItem[];
  /** Show decorative numbers without imposing ordered-list semantics. */
  numbered?: boolean;
}
/** Full-row React Aria links and buttons with optional supporting text. */
export function ActionList({
  label,
  items,
  numbered = false,
}: ActionListProps) {
  const prefix = useId();
  const { messages } = useBenchMessages();
  return (
    <ul className="bd-action-list" aria-label={label}>
      {items.map((item, index) => {
        const titleId = `${prefix}-${index}-title`;
        const descriptionId = `${prefix}-${index}-description`;
        const announcementId = `${prefix}-${index}-external`;
        const props = {
          className: "bd-action-list__row",
          "aria-labelledby": item.external
            ? `${titleId} ${announcementId}`
            : titleId,
          ...(item.description === undefined
            ? {}
            : { "aria-describedby": descriptionId }),
        };
        const content = (
          <>
            {numbered && (
              <span className="bd-action-list__number" aria-hidden="true">
                {index + 1}
              </span>
            )}
            {item.icon && <Icon name={item.icon} size={20} />}
            <span className="bd-action-list__content">
              <span id={titleId} className="bd-action-list__title">
                {item.title}
              </span>
              {item.description !== undefined && (
                <span
                  id={descriptionId}
                  className="bd-action-list__description"
                >
                  {item.description}
                </span>
              )}
            </span>
            {item.href !== undefined && (
              <Icon
                name={item.external ? "arrow-up-right" : "chevron-right"}
                size={20}
              />
            )}
            {item.external && (
              <span id={announcementId} className="bd-link-announcement">
                {messages.externalLink}
              </span>
            )}
          </>
        );
        return (
          <li key={item.id}>
            {item.href !== undefined ? (
              <Link
                {...props}
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {content}
              </Link>
            ) : (
              <Button {...props} type="button" onPress={item.onPress}>
                {content}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
