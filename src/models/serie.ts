import { z } from "zod";
import { createApiResponse } from "./api";

export const ApiGetSeries = createApiResponse(
  z.object({
    series: z.array(
      z.object({
        id: z.string().cuid2(),
        name: z.string(),
        cover: z.string().url(),
        chapterCount: z.number(),
      }),
    ),
  }),
);
