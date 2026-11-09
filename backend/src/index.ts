import { Hono } from "hono";
import { menus } from "./routes/menus";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/menus", menus);

export type AppType = typeof routes;
export default app;
