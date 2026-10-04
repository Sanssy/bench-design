import type { ReactNode } from "react";
import {
  Tabs as AriaTabs,
  Tab,
  TabList,
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
}
/** Tab navigation and panels managed together by React Aria. */
export function Tabs({ label, items, defaultSelectedKey }: TabsProps) {
  return (
    <AriaTabs
      className="bd-tabs"
      {...(defaultSelectedKey === undefined ? {} : { defaultSelectedKey })}
    >
      <TabList className="bd-tab-list" aria-label={label} items={items}>
        {(item) => (
          <Tab className="bd-tab" id={item.id}>
            {item.title}
          </Tab>
        )}
      </TabList>
      {items.map((item) => (
        <TabPanel className="bd-tab-panel" key={item.id} id={item.id}>
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
