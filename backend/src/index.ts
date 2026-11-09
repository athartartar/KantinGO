import { Hono } from "hono";
import { errorHandler } from "./middleware/error-handler";
import { admin } from "./routes/admin";
import { auth } from "./routes/auth";
import { cart } from "./routes/cart";
import { categories } from "./routes/categories";
import { checkout } from "./routes/checkout";
import { home } from "./routes/home";
import { me } from "./routes/me";
import { menus } from "./routes/menus";
import { notifications } from "./routes/notifications";
import { orders } from "./routes/orders";
import { payments } from "./routes/payments";
import { points } from "./routes/points";
import { search } from "./routes/search";
import { stalls } from "./routes/stalls";
import { vouchers } from "./routes/vouchers";

const app = new Hono().basePath("/api");

app.onError(errorHandler);

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/auth", auth)
  .route("/me", me)
  .route("/categories", categories)
  .route("/stalls", stalls)
  .route("/menus", menus)
  .route("/search", search)
  .route("/home", home)
  .route("/cart", cart)
  .route("/vouchers", vouchers)
  .route("/points", points)
  .route("/checkout", checkout)
  .route("/payments", payments)
  .route("/orders", orders)
  .route("/admin", admin)
  .route("/notifications", notifications);

export type AppType = typeof routes;
export default app;
