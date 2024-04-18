import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";

const Serie = () => {
  const params = useParams<{ id: string }>();

  const apiClient = useApiClient();

  const serie = createQuery(() => ({
    queryKey: ["series", params.id],
    queryFn: () => apiClient.getSerieById(params.id),
  }));

  const chapters = createQuery(() => ({
    queryKey: ["series", params.id, "chapters"],
    queryFn: () => apiClient.getSerieChaptersById(params.id),
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

          <div class="flex flex-col">
            <For each={chapters.data?.chapters}>
              {(chapter) => {
                return (
                  <a href={`/view/${serie.data?.id}/${chapter.number}`}>
                    {chapter.number} - {chapter.title}
                  </a>
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
