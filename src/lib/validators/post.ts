import { z } from "zod";

export const PostValidator = z.object({
  title: z.string().min(3).max(255),
  subredditId: z.string(),
  content: z.any(),
});

export type PostCreateRequest = z.infer<typeof PostValidator>;
