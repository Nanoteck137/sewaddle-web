import { useParams } from "@solidjs/router";
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { HiSolidCheck } from "solid-icons/hi";
import { Component, For, Match, Show, Switch, createSignal } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";
import { useAuth } from "../context/AuthContext";
import {
  PostUserMarkChaptersBody,
  PostUserUnmarkChaptersBody,
} from "../lib/models/apiGen";

type ChapterItemProps = {
  number: string;
  title: string;
  read?: boolean;

  showCheckMark: boolean;
  onSelectClicked: (shiftKey: boolean) => void;
};

const ChapterItem: Component<ChapterItemProps> = (props) => {
  return (
    <div class="flex items-center justify-between border-b pr-4">
      <div class="group flex cursor-pointer gap-2 py-1">
        <p
          class={`w-14 text-right font-mono ${props.read ? "text-green-600" : ""}`}
        >
          {props.number}.
        </p>
        <div class="flex flex-col">
          <p
            class={`group-hover:underline ${props.read ? "text-green-600" : ""}`}
          >
            {props.title}
          </p>
        </div>
      </div>
      <div>
        <button
          class="flex h-6 w-6 items-center justify-center bg-red-300"
          onClick={(e) => {
            props.onSelectClicked(e.shiftKey);
          }}
        >
          <Show when={props.showCheckMark}>
            <HiSolidCheck class="h-6 w-6" />
          </Show>
        </button>
      </div>
    </div>
  );
};

const Serie = () => {
  const params = useParams<{ id: string }>();

  const apiClient = useApiClient();

  const auth = useAuth();
  const user = auth.user();

  const serie = createQuery(() => ({
    queryKey: ["series", params.id],
    queryFn: async () => {
      const res = await apiClient.getSerieById(params.id);
      if (res.status === "error") throw new Error(res.error.message);
      return res.data;
    },
  }));

  const queryClient = useQueryClient();

  const chapters = createQuery(() => ({
    queryKey: ["series", params.id, "chapters"],
    queryFn: async () => {
      user();
      const res = await apiClient.getSerieChapters(params.id);
      if (res.status === "error") throw new Error(res.error.message);
      return res.data;
    },
  }));

  const markChapter = createMutation(() => ({
    mutationFn: (data: PostUserMarkChaptersBody) =>
      apiClient.markChapters(data),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: ["series", params.id, "chapters"],
        })
        .then(() => {
          setSelectedItems([]);
        });
    },
  }));

  const unmarkChapter = createMutation(() => ({
    mutationFn: (data: PostUserUnmarkChaptersBody) =>
      apiClient.unmarkChapters(data),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: ["series", params.id, "chapters"],
        })
        .then(() => {
          setSelectedItems([]);
        });
    },
  }));

  const [selectedItems, setSelectedItems] = createSignal<number[]>([]);

  const isSelected = (chapterNumber: number) => {
    return !!selectedItems().find((i) => i === chapterNumber);
  };

  const showSelectionMenu = () => {
    return selectedItems().length > 0;
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
              <ChapterItem
                number="Num"
                title="Title"
                showCheckMark={
                  selectedItems().length >= chapters.data?.chapters.length!
                }
                onSelectClicked={() => {
                  if (!chapters.data) return;

                  const ids = chapters.data.chapters.map(
                    (chapter) => chapter.number,
                  );

                  setSelectedItems((prev) => {
                    if (prev.length >= ids.length) {
                      return [];
                    } else {
                      return ids;
                    }
                  });
                }}
              />

              <For each={chapters.data?.chapters}>
                {(chapter, i) => {
                  return (
                    <ChapterItem
                      number={chapter.number.toString()}
                      title={chapter.title}
                      read={chapter.user?.isMarked}
                      showCheckMark={isSelected(chapter.number)}
                      onSelectClicked={(shiftKey) => {
                        if (!chapters.data) return;

                        if (shiftKey) {
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
                              ...prev.filter((num) => num !== chapter.number),
                            ]);
                          } else {
                            setSelectedItems((prev) => [
                              ...prev,
                              chapter.number,
                            ]);
                          }
                        }
                      }}
                    />
                  );
                }}
              </For>
            </div>
            <Show when={showSelectionMenu()}>
              <div class="fixed bottom-8 left-1/2 h-10 w-64 -translate-x-1/2 bg-red-200">
                <button
                  onClick={() => {
                    if (!serie.data) return;

                    markChapter.mutate({
                      serieId: serie.data.id,
                      chapters: selectedItems(),
                    });
                  }}
                >
                  Mark
                </button>
                <button
                  onClick={() => {
                    if (!serie.data) return;

                    unmarkChapter.mutate({
                      serieId: serie.data.id,
                      chapters: selectedItems(),
                    });
                  }}
                >
                  Unmark
                </button>
              </div>
            </Show>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default Serie;
