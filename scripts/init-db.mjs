import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = resolve(rootDir, "prisma", "dev.db");
const migrationPath = resolve(
  rootDir,
  "prisma",
  "migrations",
  "0001_init",
  "migration.sql"
);

const db = new DatabaseSync(databasePath);
const migrationSql = readFileSync(migrationPath, "utf8");

db.exec(migrationSql);
db.close();

console.log(`SQLite database initialized at ${databasePath}`);
