import { useAuth } from "../context/AuthContext";
import { ApiGetChapterById } from "../models/chapter";

export async function getChapterById(id: string) {
  const auth = useAuth();
  console.log(auth);

  const res = await fetch(`http://localhost:3000/api/v1/chapters/${id}`, {
    headers: {
      Authorization: `Bearer ${auth.token!}`,
    },
  });
  const data = await res.json();

  return (await ApiGetChapterById.parseAsync(data)).data;
}
