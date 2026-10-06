import { Link } from "../link/Link.js";
/** Caller-owned references, with no source resolution or extraction. */
export interface ReferenceListProps {
  /** Accessible name of the ordered list. */
  label: string;
  /** Decimal numbering by default; accent tiles when requested. */
  marker?: "number" | "accent";
  items: {
    /** Stable unique identifier. */
    id: string;
    title: string;
    href?: string;
    description?: string;
    /** Caller-owned end metadata, such as a page reference. */
    meta?: string;
  }[];
}
/** A visibly numbered list in caller order. */
export function ReferenceList({
  label,
  items,
  marker = "number",
}: ReferenceListProps) {
  return (
    <ol
      className="bd-reference-list"
      aria-label={label}
      // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none.
      role="list"
      data-marker={marker}
    >
      {items.map(({ id, title, href, description, meta }, index) => (
        <li key={id}>
          {marker === "accent" && (
            <span className="bd-reference-marker" aria-hidden="true">
              {index + 1}
            </span>
          )}
          <div className="bd-reference-row">
            <div className="bd-reference-body">
              {href === undefined ? title : <Link href={href}>{title}</Link>}
              {description !== undefined && <p>{description}</p>}
            </div>
            {meta !== undefined && (
              <span className="bd-reference-meta">{meta}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
