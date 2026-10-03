import { spawnSync } from "node:child_process";

console.log(
  "Verification scope: delivered technical gates, including token/theme browser tests. Complete B2/B3, visual baseline approval and independent review remain outside this command.",
);
for (const gate of [
  "check",
  "test",
  "build",
  "build-storybook",
  "test:package",
  "test:browser",
]) {
  const result = spawnSync("pnpm", [gate], { stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) {
    console.error(`Technical verification FAILED at ${gate}`);
    process.exit(result.status || 1);
  }
}
console.log(
  "Delivered technical gates PASS. Complete foundation remains unverified: remaining B2/B3 requirements are not delivered.",
);
