import { type ReactNode, useId } from "react";
import { AppHeaderInShell } from "../app-header/AppHeader.js";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";

/** Optional regions and content width for a document page. */
export interface PageProps {
  /** Optional banner content, typically AppHeader. */
  header?: ReactNode;
  /** Primary document content. */
  children?: ReactNode;
  /** Optional footer content, kept in document flow. */
  footer?: ReactNode;
  /** Centered content measure. Defaults to default. */
  width?: "default" | "narrow";
}
/** A centered document frame with natural scrolling and a localized skip link. */
export function Page({
  header,
  children,
  footer,
  width = "default",
}: PageProps) {
  const mainId = `${useId()}-main`;
  const { messages } = useBenchMessages();
  return (
    <div className="bd-page" data-width={width}>
      <a
        className="bd-page-skip"
        href={`#${mainId}`}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(mainId)?.focus();
        }}
      >
        {messages.skipToMain}
      </a>
      {header != null && (
        <header className="bd-page-header">
          <AppHeaderInShell.Provider value={true}>
            {header}
          </AppHeaderInShell.Provider>
        </header>
      )}
      <main className="bd-page-main" id={mainId} tabIndex={-1}>
        {children}
      </main>
      {footer != null && <footer className="bd-page-footer">{footer}</footer>}
    </div>
  );
}
