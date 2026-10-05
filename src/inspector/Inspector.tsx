import type { ReactNode } from "react";
import { Disclosure } from "../disclosure/Disclosure.js";
import { Heading } from "../heading/Heading.js";
/** One expandable section of consumer-owned inspector content. */
export interface InspectorSection {
  /** Stable section identifier. */
  id: string;
  /** Visible disclosure title. */
  title: string;
  /** Optional metadata beside the disclosure title. */
  meta?: string;
  /** Section content, commonly a MetaList. */
  content: ReactNode;
  /** Initially expanded disclosure. */
  defaultExpanded?: boolean;
}
/** A generic inspector composition with consumer-provided details and actions. */
export interface InspectorProps {
  /** Optional visible second-level heading. */
  title?: string;
  /** Short context above the heading. */
  eyebrow?: string;
  /** Ordered expandable details. */
  sections?: readonly InspectorSection[];
  /** Consumer-owned footer actions. */
  actions?: ReactNode;
  /** Content displayed when no sections exist. */
  emptyState?: ReactNode;
}
/** Inspector details use shared Disclosure semantics and consumer-owned content. */
export function Inspector({
  title,
  eyebrow,
  sections = [],
  actions,
  emptyState,
}: InspectorProps) {
  return (
    <div className="bd-inspector">
      {(title !== undefined || eyebrow !== undefined) && (
        <header className="bd-inspector-header">
          {eyebrow !== undefined && (
            <span className="bd-inspector-eyebrow">{eyebrow}</span>
          )}
          {title !== undefined && (
            <Heading level={2} size="heading">
              {title}
            </Heading>
          )}
        </header>
      )}
      <div className="bd-inspector-sections">
        {sections.length
          ? sections.map((section) => (
              <Disclosure
                key={section.id}
                title={section.title}
                {...(section.meta === undefined ? {} : { meta: section.meta })}
                {...(section.defaultExpanded === undefined
                  ? {}
                  : { defaultExpanded: section.defaultExpanded })}
              >
                {section.content}
              </Disclosure>
            ))
          : emptyState}
      </div>
      {actions != null && <div className="bd-inspector-actions">{actions}</div>}
    </div>
  );
}
