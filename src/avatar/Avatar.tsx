import { useState } from "react";
/** A person's image or name-derived initials. */
export interface AvatarProps {
  /** Full name; an interactive parent must also provide its own accessible name. */
  name: string;
  /** Initials background. Defaults to neutral. */
  tone?: "neutral" | "accent";
  src?: string;
  size?: 24 | 32 | 40;
  isDecorative?: boolean;
}
/** Present a full accessible name, or hide beside an equivalent visible name. */
export function Avatar({
  name,
  src,
  size = 32,
  tone = "neutral",
  isDecorative = false,
}: AvatarProps) {
  const [failed, setFailed] = useState<string>();
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = [words[0], words.length > 1 ? words.at(-1) : undefined]
    .filter((word): word is string => word !== undefined)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase();
  return (
    <span
      className="bd-avatar"
      data-size={size}
      data-tone={tone}
      role="img"
      aria-label={isDecorative ? undefined : name}
      aria-hidden={isDecorative || undefined}
    >
      {src && src !== failed ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        initials
      )}
    </span>
  );
}
