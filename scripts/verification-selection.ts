const targets = {
  a11y: { file: "tests/browser/a11y.spec.ts", themes: ["light", "dark"] },
  fonts: { file: "tests/browser/fonts.spec.ts", themes: [] },
  foundations: {
    file: "tests/browser/foundations.spec.ts",
    themes: ["light", "dark", "system"],
  },
  themes: {
    file: "tests/browser/themes.spec.ts",
    themes: ["light", "dark", "system"],
  },
  button: {
    file: "src/button/Button.browser.spec.ts",
    themes: ["light", "dark"],
  },
} satisfies Record<string, { file: string; themes: string[] }>;
type Target = keyof typeof targets;
export function selection(args: string[]) {
  const options: Record<string, string> = {};
  const input = args[0] === "--" ? args.slice(1) : args;
  for (let index = 0; index < input.length; index += 2) {
    const key = input[index]?.slice(2) ?? "";
    const value = input[index + 1];
    if (
      !input[index]?.startsWith("--") ||
      ![
        "target",
        "component",
        "browser",
        "theme",
        "viewport",
        "workers",
      ].includes(key) ||
      key in options ||
      !value ||
      value.startsWith("--")
    )
      throw new Error(`Invalid or duplicate option: ${input[index]}`);
    options[key] = value;
  }
  for (const [key, allowed] of [
    ["theme", ["light", "dark", "system"]],
    ["viewport", ["desktop", "mobile", "short"]],
  ] as const)
    if (options[key] && !allowed.some((value) => value === options[key]))
      throw new Error(`Invalid ${key}`);
  const workers = Number(options.workers ?? "1");
  if (
    !/^\d+$/.test(options.workers ?? "1") ||
    !Number.isSafeInteger(workers) ||
    workers < 1
  )
    throw new Error("workers must be a positive safe integer");
  if (options.target && !Object.hasOwn(targets, options.target))
    throw new Error(`Unknown target: ${options.target}`);
  if (options.target && options.component)
    throw new Error("Use either --target or --component");
  if (options.component && !/^[a-z][a-z0-9-]*$/.test(options.component))
    throw new Error(`Invalid component: ${options.component}`);
  if (
    options.browser &&
    !["chromium", "firefox", "webkit"].includes(options.browser)
  )
    throw new Error(`Invalid browser: ${options.browser}`);
  // A component selects its own specs and axe stories by tag, across files.
  if (options.component) return { workers, targets: [], filters: options };
  const selected = (Object.keys(targets) as Target[]).filter(
    (target) =>
      (!options.target || options.target === target) &&
      (!options.theme ||
        (targets[target].themes as string[]).includes(options.theme)) &&
      (!options.viewport ||
        options.viewport === "desktop" ||
        (options.viewport === "short" && target === "button")),
  );
  if (!selected.length)
    throw new Error(
      "Empty browser selection: no existing scenario matches filters",
    );
  return { workers, targets: selected, filters: options };
}
export function browserArgs(plan: ReturnType<typeof selection>): string[] {
  return [
    `--workers=${plan.workers}`,
    // Without --target the whole suite runs, including every component spec.
    ...(plan.filters.target ? [targets[plan.targets[0] as Target].file] : []),
    ...(plan.filters.browser ? [`--project=${plan.filters.browser}`] : []),
    ...(plan.filters.theme || plan.filters.viewport || plan.filters.component
      ? [
          "--grep",
          `^${[
            plan.filters.component
              ? `(?=.*@component:${plan.filters.component}(?:\\s|$))`
              : "",
            plan.filters.theme
              ? `(?=.*@theme:${plan.filters.theme}(?:\\s|$))`
              : "",
            plan.filters.viewport === "short"
              ? "(?=.*@viewport:short(?:\\s|$))"
              : "",
            plan.filters.viewport === "desktop"
              ? "(?!.*@viewport:short(?:\\s|$))"
              : "",
          ].join("")}.*`,
        ]
      : []),
  ];
}
