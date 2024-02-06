import { useParams, useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Match, Show, Switch, createMemo } from "solid-js";
import { getChapterById } from "../api/chapter";

const View = () => {
  const params = useParams<{ id: string }>();

  const [searchParams, setSearchParams] = useSearchParams<{
    page: string;
  }>();

  const chapter = createQuery(() => ({
    queryKey: ["chapters", params.id],
    queryFn: () => getChapterById(params.id),
  }));

  const currentPage = createMemo(() => {
    if (searchParams.page) {
      return parseInt(searchParams.page);
    }

    return 0;
  });

  const page = createMemo(() => {
    const page = currentPage();
    return chapter.data?.pages[page];
  });

  const nextPage = () => {
    if (!chapter.data) return;

    const nextPage = currentPage() + 1;
    if (nextPage < chapter.data.pages.length + 1) {
      setSearchParams({ page: nextPage.toString() });
    }
  };

  return (
    <>
      <p>View Page: {params.id}</p>
      <p>View Page: {searchParams.page}</p>
      <button
        onClick={() => {
          nextPage();
        }}
      >
        Click
      </button>

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

          <Show when={page()}>
            <img src={page()} alt="Page" />
          </Show>
        </Match>
      </Switch>
    </>
  );
};

export default View;
