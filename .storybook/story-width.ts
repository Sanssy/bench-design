import { createElement, type ReactNode } from "react";

export function storyWidth(
  Story: () => ReactNode,
  { parameters }: { parameters: Record<string, unknown> },
) {
  if (parameters.fullWidth === true || parameters.layout === "fullscreen")
    return Story();
  return createElement(
    "div",
    { style: { inlineSize: "100%", maxInlineSize: "720px" } },
    createElement(Story),
  );
}
