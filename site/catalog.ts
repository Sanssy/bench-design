type Manifest = {
  components: {
    name: string;
    description: string;
    stories: { href: string }[];
  }[];
};
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );
export function catalog(manifest: Manifest): string {
  const families = new Map<string, string[]>();
  for (const component of manifest.components) {
    const href = component.stories[0]?.href;
    if (!href?.startsWith("./?path=/story/"))
      throw new Error(`Missing story: ${component.name}`);
    const family = href.split("/story/")[1]?.split("-")[0] ?? "Other";
    const entries = families.get(family) ?? [];
    entries.push(
      `<li><a href="storybook/${escapeHtml(href)}">${escapeHtml(component.name)}</a><p>${escapeHtml(component.description.split(/(?<=[.!?])\s+/)[0] ?? "")}</p></li>`,
    );
    families.set(family, entries);
  }
  return [...families]
    .map(
      ([family, entries]) =>
        `<article><details><summary>${escapeHtml(family[0]?.toUpperCase() ?? "")}${escapeHtml(family.slice(1))} (${entries.length})</summary><ul>${entries.join("")}</ul></details></article>`,
    )
    .join("");
}
