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

export const ApiGetSerieById = createApiResponse(
  z.object({
    id: z.string().cuid2(),
    name: z.string(),
    cover: z.string().url(),
    chapterCount: z.number(),
  }),
);

export const ApiGetSerieChaptersById = createApiResponse(
  z.object({
    chapters: z.array(
      z.object({
        id: z.string().cuid2(),
        index: z.number(),
        title: z.string(),
        serieId: z.string().cuid2(),
      }),
    ),
  }),
);
