import { type ReactNode, useId } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";
import { Link } from "../link/Link.js";

/** A caller-owned passage with at most one navigation or application action. */
export type Citation = {
  id: string;
  label: string;
  locator?: string;
  quote: ReactNode;
} & (
  | { actionLabel: string; href: string; onAction?: never }
  | { actionLabel: string; onAction: () => void; href?: never }
  | { actionLabel?: never; href?: never; onAction?: never }
);
/** Source information and passages in caller order; no source resolution. */
export interface CitationGroupProps {
  title: string;
  meta?: string;
  /** Decorative source icon. Defaults to file-text. */
  icon?: IconName;
  /** Source heading in the surrounding document outline. Defaults to 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  citations: Citation[];
}
/** A bordered source group; only individual passage actions are interactive. */
export function CitationGroup({
  title,
  meta,
  icon = "file-text",
  headingLevel = 3,
  citations,
}: CitationGroupProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section className="bd-citation-group" aria-labelledby={titleId}>
      <header className="bd-citation-header">
        <Icon name={icon} size={20} />
        <div>
          <Heading id={titleId}>{title}</Heading>
          {meta !== undefined && <p>{meta}</p>}
        </div>
      </header>
      {/* biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none. */}
      <ul className="bd-citations" role="list">
        {citations.map(
          ({ id, label, locator, quote, actionLabel, href, onAction }) => (
            <li key={id}>
              <div className="bd-citation-label">
                <span>{label}</span>
                {locator !== undefined && <span>{locator}</span>}
              </div>
              <blockquote>{quote}</blockquote>
              {href !== undefined ? (
                <Link href={href} trailingIcon="arrow-up-right">
                  {actionLabel}
                </Link>
              ) : onAction !== undefined ? (
                <AriaButton
                  className="bd-link bd-citation-action"
                  type="button"
                  onPress={onAction}
                >
                  {actionLabel}
                  <span className="bd-link-icon-trailing">
                    <Icon name="arrow-up-right" size={16} />
                  </span>
                </AriaButton>
              ) : null}
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
