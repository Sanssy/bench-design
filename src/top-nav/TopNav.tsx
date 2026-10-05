import { Link as AriaLink } from "react-aria-components";
import { Badge } from "../badge/Badge.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** Named page navigation with native destinations. */
export interface TopNavProps {
  /** Accessible navigation landmark name. */
  label: string;
  /** Ordered destinations with unique stable identifiers. Counts describe the destination. */
  items: readonly {
    id: string;
    label: string;
    href: string;
    count?: number;
    icon?: IconName;
  }[];
  /** Identifier of the current page; omitted when none matches. */
  currentId?: string;
}
/** Page links; routing remains owned by the consuming application (React Aria links, ready for a client router). */
export function TopNav({ label, items, currentId }: TopNavProps) {
  return (
    <nav className="bd-top-nav" aria-label={label}>
      <ul className="bd-top-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <AriaLink
              className="bd-top-nav-link"
              href={item.href}
              aria-current={item.id === currentId ? "page" : undefined}
            >
              {item.icon && <Icon name={item.icon} size={20} />}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <>
                  {" "}
                  <Badge>{item.count}</Badge>
                </>
              )}
            </AriaLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
