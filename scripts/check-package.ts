import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { checkFontAssets } from "./check-font-assets.ts";
import { checkPublicJavaScript } from "./check-public-javascript.ts";
import { checkPublicTypes } from "./check-public-types.ts";

const consumer = mkdtempSync(join(tmpdir(), "bench-design-consumer-"));
const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { cwd: consumer, stdio: "inherit" });
try {
  execFileSync("pnpm", ["pack", "--pack-destination", consumer], {
    stdio: "inherit",
  });
  const tarballName = readdirSync(consumer).find((name) =>
    name.endsWith(".tgz"),
  );
  assert(tarballName, "packed tarball is missing");
  const tarball = join(consumer, tarballName);
  const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
    .trim()
    .split("\n");
  assert(
    entries.includes("package/dist/index.js"),
    "packed ESM entry is missing",
  );
  assert(
    entries.includes("package/dist/index.d.ts"),
    "packed types are missing",
  );
  assert(
    entries.every(
      (entry) =>
        entry.startsWith("package/dist/") ||
        ["package/package.json", "package/README.md"].includes(entry),
    ),
    "unexpected private/source/test file in tarball",
  );
  for (const name of [
    "tokens.css",
    "tokens.json",
    "AGENTS.md",
    "styles.css",
    "link.css",
    "theme-init.js",
  ]) {
    assert(entries.includes(`package/dist/${name}`), `packed ${name} missing`);
  }
  const extracted = join(consumer, "extracted");
  mkdirSync(extracted);
  execFileSync("tar", ["-xzf", tarball, "-C", extracted]);
  checkPublicTypes(join(extracted, "package/dist"));
  checkPublicJavaScript(join(extracted, "package/dist"));
  checkFontAssets(pathToFileURL(join(extracted, "package/dist/styles.css")));
  const pkg: {
    packageManager: string;
    devDependencies: { typescript: string; "@types/react": string };
  } = JSON.parse(readFileSync("package.json", "utf8"));
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      packageManager: pkg.packageManager,
      dependencies: {
        "bench-design": `file:${tarball}`,
        // Explicit tested lower bound, independent of the package peer ranges.
        react: "19.3.0",
        "react-dom": "19.3.0",
      },
      devDependencies: {
        typescript: pkg.devDependencies.typescript,
        "@types/react": pkg.devDependencies["@types/react"],
      },
    }),
  );
  writeFileSync(
    join(consumer, "index.tsx"),
    `import { Button, type ButtonProps, Heading, type HeadingProps, Text, type TextProps, Link, type LinkProps, Icon, type IconProps, type IconName } from "bench-design";
import { createRef } from "react";
const props: ButtonProps = { children: "Save", type: "submit", variant: "primary", ref: createRef<HTMLButtonElement>(), onPress: () => {}, isDisabled: false, "aria-label": "Save document", "aria-labelledby": "save-label" };
const button = <Button {...props} />;
// @ts-expect-error content is required
const missingContent = <Button />;
// @ts-expect-error general HTML passthrough is excluded
const click = <Button onClick={() => {}}>Save</Button>;
// @ts-expect-error routing is excluded
const link = <Button href="/">Save</Button>;
// @ts-expect-error unapproved variant
const variant = <Button variant="tertiary">Save</Button>;
// @ts-expect-error unapproved type
const type = <Button type="link">Save</Button>;
const headingProps: HeadingProps = { level: 2, size: "ui", children: "Details" };
const heading = <Heading {...headingProps} />;
// @ts-expect-error level is required
const missingLevel = <Heading>Details</Heading>;
// @ts-expect-error unapproved size
const headingSize = <Heading level={2} size="hero">Details</Heading>;
const textProps: TextProps = { size: "body", tone: "muted", variant: "default", as: "span", children: "Read" };
const text = <Text {...textProps} />;
// @ts-expect-error content is required
const missingText = <Text />;
// @ts-expect-error unapproved size
const textSize = <Text size="display">Read</Text>;
// @ts-expect-error unapproved tone
const textTone = <Text tone="danger">Read</Text>;
// @ts-expect-error unapproved variant
const textVariant = <Text variant="caption">Read</Text>;
// @ts-expect-error unapproved element
const textTag = <Text as="div">Read</Text>;
// @ts-expect-error general HTML passthrough is excluded
const textClass = <Text className="custom">Read</Text>;
const linkProps: LinkProps = { href: "/chapter", children: "Read", external: true, ref: createRef<HTMLAnchorElement>(), "aria-label": "Read chapter" };
const navigation = <Link {...linkProps} />;
// @ts-expect-error href is required
const missingHref = <Link>Read</Link>;
// @ts-expect-error children are required
const missingLinkContent = <Link href="/" />;
// @ts-expect-error disabled links are excluded
const disabledLink = <Link href="/" isDisabled>Read</Link>;
// @ts-expect-error target is owned by external
const linkTarget = <Link href="/" target="_blank">Read</Link>;
// @ts-expect-error general HTML passthrough is excluded
const linkClass = <Link href="/" className="custom">Read</Link>;
const iconName: IconName = "search";
const iconProps: IconProps = { name: iconName, size: 20, label: "Search" };
const icon = <Icon {...iconProps} />;
// @ts-expect-error name is required
const missingIconName = <Icon />;
// @ts-expect-error unknown icon
const unknownIcon = <Icon name="missing" />;
// @ts-expect-error unapproved size
const iconSize = <Icon name="search" size={32} />;
// @ts-expect-error color is inherited
const iconColor = <Icon name="search" color="red" />;
// @ts-expect-error className passthrough is excluded
const iconClass = <Icon name="search" className="custom" />;
// @ts-expect-error style passthrough is excluded
const iconStyle = <Icon name="search" style={{ color: "red" }} />;
void [icon, missingIconName, unknownIcon, iconSize, iconColor, iconClass, iconStyle];
void [navigation, missingHref, missingLinkContent, disabledLink, linkTarget, linkClass];
void [text, missingText, textSize, textTone, textVariant, textTag, textClass];
void [button, missingContent, click, link, variant, type, heading, missingLevel, headingSize];
`,
  );
  run("pnpm", ["install", "--ignore-scripts", "--strict-peer-dependencies"]);
  run("pnpm", [
    "exec",
    "tsc",
    "--noEmit",
    "--strict",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--jsx",
    "react-jsx",
    "index.tsx",
  ]);
  run("node", [
    "--input-type=module",
    "-e",
    'import assert from "node:assert/strict"; import * as ds from "bench-design"; assert.deepEqual(Object.keys(ds), ["Button", "Heading", "Icon", "Link", "Text"]); assert.equal(typeof ds.Button, "function"); assert.equal(typeof ds.Heading, "function"); assert.equal(typeof ds.Text, "function"); assert.equal(typeof ds.Link, "function"); assert.equal(typeof ds.Icon, "function");',
  ]);
  run("node", [
    "--input-type=module",
    "-e",
    `
    import assert from "node:assert/strict";
    import { readFileSync } from "node:fs";
    const tokens = readFileSync(new URL(import.meta.resolve("bench-design/tokens.css")), "utf8");
    assert(tokens.includes("--bd-surface:"));
    const styles = readFileSync(new URL(import.meta.resolve("bench-design/styles.css")), "utf8");
    assert(styles.includes('@import "./tokens.css"'));
    const init = await import("bench-design/theme-init.js");
    assert.deepEqual(Object.keys(init), []);
  `,
  ]);
  checkFontAssets(
    pathToFileURL(join(consumer, "node_modules/bench-design/dist/styles.css")),
  );
  console.log(
    "Distribution PASS: isolated tarball ESM/types, Button, Heading, Text, Link and Icon public API, no private files",
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
