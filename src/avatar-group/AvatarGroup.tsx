import type { ReactElement } from "react";
import { Children } from "react";
import type { AvatarProps } from "../avatar/Avatar.js";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
/** Display child Avatars with an optional visible count limit. */
export interface AvatarGroupProps {
  max?: number;
  children: ReactElement<AvatarProps> | ReactElement<AvatarProps>[];
}
/** Keep overflow names accessible alongside the visible +N indicator. */
export function AvatarGroup({ max, children }: AvatarGroupProps) {
  const { messages: m, context: c } = useBenchMessages();
  const avatars = Children.toArray(children) as ReactElement<AvatarProps>[];
  const limit =
    max === undefined ? avatars.length : Math.max(0, Math.floor(max));
  const hidden = avatars.slice(limit);
  return (
    <div className="bd-avatar-group">
      {avatars.slice(0, limit)}
      {hidden.length > 0 && (
        <span
          className="bd-avatar bd-avatar-group__overflow"
          data-size={
            (avatars[Math.min(limit, avatars.length) - 1] ?? avatars[0])?.props
              .size ?? 32
          }
          role="img"
          aria-label={hidden.map((avatar) => avatar.props.name).join(", ")}
        >
          {m.more(hidden.length, c)}
        </span>
      )}
    </div>
  );
}
