import { spawnSync } from "node:child_process";

console.log(
  "Verification scope: B1 technical gates only. B2/B3 and independent review are not validated by this command.",
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
    console.error(`B1 verification FAILED at ${gate}`);
    process.exit(result.status || 1);
  }
}
console.log(
  "B1 technical gates PASS. Complete foundation remains unverified: B2/B3 are not delivered.",
);
