import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = resolve(rootDir, "prisma", "dev.db");
const migrationsDir = resolve(rootDir, "prisma", "migrations");

const db = new DatabaseSync(databasePath);
const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const migrationDir of migrationDirs) {
  const migrationPath = join(migrationsDir, migrationDir, "migration.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");

  db.exec(migrationSql);
  console.log(`Applied migration ${migrationDir}`);
}
db.close();

console.log(`SQLite database initialized at ${databasePath}`);
