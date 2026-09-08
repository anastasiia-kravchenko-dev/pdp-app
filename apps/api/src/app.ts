import express from "express";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.router.js";
import { userRouter } from "./routes/user.router.js";
import { postRouter } from "./routes/post.router.js";

export const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter)
app.use(errorHandler);
