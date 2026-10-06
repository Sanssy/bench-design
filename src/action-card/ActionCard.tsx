import { type ReactElement, type ReactNode, useId } from "react";
import { Button, Link } from "react-aria-components";
import { Icon } from "../icon/Icon.js";
/** Noninteractive content for a single whole-card target outside collections. */
export interface ActionCardContent {
  href?: string;
  onPress?: () => void;
  isDisabled?: boolean;
  /** Stack eyebrow above the title with the trailing content at the bottom. */
  layout?: "row" | "stacked";
  title: string;
  description?: string;
  /** Presentational content only; never include controls or focusable elements. */
  media?: ReactNode;
  eyebrow?: string;
  /** Decorative trailing content; undefined uses the link arrow, null omits it. */
  trailingIcon?: ReactNode;
}
/** Choose navigation or an action, never both. Disabled applies only to actions. */
export type ActionCardProps = Omit<
  ActionCardContent,
  "href" | "onPress" | "isDisabled"
> &
  (
    | { href: string; onPress?: never; isDisabled?: never }
    | { onPress: () => void; href?: never; isDisabled?: boolean }
  );
export function ActionCard(props: ActionCardProps): ReactElement;
/** A single accessible card target: href OR onPress. Do not nest controls or use inside GridList. */
export function ActionCard({
  title,
  layout = "row",
  description,
  media,
  eyebrow,
  trailingIcon,
  href,
  onPress,
  isDisabled,
}: ActionCardContent) {
  const id = useId();
  const content = (
    <>
      {media != null && <span className="bd-action-card__media">{media}</span>}
      <span className="bd-action-card__body">
        {eyebrow && <span className="bd-action-card__eyebrow">{eyebrow}</span>}
        <span id={`${id}-title`} className="bd-action-card__title">
          {title}
        </span>
        {description && (
          <span
            id={`${id}-description`}
            className="bd-action-card__description"
          >
            {description}
          </span>
        )}
      </span>
      <span className="bd-action-card__trailing" aria-hidden="true">
        {trailingIcon === undefined && href !== undefined ? (
          <Icon name="arrow-up-right" />
        ) : (
          trailingIcon
        )}
      </span>
    </>
  );
  const accessible = {
    "data-layout": layout,
    "aria-labelledby": `${id}-title`,
    ...(description ? { "aria-describedby": `${id}-description` } : {}),
  };
  return href !== undefined ? (
    <Link className="bd-action-card" href={href} {...accessible}>
      {content}
    </Link>
  ) : (
    <Button
      className="bd-action-card"
      type="button"
      {...(onPress ? { onPress } : {})}
      isDisabled={isDisabled ?? false}
      {...accessible}
    >
      {content}
    </Button>
  );
}
