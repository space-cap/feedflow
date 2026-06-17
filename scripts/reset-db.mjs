import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const dbPath = resolve("prisma", "dev.db");

if (existsSync(dbPath)) {
  rmSync(dbPath);
}

for (const command of [
  ["npm", ["run", "db:init"]],
  ["npm", ["run", "db:seed"]]
]) {
  const result = spawnSync(command[0], command[1], {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
