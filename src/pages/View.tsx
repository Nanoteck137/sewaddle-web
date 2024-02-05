import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
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
