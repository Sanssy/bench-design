import { createElement, type ReactNode } from "react";
import { type IconName, icons } from "./icons.js";

/** A sharp catalogue icon, colored by its parent. */
export interface IconProps {
  /** Name from the generated SVG catalogue. */
  name: IconName;
  /** Rendered width and height in pixels. Defaults to 24. */
  size?: 16 | 20 | 24;
  /** Accessible image name; omit for a decorative icon. */
  label?: string;
}
type SvgElement = {
  tag: string;
  attrs: Readonly<Record<string, string>>;
  children: readonly SvgElement[];
};
function renderElement(element: SvgElement, key: number): ReactNode {
  return createElement(
    element.tag,
    { ...element.attrs, key },
    element.children.map(renderElement),
  );
}
/** Render an inline SVG; omit label when surrounding content provides meaning. */
export function Icon({ name, size = 24, label }: IconProps) {
  const icon = icons[name];
  return (
    <svg
      {...icon.attrs}
      width={size}
      height={size}
      focusable="false"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {icon.children.map(renderElement)}
    </svg>
  );
}
