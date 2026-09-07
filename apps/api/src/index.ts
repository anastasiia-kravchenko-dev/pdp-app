import { app } from "./app.js";
import { AppDataSource } from "./data-source.js";
import { getEnvOrThrow } from "./utils/env.js";

getEnvOrThrow("JWT_ACCESS_SECRET");
getEnvOrThrow("JWT_REFRESH_SECRET");

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully via TypeORM!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
