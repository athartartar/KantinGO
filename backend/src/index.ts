import { Hono } from "hono";
import { errorHandler } from "./middleware/error-handler";
import { auth } from "./routes/auth";
import { me } from "./routes/me";
import { menus } from "./routes/menus";

const app = new Hono().basePath("/api");

app.onError(errorHandler);

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/auth", auth)
  .route("/me", me)
  .route("/menus", menus);

export type AppType = typeof routes;
export default app;
