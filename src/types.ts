import type { inferRouterOutputs } from "@trpc/server";
import { object, string } from "zod";
import type { AppRouter } from "./server/api/root";
import { type Dispatch, type FormEvent, type SetStateAction } from "react";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allPostsOutput = RouterOutputs["posts"]["getAll"];
type allRepliesOutput = RouterOutputs["posts"]["getRepliesForPost"];

export type Post = allPostsOutput[number];
export type Reply = allRepliesOutput[number];

export const ChripSchema = object({
  content: string().emoji().min(1).max(280),
});

export const ReplySchema = object({
  content: string().emoji().min(1).max(280),
  postId: string(),
});

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export type ReplyWithUser = RouterOutputs["posts"]["getRepliesForPost"][number];

export type PostFormPropType = {
  createChirp: (e: FormEvent<Element>) => void;
  isPosting: boolean;
  emoji: string;
  setEmoji: Dispatch<SetStateAction<string>>;
  profileImageUrl: string;
};
