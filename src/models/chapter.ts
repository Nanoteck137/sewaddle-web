import { z } from "zod";
import { createApiResponse } from "./api";

export const ApiGetChapterById = createApiResponse(
  z.object({
    id: z.string().cuid2(),
    index: z.number(),
    title: z.string(),
    serieId: z.string().cuid2(),
    pages: z.array(z.string().url()),
  }),
);
