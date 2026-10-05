import { useEffect } from "react";
import {
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastRegion as AriaToastRegion,
  Text,
  UNSTABLE_ToastQueue as ToastQueue,
} from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Button } from "../button/Button.js";
import { Icon } from "../icon/Icon.js";
import { IconButton } from "../icon-button/IconButton.js";
/** Content for a transient notification. An action always disables auto-dismiss. */
export interface ToastOptions {
  title: string;
  description?: string;
  tone?: "neutral" | "success" | "danger";
  action?: { label: string; onPress: () => void };
  /** Auto-dismiss delay in milliseconds; defaults to 5000. */
  timeout?: number;
}
const queue = new ToastQueue<ToastOptions>({ maxVisibleToasts: 3 });
let mounted = false;
/** Notification commands with no React Aria types in the public API. */
export interface ToastController {
  show: (options: ToastOptions) => void;
}
/** Enqueue feedback for the application's single ToastRegion. */
export function useToast(): ToastController {
  return {
    show(options) {
      queue.add(
        options,
        options.action ? {} : { timeout: options.timeout ?? 5000 },
      );
    },
  };
}
/** Mount once at the application root. Timers pause on hover and keyboard focus. */
export function ToastRegion() {
  const { messages: m } = useBenchMessages();
  useEffect(() => {
    if (mounted) throw new Error("Mount only one ToastRegion per application.");
    mounted = true;
    return () => {
      mounted = false;
      queue.clear();
    };
  }, []);
  return (
    <AriaToastRegion queue={queue} className="bd-toast-region">
      {({ toast }) => (
        <AriaToast
          toast={toast}
          className="bd-toast"
          data-tone={toast.content.tone ?? "neutral"}
        >
          <AriaToastContent
            role="status"
            aria-live="polite"
            className="bd-toast__content"
          >
            <Icon
              name={
                toast.content.tone === "success"
                  ? "check"
                  : toast.content.tone === "danger"
                    ? "x"
                    : "info"
              }
              size={20}
            />
            <div>
              <Text slot="title" className="bd-toast__title">
                {toast.content.title}
              </Text>
              {toast.content.description && (
                <Text slot="description">{toast.content.description}</Text>
              )}
            </div>
          </AriaToastContent>
          {toast.content.action && (
            <Button
              onPress={() => {
                toast.content.action?.onPress();
                queue.close(toast.key);
              }}
            >
              {toast.content.action.label}
            </Button>
          )}
          <IconButton
            icon="x"
            label={m.close}
            onPress={() => {
              queue.close(toast.key);
            }}
          />
        </AriaToast>
      )}
    </AriaToastRegion>
  );
}
