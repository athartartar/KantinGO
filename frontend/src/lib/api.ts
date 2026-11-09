import type { AppType } from "@kantingo/backend";
import { hc } from "hono/client";

export const api = hc<AppType>("/");
