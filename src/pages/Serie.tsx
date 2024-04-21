import { useNavigate, useParams } from "@solidjs/router";
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

  const navigate = useNavigate();

  return (
    <>
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
          <div class="px-2">
            <p class="border-b border-black p-2 text-center text-2xl">
              {serie.data?.name}
            </p>
            <div class="h-2"></div>
            <img
              class="rounded border"
              src={serie.data?.cover}
              alt="Cover Image"
            />

            <div class="flex flex-col gap-2">
              <For each={chapters.data?.chapters}>
                {(chapter) => {
                  return (
                    <div
                      class="group flex cursor-pointer gap-2 border-b py-1"
                      onClick={() => {
                        navigate(`/view/${chapter.serieId}/${chapter.number}`);
                      }}
                    >
                      <p class="w-12 text-right font-mono">
                        {chapter.number}.
                      </p>
                      <img
                        loading="lazy"
                        class="h-16 w-12 rounded border object-cover"
                        src={chapter.coverArt}
                        alt="Chapter Cover Art"
                      />
                      <p class="group-hover:underline">{chapter.title}</p>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default Serie;
