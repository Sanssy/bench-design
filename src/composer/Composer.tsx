import { useRef, useState } from "react";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { TextArea } from "../text-area/TextArea.js";
/** Multiline message entry; the consumer owns delivery and pending state. */
export interface ComposerProps {
  /** Card surface with an icon-only send action; default preserves the plain layout. */
  variant?: "default" | "card";
  /** Accessible field name. */
  label: string;
  /** Visually hide the linked label. */
  hideLabel?: boolean;
  /** Controlled message. */
  value?: string;
  /** Initial uncontrolled message. */
  defaultValue?: string;
  /** Called on each edit. */
  onChange?: (value: string) => void;
  /** Called for a nonblank message; does not clear the field. */
  onSubmit: (value: string) => void;
  /** Input hint, never a replacement for the label. */
  placeholder?: string;
  /** Announce sending and block edits and repeat submission. */
  isPending?: boolean;
  /** Disable editing and submission. */
  isDisabled?: boolean;
  /** Application-owned validation feedback. */
  errorMessage?: string;
}
/** Composes shared TextArea and Button without conversation state or positioning. */
export function Composer({
  variant = "default",
  label,
  hideLabel = false,
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder,
  isPending = false,
  isDisabled = false,
  errorMessage,
}: ComposerProps) {
  const [draft, setDraft] = useState(defaultValue);
  const composing = useRef(false);
  const current = value ?? draft;
  const unavailable = isDisabled || isPending || current.trim().length === 0;
  const { messages: m } = useBenchMessages();
  const submit = () => {
    if (!unavailable) onSubmit(current);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegates textarea-only keyboard and IME events; Button owns its activation.
    <div
      className="bd-composer"
      data-variant={variant}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={() => {
        composing.current = false;
      }}
      onKeyDown={(event) => {
        if (
          !(event.target instanceof HTMLTextAreaElement) ||
          event.key !== "Enter" ||
          event.shiftKey ||
          composing.current ||
          event.nativeEvent.isComposing ||
          event.keyCode === 229
        )
          return;
        event.preventDefault();
        submit();
      }}
    >
      <TextArea
        isRequired
        label={label}
        hideLabel={hideLabel}
        value={current}
        onChange={(next) => {
          setDraft(next);
          onChange?.(next);
        }}
        isDisabled={isDisabled || isPending}
        rows={1}
        maxRows={6}
        isInvalid={Boolean(errorMessage)}
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
      {variant === "card" ? (
        <IconButton
          icon="arrow-up"
          label={m.send}
          variant="primary"
          isDisabled={unavailable}
          onPress={submit}
        />
      ) : (
        <Button
          variant="primary"
          isPending={isPending}
          isDisabled={isDisabled || current.trim().length === 0}
          onPress={submit}
        >
          {m.send}
        </Button>
      )}
      <span className="bd-field-hidden-label" role="status" aria-live="polite">
        {isPending ? m.sending : ""}
      </span>
    </div>
  );
}
