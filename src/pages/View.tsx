import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch } from "solid-js";
import { getChapterById } from "../api/chapter";

const View = () => {
  const params = useParams<{ id: string }>();

  const chapter = createQuery(() => ({
    queryKey: ["chapters", params.id],
    queryFn: () => getChapterById(params.id),
  }));

  return (
    <>
      <p>View Page: {params.id}</p>

      <Switch>
        <Match when={chapter.isLoading}>
          <p>Loading...</p>
        </Match>

        <Match when={chapter.isError}>
          <p>Error: {chapter.error?.message}</p>
        </Match>

        <Match when={chapter.isSuccess}>
          <p>{chapter.data?.title}</p>
          <p>{chapter.data?.index}</p>

          <a href={`/serie/${chapter.data?.serieId}`}>Goto Serie</a>

          <Show when={chapter.data?.nextChapterId}>
            <a href={`/view/${chapter.data?.nextChapterId}`}>Next Chapter</a>
          </Show>

          <Show when={chapter.data?.prevChapterId}>
            <a href={`/view/${chapter.data?.prevChapterId}`}>Prev Chapter</a>
          </Show>

          <For each={chapter.data?.pages}>
            {(page) => {
              return (
                <img loading="lazy" src={page} alt="Page" draggable="false" />
              );
            }}
          </For>
        </Match>
      </Switch>
    </>
  );
};

export default View;
