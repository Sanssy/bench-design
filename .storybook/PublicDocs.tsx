import { type ReactNode, useState } from "react";
import { Button } from "../src/button/Button";
import tokens from "../src/tokens.json";

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="foundation documentation">
      <header>
        <p className="eyebrow">Documentation</p>
        <h1>{title}</h1>
      </header>
      {children}
    </main>
  );
}

export function GettingStarted() {
  const [saved, setSaved] = useState(false);
  return (
    <Page title="Getting started">
      <section>
        <h2>Your first render</h2>
        <p>
          The package is private. Build and pack a checkout, then install the
          local tarball in your React application:
        </p>
        <pre>
          <code>
            {
              "pnpm install --frozen-lockfile\npnpm build\npnpm pack\n# In your application:\npnpm add /path/to/bench-design-0.1.0.tgz"
            }
          </code>
        </pre>
        <p>
          Import styles once, import Button and connect its action to local
          state:
        </p>
        <pre>
          <code>{`import "bench-design/styles.css";
import { useState } from "react";
import { Button } from "bench-design";

export function SaveAction() {
  const [saved, setSaved] = useState(false);
  return <>
    <Button variant="primary" onPress={() => setSaved(true)}>Save</Button>
    <p role="status">{saved ? "Changes saved" : "No changes saved yet"}</p>
    {saved && <Button onPress={() => setSaved(false)}>Reset</Button>}
  </>;
}`}</code>
        </pre>
        <Button variant="primary" onPress={() => setSaved(true)}>
          Save
        </Button>
        <p role="status">{saved ? "Changes saved" : "No changes saved yet"}</p>
        {saved && <Button onPress={() => setSaved(false)}>Reset</Button>}
      </section>
      <section>
        <h2>Add a theme</h2>
        <p>
          Styles follow the system theme by default. For a persisted choice,
          serve bench-design/theme-init.js from your application and load it as
          a blocking classic script in head before CSS and React:
        </p>
        <pre>
          <code>
            {
              '<head>\n  <script src="/theme-init.js"></script>\n  <!-- Application styles follow. -->\n</head>'
            }
          </code>
        </pre>
        <p>
          Use no async, defer or type="module". The script reads
          localStorage["bench-design-theme"]. See Themes for light, dark and
          system selection.
        </p>
      </section>
      <nav aria-label="Documentation next steps">
        <ul>
          <li>
            <a target="_top" href="./?path=/story/docs-themes--page">
              Themes
            </a>
          </li>
          <li>
            <a target="_top" href="./?path=/story/docs-principles--page">
              Principles
            </a>
          </li>
          <li>
            <a target="_top" href="./?path=/story/foundations-colors--palette">
              Colors and token roles
            </a>
          </li>
          <li>
            <a target="_top" href="./?path=/docs/form-button--docs">
              Button API and examples
            </a>
          </li>
        </ul>
      </nav>
      <section>
        <h2>Available today</h2>
        <p>
          Tokens, styles, local fonts, theme initialization and the React
          components listed in components.json: typography, layout, data,
          surfaces, status, forms, filters, overlays, structure, collections and
          feedback. The package is private and no npm release is available.
        </p>
      </section>
      <section>
        <h2>Load the foundations</h2>
        <p>
          For tools or an application that needs tokens without the component
          styles:
        </p>
        <pre>
          <code>
            {
              '// Tokens without component styles or fonts:\nimport "bench-design/tokens.css";\n// DTCG catalog for tools:\nimport tokens from "bench-design/tokens.json";'
            }
          </code>
        </pre>
        <p>
          In Node, JSON imports require with {' { type: "json" }'}; bundlers do
          not need it. Choose styles.css or tokens.css to suit your needs. Serve
          styles.css with its relative fonts/ assets, which include the fonts
          and their OFL licenses. No CDN required.
        </p>
      </section>
      <section>
        <h2>Localization</h2>
        <p>
          Internal labels and feedback follow the React Aria locale, with
          English and French copy. BenchProvider is optional: set locale to
          configure a subtree and messages to override selected internal
          messages. Consumer labels remain application-owned. Unsupported
          languages fall back to English copy.
        </p>
        <pre>
          <code>
            {
              '<BenchProvider locale="fr-FR" messages={{ close: "Fermer la fenêtre" }}><App /></BenchProvider>'
            }
          </code>
        </pre>
      </section>
      <section>
        <h2>Work in the repository</h2>
        <p>Pinned runtime: Node 24.21.0 and pnpm 12.8.1.</p>
        <pre>
          <code>
            {
              "pnpm install --frozen-lockfile\npnpm check\npnpm test\npnpm build\npnpm build-storybook"
            }
          </code>
        </pre>
        <p>
          check detects drift between tokens.json and tokens.css, among other
          checks. After editing the catalog, pnpm tokens:generate regenerates
          the CSS. pnpm verify runs every check, including browser tests in
          Chromium, Firefox and WebKit; see CONTRIBUTING.md.
        </p>
      </section>
    </Page>
  );
}

export function Principles() {
  return (
    <Page title="Principles">
      <section>
        <h2>Structure and voice</h2>
        <p>
          Swiss structure, expressive editorial voice and brutalist engagement.
          Components use semantic --bd-* roles; visual values belong to shared
          tokens and primitives. Content and business rules stay in
          applications.
        </p>
      </section>
      <section>
        <h2>Typography</h2>
        <p>
          {
            tokens.base["weight-editorial"].$extensions["org.bench-design"]
              .usage
          }
        </p>
        <p>
          Manrope supports interfaces and reading; IBM Plex Mono supports
          metadata and monospace text. Local fonts use font-display: swap and
          system fallback stacks.
        </p>
      </section>
      <section>
        <h2>Contrast and roles</h2>
        <ul>
          {(["border", "divider", "accent", "focus"] as const).map((role) => (
            <li key={role}>
              <code>--bd-{role}</code>:{" "}
              {tokens.light[role].$extensions["org.bench-design"].usage}
            </li>
          ))}
        </ul>
        <p>
          Body text requires 4.5:1 contrast; borders needed to identify controls
          and focus indicators require 3:1. Check combinations in their actual
          context: palette contrast does not certify an application’s
          accessibility.
        </p>
      </section>
      <section>
        <h2>Accessible integration</h2>
        <p>
          Keep semantic HTML, accessible names and visible focus. Check focus
          order and keyboard operation. Button wraps React Aria for activation
          and disabled semantics; its stories demonstrate primary, secondary and
          disabled usage. UI tests follow render/interact/assert.
        </p>
      </section>
    </Page>
  );
}

export function Themes() {
  return (
    <Page title="Themes">
      <section>
        <h2>Light, dark and system</h2>
        <p>
          Set data-theme="light" or data-theme="dark" on html. Without the
          attribute, prefers-color-scheme selects the theme and follows system
          changes. Styles declare color-scheme. The Storybook selector lets you
          view each page in all three modes.
        </p>
      </section>
      <section>
        <h2>Before the first render</h2>
        <p>
          Serve bench-design/theme-init.js from your own origin. Load this
          blocking classic script in head, before styles and React, without
          async or defer. The path below is an example of a copy served by the
          application:
        </p>
        <pre>
          <code>
            {
              '<head>\n  <script src="/assets/theme-init.js"></script>\n  <!-- Application styles after the script -->\n</head>'
            }
          </code>
        </pre>
        <p>
          The script reads localStorage["bench-design-theme"]. light and dark
          set the attribute; system, missing or invalid entries and inaccessible
          storage leave it absent. An attribute already supplied by the server
          is preserved. The ESM entry point does not change the theme; the
          script can be imported without document during SSR.
        </p>
      </section>
      <section>
        <h2>Change the choice later</h2>
        <p>
          For an explicit choice, set the attribute on document.documentElement;
          for system, remove it. Persist the same choice if storage is
          available:
        </p>
        <pre>
          <code>
            {
              '// theme: "light" | "dark" | "system"\nif (theme === "system") {\n  document.documentElement.removeAttribute("data-theme");\n} else {\n  document.documentElement.setAttribute("data-theme", theme);\n}\ntry {\n  localStorage.setItem("bench-design-theme", theme);\n} catch { /* The choice remains active without storage. */ }'
            }
          </code>
        </pre>
      </section>
      <section>
        <h2>Current limitations</h2>
        <p>
          The print theme is deferred. Do not invent values for it. Wait for
          document.fonts.ready before screenshots.
        </p>
      </section>
    </Page>
  );
}
