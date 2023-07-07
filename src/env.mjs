import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",

  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    REDIS_SECRET: z.string(),

    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },

  client: {},

  runtimeEnv: process.env,
});
