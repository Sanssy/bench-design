import manifest from "../components.json";

export function ManifestProps({ component }: { component: string }) {
  const entry = manifest.components.find((entry) => entry.name === component);
  if (!entry) throw new Error(`Unknown component: ${component}`);
  return (
    <table>
      <caption>{component} props</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Required</th>
          <th scope="col">Default</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {entry.props.map((prop) => (
          <tr key={prop.name}>
            <th scope="row">
              <code>{prop.name}</code>
            </th>
            <td>
              <code>{prop.type}</code>
            </td>
            <td>{prop.required ? "Yes" : "No"}</td>
            <td>
              <code>{"default" in prop ? prop.default : "—"}</code>
            </td>
            <td>
              {"description" in prop && typeof prop.description === "string"
                ? prop.description
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
