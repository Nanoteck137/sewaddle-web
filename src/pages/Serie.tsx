import { useNavigate, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { HiSolidCheck } from "solid-icons/hi";
import { For, Match, Show, Switch, createSignal } from "solid-js";
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

  const [selectedItems, setSelectedItems] = createSignal<number[]>([]);

  const isSelected = (chapterNumber: number) => {
    return !!selectedItems().find((i) => i === chapterNumber);
  };

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

            <Show when={!!serie.data?.user?.bookmark}>
              <a
                class="rounded bg-gray-300 p-2 hover:bg-gray-400"
                href={`/view/${serie.data?.id}/${serie.data?.user?.bookmark?.chapterNumber}?page=${serie.data?.user?.bookmark?.page}`}
              >
                Continue
              </a>
            </Show>

            <div class="flex flex-col gap-2">
              <For each={chapters.data?.chapters}>
                {(chapter, i) => {
                  return (
                    <div class="flex items-center justify-between border-b">
                      <div
                        class="group flex cursor-pointer gap-2 py-1"
                        onClick={() => {
                          navigate(
                            `/view/${chapter.serieId}/${chapter.number}`,
                          );
                        }}
                      >
                        <p class="w-14 text-right font-mono">
                          {chapter.number}.
                        </p>
                        <img
                          class="h-16 w-12 rounded border object-cover"
                          src={chapter.coverArt}
                          alt="Chapter Cover Art"
                          loading="lazy"
                        />
                        <div class="flex flex-col">
                          <p class="group-hover:underline">{chapter.title}</p>
                          {chapter.user && chapter.user.isMarked && (
                            <p class="text-sm text-gray-500">Read</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <button
                          class="flex h-6 w-6 items-center justify-center bg-red-300"
                          onClick={(e) => {
                            if (!chapters.data) return;

                            if (e.shiftKey) {
                              const firstSelected = selectedItems()[0];
                              let first = chapters.data.chapters.findIndex(
                                (i) => i.number === firstSelected,
                              );

                              let last = i();
                              if (first > last) {
                                const tmp = last;
                                last = first;
                                first = tmp;
                              }

                              const items = [];
                              const numItems = last - first + 1;
                              for (let i = 0; i < numItems; i++) {
                                items.push(first + i);
                              }

                              const ids = items.map(
                                (i) => chapters.data.chapters[i].number,
                              );
                              setSelectedItems(ids);
                            } else {
                              if (isSelected(chapter.number)) {
                                setSelectedItems((prev) => [
                                  ...prev.filter(
                                    (num) => num !== chapter.number,
                                  ),
                                ]);
                              } else {
                                setSelectedItems((prev) => [
                                  ...prev,
                                  chapter.number,
                                ]);
                              }
                            }
                          }}
                        >
                          <Show when={isSelected(chapter.number)}>
                            <HiSolidCheck class="h-6 w-6" />
                          </Show>
                        </button>
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
