import { z } from "zod";
import { createApiResponse } from "./api";

export const ApiPostSignin = createApiResponse(
  z.object({
    token: z.string(),
  }),
);

export const ApiGetMe = createApiResponse(
  z.object({
    id: z.string().cuid2(),
    username: z.string(),
  }),
);
