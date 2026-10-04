/** Divider exposes no visual or semantic overrides. */
// biome-ignore lint/suspicious/noEmptyInterface: the public decorative primitive has no configurable props.
export interface DividerProps {}
/** A decorative hairline excluded from the accessibility tree. */
// biome-ignore lint/correctness/noEmptyPattern: explicit empty public props are read by the API manifest generator.
export function Divider({}: DividerProps) {
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: native hr without tabindex is not focusable; the ratified divider is decorative.
  return <hr className="bd-divider" aria-hidden="true" />;
}
