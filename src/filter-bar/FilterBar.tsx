import { type ReactNode, useContext, useSyncExternalStore } from "react";
import { OverlayTriggerStateContext } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Button } from "../button/Button.js";
import { Dialog } from "../dialog/Dialog.js";

/** Responsive filter composition; the application owns filtering and counts. */
export interface FilterBarProps {
  /** Number of matching results, computed by the application. */
  resultCount: number;
  /** Number of active filters, computed by the application. */
  activeCount: number;
  /** Request that the application clears all active filters. */
  onClearFilters: () => void;
  /** Optional search control; keep its value in application state. */
  search?: ReactNode;
  /** Filter controls; keep their selected values in application state. */
  children: ReactNode;
}
const mobileQuery = "(width < 640px)";
function subscribe(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function getSnapshot() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(mobileQuery).matches
  );
}
function ShowResults({ count }: { count: number }) {
  const { messages: m, context: c } = useBenchMessages();
  const dialog = useContext(OverlayTriggerStateContext);
  return (
    <Button variant="primary" onPress={() => dialog?.close()}>
      {m.showResults(m.results(count, c))}
    </Button>
  );
}

/** A live result summary and one set of controls, moved into a mobile Dialog. */
export function FilterBar({
  resultCount,
  activeCount,
  onClearFilters,
  search,
  children,
}: FilterBarProps) {
  const { messages: m, context: c, number } = useBenchMessages();
  const mobile = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const controls = (
    <div className="bd-filter-bar-controls">
      {search}
      <div className="bd-filter-bar-chips">{children}</div>
    </div>
  );
  const summary = (
    <div className="bd-filter-bar-summary">
      <span role="status">{m.results(resultCount, c)}</span>
      {activeCount > 0 ? (
        <Button onPress={onClearFilters}>{m.clearFilters}</Button>
      ) : null}
    </div>
  );
  return (
    <div className="bd-filter-bar">
      {mobile ? (
        <Dialog
          title={m.filters}
          trigger={
            <Button>
              {m.filters} {number(activeCount)}
            </Button>
          }
          actions={<ShowResults count={resultCount} />}
        >
          <div className="bd-filter-bar-sheet">
            {controls}
            {summary}
          </div>
        </Dialog>
      ) : (
        controls
      )}
      {/* Keep the live region mounted while the mobile sheet is closed. */}
      {summary}
    </div>
  );
}
