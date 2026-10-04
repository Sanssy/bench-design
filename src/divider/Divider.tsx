/** Divider exposes no visual or semantic overrides. */
export type DividerProps = Record<string, never>;
/** A decorative hairline excluded from the accessibility tree. */
export function Divider() {
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a native hr is not focusable; the divider is decorative.
  return <hr className="bd-divider" aria-hidden="true" />;
}
