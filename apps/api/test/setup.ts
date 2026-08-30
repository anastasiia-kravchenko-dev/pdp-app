import dotenv from "dotenv";
import path from "node:path";

// Loaded before any test file, so DB_* env vars point at `pdp_test` by the
// time `data-source.ts` runs its own `dotenv.config()` (which won't override
// vars that are already set).
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env.test"), override: true });
