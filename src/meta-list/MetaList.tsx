import type { ReactNode } from "react";
/** Term/detail pairs displayed in equal columns and responsive rows. */
export interface MetaListProps {
  items: { term: string; details: ReactNode }[];
  /** Accessible name of the description list. */
  label?: string;
}
/** A native description list with caller-provided terms and rich details. */
export function MetaList({ items, label }: MetaListProps) {
  return (
    <dl className="bd-meta-list" aria-label={label}>
      {items.map(({ term, details }, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: The public pair API has no identifier and permits repeated terms.
        <div key={`${index}:${term}`}>
          <dt>{term}</dt>
          <dd>{details}</dd>
        </div>
      ))}
    </dl>
  );
}
