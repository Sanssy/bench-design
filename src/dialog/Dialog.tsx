import { type ReactNode, useId } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Heading } from "../heading/Heading.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Text } from "../text/Text.js";

/** A modal reading surface opened by an accessible action. */
export interface DialogProps {
  /** A React Aria compatible action, usually a DS Button. */
  trigger?: ReactNode;
  /** Controlled modal visibility; required when omitting trigger. */
  isOpen?: boolean;
  /** Called when the trigger or dismissal requests a visibility change. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Visible editorial heading and accessible dialog name. */
  title: string;
  /** Optional metadata above the title. */
  eyebrow?: string;
  /** Content in the internally scrolling body. */
  children: ReactNode;
  /** Optional actions kept visible below the body. */
  actions?: ReactNode;
}
/** A named modal with React Aria focus containment, Escape and focus restoration. */
export function Dialog({
  trigger,
  isOpen,
  onOpenChange,
  title,
  eyebrow,
  children,
  actions,
}: DialogProps) {
  const { messages: m } = useBenchMessages();
  const titleId = useId();
  const overlay = (
    <ModalOverlay
      className="bd-modal-overlay"
      {...(trigger !== undefined || isOpen === undefined ? {} : { isOpen })}
      {...(trigger !== undefined || onOpenChange === undefined
        ? {}
        : { onOpenChange })}
    >
      <Modal className="bd-modal">
        <AriaDialog className="bd-dialog" aria-labelledby={titleId}>
          {({ close }) => (
            <>
              <header className="bd-dialog-header">
                <div>
                  {eyebrow === undefined ? null : (
                    <Text variant="label">{eyebrow}</Text>
                  )}
                  <div id={titleId}>
                    <Heading level={2} size="heading">
                      {title}
                    </Heading>
                  </div>
                </div>
                <IconButton icon="x" label={m.close} onPress={close} />
              </header>
              <section
                className="bd-dialog-body"
                aria-labelledby={titleId}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: The named reading region must support keyboard scrolling in every browser.
                tabIndex={0}
              >
                {children}
              </section>
              {actions === undefined ? null : (
                <footer className="bd-dialog-actions">{actions}</footer>
              )}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
  return trigger === undefined ? (
    overlay
  ) : (
    <DialogTrigger
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
    >
      {trigger}
      {overlay}
    </DialogTrigger>
  );
}
