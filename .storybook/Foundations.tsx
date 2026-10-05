import { type ReactNode, useEffect, useState } from "react";

import tokens from "../src/tokens.json";

const roles = Object.entries(tokens.light).map(
  ([role, token]) =>
    [
      role,
      token.$description,
      token.$extensions["org.bench-design"].against,
    ] as const,
);

function luminance(hex: string) {
  return [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
    const channel =
      Number.parseInt(hex.slice(index * 2 + 1, index * 2 + 3), 16) / 255;
    const linear =
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + weight * linear;
  }, 0);
}

export function Palette({ theme }: { theme: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const update = () => {
      const css = getComputedStyle(document.documentElement);
      const token = (role: string) =>
        css.getPropertyValue(`--bd-${role}`).trim();
      setValues(Object.fromEntries(roles.map(([role]) => [role, token(role)])));
    };
    update();
    if (theme !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);
  const groups = [
    ...new Set(
      Object.values(tokens.light).map(
        (token) => token.$extensions["org.bench-design"].group,
      ),
    ),
  ];
  return (
    <Foundation
      title="Colors"
      intro="Paper, ink and lemon form our palette. Explore semantic roles and their contrast in the active theme. Category hues are graphical markers accompanied by text labels, never color-only meaning or action colors."
    >
      {groups.map((title) => (
        <section key={title}>
          <h2>{title}</h2>
          <div className="foundation-grid">
            {roles
              .filter(
                ([role]) =>
                  tokens.light[role as keyof typeof tokens.light].$extensions[
                    "org.bench-design"
                  ].group === title,
              )
              .map(([role, label, against]) => {
                const value = values[role];
                const background = values[against];
                const ratio =
                  value?.startsWith("#") && background?.startsWith("#")
                    ? (Math.max(luminance(value), luminance(background)) +
                        0.05) /
                      (Math.min(luminance(value), luminance(background)) + 0.05)
                    : undefined;
                const decorative = [
                  "divider",
                  "shadow",
                  "accent",
                  "veil",
                ].includes(role);
                const graphical =
                  [
                    "border",
                    "border-strong",
                    "focus",
                    "success",
                    "warning",
                    "danger",
                  ].includes(role) || role.startsWith("category-");
                const badge = decorative
                  ? "Decorative"
                  : ratio === undefined
                    ? "—"
                    : graphical
                      ? ratio >= 3
                        ? "AA · non-text"
                        : "Below 3:1"
                      : ratio >= 7
                        ? "AAA · text"
                        : ratio >= 4.5
                          ? "AA · text"
                          : "Below 4.5:1";
                return (
                  <article key={role} data-role={role} className="color-card">
                    <div
                      aria-hidden="true"
                      className="swatch"
                      style={{ background: `var(--bd-${role})` }}
                    />
                    <div className="card-content">
                      <h3>{label}</h3>
                      <p>
                        {
                          tokens.light[role as keyof typeof tokens.light]
                            .$extensions["org.bench-design"].usage
                        }
                      </p>
                      <code>--bd-{role}</code>
                      <p className="metadata">{value || "Not ratified"}</p>
                      <span className="contrast-badge">{badge}</span>
                      <p data-contrast className="metadata">
                        {ratio?.toFixed(2) ?? "—"} / {against}
                      </p>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </Foundation>
  );
}

function Foundation({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="foundation">
      <header>
        <p className="eyebrow">Foundations</p>
        <h1>{title}</h1>
        <p className="introduction">{intro}</p>
      </header>
      {children}
    </main>
  );
}

const scale = Object.entries(tokens.base).flatMap(([name, token]) =>
  "line" in token.$extensions["org.bench-design"] &&
  typeof token.$value === "object" &&
  "value" in token.$value
    ? [
        [
          name.slice(5),
          token.$value.value,
          token.$extensions["org.bench-design"].line,
        ] as const,
      ]
    : [],
);
const lines = Object.fromEntries(
  Object.entries(tokens.base)
    .filter(([name]) => name.startsWith("line-"))
    .map(([name, token]) => [name.slice(5), token.$value]),
);
const spaces = Object.entries(tokens.base).flatMap(([name, token]) =>
  name.startsWith("space-") &&
  typeof token.$value === "object" &&
  "value" in token.$value
    ? [token.$value.value]
    : [],
);

export function Typography() {
  return (
    <Foundation
      title="Typography"
      intro="Three voices set the reading rhythm. Fraunces tells the story, Manrope guides and IBM Plex Mono adds precision."
    >
      <section>
        <h2>Three voices, four uses</h2>
        <h3 data-family="editorial" className="editorial specimen-title">
          Ideas take shape.
        </h3>
        <p data-family="ui" className="specimen-body">
          A reading paragraph gives ideas room to breathe. Manrope supports the
          content with a steady rhythm and a quiet presence.
        </p>
        <p className="interface-label">Open the collection</p>
        <p data-family="metadata" className="metadata">
          EDITION 01 · BENCH DESIGN · 0123456789
        </p>
        <p className="metadata">
          Fraunces: wght {tokens.base["weight-editorial"].$value} · SOFT{" "}
          {tokens.base["editorial-soft"].$value} · WONK{" "}
          {tokens.base["editorial-wonk"].$value} · opsz{" "}
          {tokens.base["editorial-opsz"].$value}
        </p>
      </section>
      <section>
        <h2>Type scale</h2>
        {/* biome-ignore lint/a11y/useSemanticElements: A nested section would add an unrelated section landmark; this region names the scrolling viewport. */}
        <div
          className="scale-scroll"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must focus this viewport to scroll the table.
          tabIndex={0}
          role="region"
          aria-label="Type scale"
        >
          <table aria-label="Type scale">
            <thead>
              <tr>
                <th scope="col">Role / token</th>
                <th scope="col">rem</th>
                <th scope="col">px</th>
                <th scope="col">Line height</th>
                <th scope="col">Sample</th>
              </tr>
            </thead>
            <tbody>
              {scale.map(([size, rem, line]) => (
                <tr key={size}>
                  <th scope="row">
                    <code>--bd-size-{size}</code>
                  </th>
                  <td>{rem}</td>
                  <td>{rem * tokens.base["font-base"].$value.value}</td>
                  <td>
                    {line} · {String(lines[line])}
                  </td>
                  <td>
                    <span
                      data-size={size}
                      style={{
                        fontSize: `var(--bd-size-${size})`,
                        lineHeight: `var(--bd-line-${line})`,
                      }}
                    >
                      Aa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Foundation>
  );
}

export function Geometry() {
  return (
    <Foundation
      title="Spacing & geometry"
      intro="Space organizes content and corners stay sharp. Borders, depth and focus make boundaries clear."
    >
      <section>
        <h2>Spacing rhythm</h2>
        <ul className="space-scale">
          {spaces.map((space) => (
            <li key={space}>
              <code>
                --bd-space-{space} · {space} px
              </code>
              <span
                aria-hidden="true"
                data-space={space}
                className="space"
                style={{ width: `var(--bd-space-${space})` }}
              />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Borders and depth</h2>
        <div className="foundation-grid">
          <div className="geometry-card">
            <h3>Ink hairline</h3>
            <p>
              Border {tokens.base.hair.$value.value} px · <code>--bd-hair</code>
            </p>
            <p>
              Sharp corner · <code>--bd-radius</code>:{" "}
              {tokens.base.radius.$value}
            </p>
          </div>
          <div className="relief" data-geometry>
            <h3>Lemon with depth</h3>
            <p>
              Border {tokens.base.hair.$value.value} px · radius{" "}
              {tokens.base.radius.$value} · offset shadow{" "}
              {tokens.base.offset.$value.value} px
            </p>
            <code>--bd-offset / --bd-shadow</code>
          </div>
        </div>
      </section>
      <section>
        <h2>Overlays and motion</h2>
        <p>
          {
            tokens.base["elevation-dialog"].$extensions["org.bench-design"]
              .usage
          }
        </p>
        <code>--bd-elevation-dialog · --bd-shadow</code>
        <p>{tokens.base["veil-blur"].$extensions["org.bench-design"].usage}</p>
        <code>--bd-veil · --bd-veil-blur</code>
        <p>
          {tokens.base["duration-fast"].$extensions["org.bench-design"].usage}
        </p>
        <code>
          --bd-duration-fast · {tokens.base["duration-fast"].$value.value}
          {tokens.base["duration-fast"].$value.unit} · --bd-ease-out ·{" "}
          {tokens.base["ease-out"].$value.join(", ")}
        </code>
      </section>
      <section>
        <h2>Keyboard focus</h2>
        <p>Press Tab to reach the target and see the focus ring.</p>
        <button type="button" className="focus-sample">
          Explore focus
        </button>
        <p className="metadata">--bd-focus · --bd-stroke · --bd-offset</p>
      </section>
    </Foundation>
  );
}
