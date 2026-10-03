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
      title="Couleurs"
      intro="Le papier, l’encre et le citron composent notre palette. Explorez les rôles et leurs contrastes dans le thème actif."
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
                  value && background
                    ? (Math.max(luminance(value), luminance(background)) +
                        0.05) /
                      (Math.min(luminance(value), luminance(background)) + 0.05)
                    : undefined;
                const decorative = ["divider", "shadow", "accent"].includes(
                  role,
                );
                const graphical = ["border", "border-strong", "focus"].includes(
                  role,
                );
                const badge = decorative
                  ? "Décoratif"
                  : ratio === undefined
                    ? "—"
                    : graphical
                      ? ratio >= 3
                        ? "AA · non textuel"
                        : "Sous le seuil 3:1"
                      : ratio >= 7
                        ? "AAA · texte"
                        : ratio >= 4.5
                          ? "AA · texte"
                          : "Sous le seuil 4,5:1";
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
                      <p className="metadata">{value || "Non ratifié"}</p>
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
        <p className="eyebrow">Fondations</p>
        <h1>{title}</h1>
        <p className="introduction">{intro}</p>
      </header>
      {children}
    </main>
  );
}

const scale = Object.entries(tokens.base).flatMap(([name, token]) =>
  "line" in token.$extensions["org.bench-design"] &&
  typeof token.$value === "object"
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
  name.startsWith("space-") && typeof token.$value === "object"
    ? [token.$value.value]
    : [],
);

export function Typography() {
  return (
    <Foundation
      title="Typographie"
      intro="Trois voix donnent du rythme à la lecture. Fraunces raconte, Manrope accompagne et IBM Plex Mono précise."
    >
      <section>
        <h2>Trois voix, quatre usages</h2>
        <h3 data-family="editorial" className="editorial specimen-title">
          Les idées prennent forme.
        </h3>
        <p data-family="ui" className="specimen-body">
          Un paragraphe de lecture laisse de l’espace aux idées. La voix Manrope
          accompagne les contenus avec un rythme régulier et une présence
          discrète.
        </p>
        <p className="interface-label">Ouvrir la collection</p>
        <p data-family="metadata" className="metadata">
          ÉDITION 01 · BENCH DESIGN · 0123456789
        </p>
        <p className="metadata">
          Fraunces : wght {tokens.base["weight-editorial"].$value} · SOFT{" "}
          {tokens.base["editorial-soft"].$value} · WONK{" "}
          {tokens.base["editorial-wonk"].$value} · opsz{" "}
          {tokens.base["editorial-opsz"].$value}
        </p>
      </section>
      <section>
        <h2>Échelle typographique</h2>
        {/* biome-ignore lint/a11y/useSemanticElements: A nested section would add an unrelated section landmark; this region names the scrolling viewport. */}
        <div
          className="scale-scroll"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must focus this viewport to scroll the table.
          tabIndex={0}
          role="region"
          aria-label="Échelle typographique"
        >
          <table aria-label="Échelle typographique">
            <thead>
              <tr>
                <th scope="col">Rôle / token</th>
                <th scope="col">rem</th>
                <th scope="col">px</th>
                <th scope="col">Interlignage</th>
                <th scope="col">Spécimen</th>
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
      title="Espacements et géométrie"
      intro="L’espace structure les contenus et les angles restent vifs. Les filets, le relief et le focus rendent les limites perceptibles."
    >
      <section>
        <h2>Le rythme de l’espace</h2>
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
        <h2>Contours et relief</h2>
        <div className="foundation-grid">
          <div className="geometry-card">
            <h3>Le filet d’encre</h3>
            <p>
              Contour {tokens.base.hair.$value.value} px ·{" "}
              <code>--bd-hair</code>
            </p>
            <p>
              Angle vif · <code>--bd-radius</code> : {tokens.base.radius.$value}
            </p>
          </div>
          <div className="relief" data-geometry>
            <h3>Le citron en relief</h3>
            <p>
              Contour {tokens.base.hair.$value.value} px · rayon{" "}
              {tokens.base.radius.$value} · ombre décalée{" "}
              {tokens.base.offset.$value.value} px
            </p>
            <code>--bd-offset / --bd-shadow</code>
          </div>
        </div>
      </section>
      <section>
        <h2>Le focus au clavier</h2>
        <p>
          Appuyez sur Tab pour atteindre la cible et voir l’anneau de focus.
        </p>
        <button type="button" className="focus-sample">
          Explorer le focus
        </button>
        <p className="metadata">--bd-focus · --bd-stroke · --bd-offset</p>
      </section>
    </Foundation>
  );
}
