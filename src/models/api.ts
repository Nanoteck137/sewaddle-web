import { z } from "zod";

export function createApiResponse<
  Data extends z.ZodTypeAny,
  Errors extends z.ZodTypeAny,
>(data: Data, errors: Errors) {
  const error = z.object({
    code: z.number(),
    message: z.string(),
    errors,
  });

  return z.discriminatedUnion("status", [
    z.object({ status: z.literal("success"), data }),
    z.object({ status: z.literal("error"), error }),
  ]);
}
