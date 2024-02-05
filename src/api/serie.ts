import { ApiGetSeries } from "../models/serie";

export async function getSeries() {
  const res = await fetch("http://localhost:3000/api/v1/series");
  const data = await res.json();

  return (await ApiGetSeries.parseAsync(data)).data;
}
