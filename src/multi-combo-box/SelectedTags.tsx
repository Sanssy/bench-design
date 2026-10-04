import { useLayoutEffect, useRef, useState } from "react";
import { Button, Tag, TagGroup, TagList } from "react-aria-components";
import type { FieldOption } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

export function SelectedTags({
  items,
  isDisabled,
  onRemove,
}: {
  items: readonly FieldOption[];
  isDisabled: boolean;
  onRemove(keys: Set<string | number>): void;
}) {
  const probe = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  useLayoutEffect(() => {
    const element = probe.current;
    if (!element) return;
    const measure = () => {
      const width = element.getBoundingClientRect().width;
      if (!width) {
        setVisibleCount(items.length);
        return;
      }
      const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
      const children = [...element.children];
      const widths = children
        .slice(0, items.length)
        .map((child) => child.getBoundingClientRect().width);
      const fittingCount = (values: number[]) => {
        let rows = 1;
        let used = 0;
        let count = 0;
        for (const value of values) {
          if (used && used + gap + value > width) {
            rows++;
            used = 0;
          }
          if (rows > 2) break;
          used += (used ? gap : 0) + Math.min(value, width);
          count++;
        }
        return count;
      };
      let count = fittingCount(widths);
      if (count < items.length) {
        const summaryWidth =
          children[items.length]?.getBoundingClientRect().width ?? 0;
        while (
          count > 0 &&
          fittingCount([...widths.slice(0, count), summaryWidth]) < count + 1
        )
          count--;
      }
      setVisibleCount(count);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    let active = true;
    document.fonts?.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [items]);
  const count = Math.min(visibleCount, items.length);
  const hiddenCount = items.length - count;
  return (
    <div className="bd-tag-container">
      <div
        ref={probe}
        className="bd-selected-tags bd-tag-measure"
        aria-hidden="true"
      >
        {items.map((item) => (
          <span key={item.id} className="bd-selected-tag">
            <span className="bd-tag-label">{item.label}</span>
            <span className="bd-tag-remove">
              <Icon name="x" size={16} />
            </span>
          </span>
        ))}
        <span className="bd-tag-summary">+{items.length}</span>
      </div>
      <div className="bd-tag-display">
        <TagGroup
          aria-label="Selected choices"
          onRemove={onRemove}
          className="bd-tag-group"
          disabledKeys={isDisabled ? items.map((item) => item.id) : []}
        >
          <TagList
            items={items.slice(0, count)}
            dependencies={[isDisabled]}
            className="bd-selected-tags"
          >
            {(item) => (
              <Tag
                id={item.id}
                textValue={item.label}
                className="bd-selected-tag"
                isDisabled={isDisabled}
              >
                <span className="bd-tag-label">{item.label}</span>
                <Button
                  slot="remove"
                  className="bd-tag-remove"
                  isDisabled={isDisabled}
                >
                  <Icon name="x" size={16} />
                </Button>
              </Tag>
            )}
          </TagList>
        </TagGroup>
        {hiddenCount > 0 && (
          <span
            className="bd-tag-summary"
            role="img"
            aria-label={`${hiddenCount} more selected choices`}
          >
            +{hiddenCount}
          </span>
        )}
      </div>
    </div>
  );
}
