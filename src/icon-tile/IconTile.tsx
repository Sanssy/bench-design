import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** A noninteractive square carrying a catalogue icon. */
export interface IconTileProps {
  /** Icon from the shared catalogue. */
  icon: IconName;
  /** Surface tone; color alone must not convey meaning. */
  tone?:
    | "neutral"
    | "accent"
    | "green"
    | "orange"
    | "violet"
    | "magenta"
    | "teal"
    | "blue";
  /** Tokenized square: sm is 48 px, md is 64 px. */
  size?: "sm" | "md";
  /** Image name; omit when adjacent content supplies the meaning. */
  label?: string;
}
/** Display a decorative or named image without introducing an action. */
export function IconTile({
  icon,
  tone = "neutral",
  size = "md",
  label,
}: IconTileProps) {
  return (
    <span
      className="bd-icon-tile"
      data-tone={tone}
      data-size={size}
      aria-hidden={label ? undefined : true}
      {...(label ? { role: "img", "aria-label": label } : {})}
    >
      <Icon name={icon} />
    </span>
  );
}
