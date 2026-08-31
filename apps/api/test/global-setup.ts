import dotenv from "dotenv";
import path from "node:path";

export default async function setup() {
  dotenv.config({ path: path.resolve(import.meta.dirname, "../.env.test"), override: true });

  const { AppDataSource } = await import("../src/data-source.js");
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
}
