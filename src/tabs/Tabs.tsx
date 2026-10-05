import { type ReactNode, useContext, useLayoutEffect, useRef } from "react";
import {
  Tabs as AriaTabs,
  Tab,
  TabList,
  TabListStateContext,
  TabPanel,
} from "react-aria-components";

/** A named set of tabs with their associated content panels. */
export interface TabsProps {
  /** Accessible name of the tab list. */
  label: string;
  /** Ordered tabs with unique stable identifiers and their panel content. */
  items: readonly { id: string; title: string; content: ReactNode }[];
  /** Initially selected identifier; defaults to the first item. */
  defaultSelectedKey?: string;
  /** Controlled selected identifier. */
  selectedKey?: string;
  /** Called with the selected identifier. */
  onSelectionChange?: (key: string) => void;
  /** Tab list axis and corresponding arrow navigation. */
  orientation?: "horizontal" | "vertical";
}
/** Tab navigation and panels managed together by React Aria. */
export function Tabs({
  label,
  items,
  defaultSelectedKey,
  selectedKey,
  onSelectionChange,
  orientation = "horizontal",
}: TabsProps) {
  return (
    <AriaTabs
      className="bd-tabs"
      orientation={orientation}
      {...(selectedKey === undefined ? {} : { selectedKey })}
      {...(onSelectionChange === undefined
        ? {}
        : { onSelectionChange: (key) => onSelectionChange(String(key)) })}
      {...(defaultSelectedKey === undefined ? {} : { defaultSelectedKey })}
    >
      <ScrollingTabList label={label} items={items} orientation={orientation} />
      {items.map((item) => (
        <TabPanel className="bd-tab-panel" key={item.id} id={item.id}>
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}

function ScrollingTabList({
  label,
  items,
  orientation,
}: Pick<TabsProps, "label" | "items" | "orientation">) {
  const selectedKey = useContext(TabListStateContext)?.selectedKey;
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (orientation !== "horizontal" || selectedKey == null || !items.length)
      return;
    const list = ref.current;
    const selected = list?.querySelector('[role="tab"][aria-selected="true"]');
    if (!list || !selected) return;
    const bounds = list.getBoundingClientRect();
    const tab = selected.getBoundingClientRect();
    const style = getComputedStyle(list);
    const left = bounds.left + (Number.parseFloat(style.paddingLeft) || 0);
    const right = bounds.right - (Number.parseFloat(style.paddingRight) || 0);
    if (tab.left < left) list.scrollLeft += tab.left - left;
    else if (tab.right > right) list.scrollLeft += tab.right - right;
  }, [selectedKey, orientation, items]);
  return (
    <TabList ref={ref} className="bd-tab-list" aria-label={label} items={items}>
      {(item) => (
        <Tab className="bd-tab" id={item.id}>
          {item.title}
        </Tab>
      )}
    </TabList>
  );
}
