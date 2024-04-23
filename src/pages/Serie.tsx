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
            <div class="flex flex-col py-2 md:flex-row-reverse md:justify-end">
              <p class="h-fit flex-grow border-b border-black px-2 pb-2 text-center text-2xl">
                {serie.data?.name}
              </p>
              <div class="h-2 w-2"></div>
              <div class="flex w-fit">
                <img
                  class="max-h-[400px] rounded border"
                  src={serie.data?.cover}
                  alt="Cover Image"
                />
              </div>
            </div>

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
                      <p class="w-14 text-right font-mono">
                        {chapter.number}.
                      </p>
                      <img
                        loading="lazy"
                        class="h-16 w-12 rounded border object-cover"
                        src={chapter.coverArt}
                        alt="Chapter Cover Art"
                      />
                      <div class="flex flex-col">
                        <p class="group-hover:underline">{chapter.title}</p>
                        {chapter.user && chapter.user.isMarked && (
                          <p class="text-sm text-gray-500">Read</p>
                        )}
                      </div>
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
