import {
  ApiGetSerieById,
  ApiGetSerieChaptersById,
  ApiGetSeries,
} from "../models/serie";

export async function getSeries() {
  const res = await fetch("http://localhost:3000/api/v1/series");
  const data = await res.json();

  return (await ApiGetSeries.parseAsync(data)).data;
}

export async function getSerieById(id: string) {
  const res = await fetch(`http://localhost:3000/api/v1/series/${id}`);
  const data = await res.json();

  return (await ApiGetSerieById.parseAsync(data)).data;
}

export async function getSerieChaptersById(id: string) {
  const res = await fetch(
    `http://localhost:3000/api/v1/series/${id}/chapters`,
  );
  const data = await res.json();

  return (await ApiGetSerieChaptersById.parseAsync(data)).data;
}
