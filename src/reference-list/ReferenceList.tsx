import { Link } from "../link/Link.js";
/** Caller-owned references, with no source resolution or extraction. */
export interface ReferenceListProps {
  /** Accessible name of the ordered list. */
  label: string;
  items: {
    /** Stable unique identifier. */
    id: string;
    title: string;
    href?: string;
    description?: string;
  }[];
}
/** A visibly numbered list in caller order. */
export function ReferenceList({ label, items }: ReferenceListProps) {
  return (
    <ol className="bd-reference-list" aria-label={label}>
      {items.map(({ id, title, href, description }) => (
        <li key={id}>
          {href === undefined ? title : <Link href={href}>{title}</Link>}
          {description !== undefined && <p>{description}</p>}
        </li>
      ))}
    </ol>
  );
}
