import { createContext, type ReactNode, useContext } from "react";
import { I18nProvider, RouterProvider, useLocale } from "react-aria-components";
import { type BenchMessages, en, fr } from "./messages.js";

export type { BenchMessages } from "./messages.js";

const MessagesContext = createContext<Partial<BenchMessages>>({});
/** Optional locale and partial internal-copy configuration. Consumer labels remain application-owned. */
export interface BenchProviderProps {
  children: ReactNode;
  /** Client router navigation; omitted to retain native or inherited routing. */
  navigate?: (href: string, options?: unknown) => void;
  /** Router hook resolving a route to an anchor URL; used with navigate. */
  useHref?: (href: string) => string;
  /** BCP 47 locale; inherits the surrounding React Aria locale when omitted. */
  locale?: string;
  /** Partial overrides, inherited and merged by nested providers. */
  messages?: Partial<BenchMessages>;
}
/** Configures internal copy and React Aria formatting for a subtree. */
export function BenchProvider({
  children,
  locale,
  messages,
  navigate,
  useHref,
}: BenchProviderProps) {
  const parent = useContext(MessagesContext);
  const content = (
    <MessagesContext.Provider value={{ ...parent, ...messages }}>
      {children}
    </MessagesContext.Provider>
  );
  const routed = navigate ? (
    <RouterProvider
      navigate={navigate}
      {...(useHref === undefined ? {} : { useHref })}
    >
      {content}
    </RouterProvider>
  ) : (
    content
  );
  return locale === undefined ? (
    routed
  ) : (
    <I18nProvider locale={locale}>{routed}</I18nProvider>
  );
}
export function useBenchMessages() {
  const { locale } = useLocale();
  const overrides = useContext(MessagesContext);
  const messages = {
    ...(locale.split("-")[0] === "fr" ? fr : en),
    ...overrides,
  };
  const number = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(value);
  const plural = (value: number) => new Intl.PluralRules(locale).select(value);
  return { messages, context: { number, plural }, number, locale };
}
