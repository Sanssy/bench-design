import { Icon } from "../icon/Icon.js";
/** Status semantic feedback. */
export interface StatusProps {
  tone: "success" | "warning" | "danger";
  label: string;
}
/** Present labeled, noninteractive feedback. */
export function Status({ tone, label }: StatusProps) {
  return (
    <span className="bd-status" data-tone={tone}>
      <Icon
        name={
          tone === "success"
            ? "check"
            : tone === "warning"
              ? "triangle-alert"
              : "x"
        }
        size={20}
      />
      <span>{label}</span>
    </span>
  );
}
