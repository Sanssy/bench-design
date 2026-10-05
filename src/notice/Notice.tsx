import type { ReactNode } from "react";
import { Icon } from "../icon/Icon.js";
/** Notice semantic feedback. */
export interface NoticeProps {
  tone: "neutral" | "success" | "warning" | "danger";
  title: string;
  children: ReactNode;
}
/** Present labeled, noninteractive feedback. */
export function Notice({ tone, title, children }: NoticeProps) {
  return (
    <div
      className="bd-notice"
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon
        name={
          tone === "neutral"
            ? "info"
            : tone === "success"
              ? "check"
              : tone === "warning"
                ? "triangle-alert"
                : "x"
        }
        size={20}
      />
      <div>
        <strong className="bd-notice__title">{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}
