import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
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
  title: ReactNode;
  /** Centered modal or full-height sheet at the logical end edge. */
  placement?: "center" | "end";
  /** Default reading measure or wider workspace measure. */
  size?: "default" | "wide";
  /** Optional metadata above the title. */
  eyebrow?: string;
  /** Visible return action; rendered only with onBack. */
  backLabel?: string;
  /** Consumer-owned view change; rendered only with backLabel. */
  onBack?: () => void;
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
  backLabel,
  onBack,
  placement = "center",
  size = "default",
  children,
  actions,
}: DialogProps) {
  const { messages: m } = useBenchMessages();
  const titleId = useId();
  const overlay = (
    <ModalOverlay
      className={`bd-modal-overlay${placement === "end" ? " bd-modal-overlay-end" : ""}`}
      {...(trigger !== undefined || isOpen === undefined ? {} : { isOpen })}
      {...(trigger !== undefined || onOpenChange === undefined
        ? {}
        : { onOpenChange })}
    >
      <Modal
        className={`bd-modal${placement === "end" ? " bd-modal-end" : ""}${size === "wide" ? " bd-modal-wide" : ""}`}
      >
        <AriaDialog className="bd-dialog" aria-labelledby={titleId}>
          {({ close }) => (
            <>
              <header className="bd-dialog-header">
                <div>
                  {backLabel !== undefined && onBack !== undefined ? (
                    <AriaButton
                      className="bd-dialog-back bd-link"
                      onPress={onBack}
                    >
                      <Icon name="arrow-left" size={16} />
                      {backLabel}
                    </AriaButton>
                  ) : null}
                  {eyebrow === undefined ? null : (
                    <Text variant="label">{eyebrow}</Text>
                  )}
                  <div id={titleId}>
                    <DialogTitle>{title}</DialogTitle>
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
    <MountedOnly>{overlay}</MountedOnly>
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

/**
 * Collection components (for example the Tabs inside AppShell) render a hidden
 * copy of their children to build their collection. A controlled overlay would
 * portal out of that copy and open twice; DialogTrigger already guards against
 * this, so the controlled path renders only once its marker is in the document.
 */
function MountedOnly({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    setMounted(Boolean(marker.current?.isConnected));
  }, []);
  return mounted ? children : <span ref={marker} hidden />;
}

function DialogTitle({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const previousText = useRef<string | null>(null);
  // Compare rendered text: JSX titles are new objects on every render.
  useLayoutEffect(() => {
    const text = heading.current?.textContent ?? "";
    if (previousText.current !== null && previousText.current !== text) {
      heading.current?.focus();
    }
    previousText.current = text;
  });
  return (
    <Heading level={2} size="heading" ref={heading} tabIndex={-1}>
      {children}
    </Heading>
  );
}
