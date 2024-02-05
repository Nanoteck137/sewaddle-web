import { ApiGetChapterById } from "../models/chapter";

export async function getChapterById(id: string) {
  const res = await fetch(`http://localhost:3000/api/v1/chapters/${id}`);
  const data = await res.json();

  return (await ApiGetChapterById.parseAsync(data)).data;
}
