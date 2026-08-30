import express from "express";
import { errorHandler } from "./middlewares/error.middleware.js";
import { userRouter } from "./routes/user.router.js";

export const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use(errorHandler);
