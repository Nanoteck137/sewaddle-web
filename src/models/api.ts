import { AnyZodObject, z } from "zod";

export function createApiResponse<T extends AnyZodObject>(data: T) {
  return z.object({
    data,
  });
}
