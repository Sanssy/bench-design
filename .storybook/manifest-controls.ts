import manifest from "../components.json";

/** Literal choices come from the same public API manifest as the prop tables. */
export function manifestControls(componentName: string | undefined) {
  const component = manifest.components.find(
    (entry) => entry.name === componentName,
  );
  return Object.fromEntries(
    (component?.props ?? []).flatMap((prop) => {
      const members = prop.type.split(" | ");
      if (
        !members.every((member) => /^("[^"\\]*"|-?\d+(?:\.\d+)?)$/.test(member))
      )
        return [];
      const options = members.map(
        (member) => JSON.parse(member) as string | number,
      );
      return [
        [
          prop.name,
          {
            options,
            control: { type: "select" as const },
            table: { type: { summary: prop.type } },
          },
        ],
      ];
    }),
  );
}
