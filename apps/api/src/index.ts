import cors from "cors";
import "dotenv/config";
import express from "express";

import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { healthRouter } from "./routes/health.router.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

export { app };
