import type { inferRouterOutputs } from "@trpc/server";
import { object, string } from "zod";
import type { AppRouter } from "./server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allTodosOutput = RouterOutputs["posts"]["getAll"];

export type Post = allTodosOutput[number];

export const ChripSchema = object({
  content: string().emoji().min(1).max(280),
});
