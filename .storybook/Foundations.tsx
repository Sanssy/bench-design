import { useEffect, useState } from "react";

const roles = [
  ["surface", "Fond de page", "text"],
  ["surface-raised", "Panneau", "text"],
  ["surface-subtle", "Fond discret", "text"],
  ["text", "Texte principal", "surface"],
  ["text-muted", "Texte secondaire", "surface"],
  ["border", "Contour des contrôles", "surface"],
  ["border-strong", "Contour structurel", "surface"],
  ["divider", "Séparateur décoratif (clair seulement)", "surface"],
  ["accent", "Surface d’accent — contour obligatoire", "surface"],
  ["on-accent", "Texte sur accent", "accent"],
  ["focus", "Anneau de focus", "surface"],
  ["shadow", "Relief", "surface"],
  ["selection", "Surface de sélection", "on-selection"],
  ["on-selection", "Texte sélectionné", "selection"],
] as const;

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
  return (
    <main>
      <h1>Couleurs</h1>
      <p>Contrastes WCAG calculés depuis les tokens du thème actif.</p>
      <section aria-label="Rôles sémantiques">
        {roles.map(([role, label, against]) => {
          const value = values[role];
          const background = values[against];
          const ratio =
            value && background
              ? (Math.max(luminance(value), luminance(background)) + 0.05) /
                (Math.min(luminance(value), luminance(background)) + 0.05)
              : undefined;
          return (
            <p key={role} data-role={role}>
              <span
                className="swatch"
                style={{ background: `var(--bd-${role})` }}
              />
              {label} · <code>--bd-{role}</code> · {value || "Non ratifié"} ·
              <span data-contrast>
                {ratio?.toFixed(2) ?? "—"} / {against}
              </span>
            </p>
          );
        })}
      </section>
    </main>
  );
}

export function Typography() {
  return (
    <main>
      <h1>Typographie</h1>
      <p>Fraunces 500 · Manrope · IBM Plex Mono.</p>
      {(["editorial", "ui", "metadata"] as const).map((family) => (
        <p key={family} data-family={family} className={family}>
          Voix {family} — Aa Bb 0123
        </p>
      ))}
      {(
        ["meta", "ui", "body", "lead", "heading", "display", "hero"] as const
      ).map((size) => (
        <p
          key={size}
          data-size={size}
          style={{ fontSize: `var(--bd-size-${size})` }}
        >
          {size} — Aa
        </p>
      ))}
    </main>
  );
}

export function Geometry() {
  return (
    <main>
      <h1>Espacements et géométrie</h1>
      {[4, 8, 12, 16, 24, 32, 48, 64, 96].map((space) => (
        <p key={space}>
          --bd-space-{space}
          <span
            data-space={space}
            className="space"
            style={{ width: `var(--bd-space-${space})` }}
          />
        </p>
      ))}
      <p className="relief" data-geometry>
        Contour --bd-hair · rayon --bd-radius · ombre --bd-offset
      </p>
    </main>
  );
}
