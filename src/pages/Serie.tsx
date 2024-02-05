import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { getSerieById, getSerieChaptersById } from "../api/serie";

const Serie = () => {
  const params = useParams<{ id: string }>();

  const serie = createQuery(() => ({
    queryKey: ["series", params.id],
    queryFn: () => getSerieById(params.id),
  }));

  const chapters = createQuery(() => ({
    queryKey: ["series", params.id, "chapters"],
    queryFn: () => getSerieChaptersById(params.id),
  }));

  return (
    <>
      <p>Series page: {params.id}</p>

      <Switch>
        <Match when={serie.isLoading || chapters.isLoading}>
          <p>Loading...</p>
        </Match>

        <Match when={serie.isError}>
          <p>Error: {serie.error?.message}</p>
        </Match>

        <Match when={chapters.isError}>
          <p>Error: {chapters.error?.message}</p>
        </Match>

        <Match when={serie.isSuccess && chapters.isSuccess}>
          <p>{serie.data?.name}</p>
          <img src={serie.data?.cover} alt="Cover Image" />

          <div>
            <For each={chapters.data?.chapters}>
              {(chapter) => {
                return (
                  <p>
                    {chapter.index} - {chapter.title}
                  </p>
                );
              }}
            </For>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default Serie;
