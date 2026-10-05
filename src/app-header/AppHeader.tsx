import { createContext, type ReactNode, useContext } from "react";

export const AppHeaderInShell = createContext(false);

/** Application-owned content for the shared application banner. */
export interface AppHeaderProps {
  /** Brand content, typically a link to the application's home page. */
  brand: ReactNode;
  /** Named page navigation, typically TopNav. */
  navigation: ReactNode;
  /** Optional application actions. */
  actions?: ReactNode;
  /** Optional contextual metadata. */
  meta?: ReactNode;
}
/** A responsive application banner with brand, navigation, actions and metadata slots. */
export function AppHeader({
  brand,
  navigation,
  actions,
  meta,
}: AppHeaderProps) {
  const Root = useContext(AppHeaderInShell) ? "div" : "header";
  return (
    <Root className="bd-app-header">
      <div className="bd-app-header-brand">{brand}</div>
      <div className="bd-app-header-navigation">{navigation}</div>
      {(actions != null || meta != null) && (
        <div className="bd-app-header-utilities">
          {actions}
          {meta != null && <div className="bd-app-header-meta">{meta}</div>}
        </div>
      )}
    </Root>
  );
}
