import express from "express";
import { AppDataSource } from "./data-source.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { userRouter } from "./routes/user.router.js";

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use(errorHandler);

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
