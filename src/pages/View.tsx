import { useParams, useSearchParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Match, Show, Switch, createMemo } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";
import { useAuth } from "../context/AuthContext";

async function markChapterFn(chapterId: string, userToken: string) {
  console.log("Mark Chapter", chapterId, userToken);
  const res = await fetch(
    `http://localhost:3000/api/v1/chapters/${chapterId}/mark`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  );

  console.log(await res.json());
}

async function unmarkChapterFn(chapterId: string, userToken: string) {
  console.log("Unmark Chapter", chapterId, userToken);
  const res = await fetch(
    `http://localhost:3000/api/v1/chapters/${chapterId}/unmark`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  );

  console.log(await res.json());
}

const View = () => {
  const params = useParams<{ serieId: string; chapterNumber: string }>();

  const [searchParams, setSearchParams] = useSearchParams<{
    page: string;
  }>();

  const apiClient = useApiClient();

  const auth = useAuth();

  const chapter = createQuery(() => ({
    queryKey: [params.serieId, "chapters", params.chapterNumber],
    // TODO(patrik): Remove parseInt here
    queryFn: () =>
      apiClient.getChapterById(params.serieId, parseInt(params.chapterNumber)),
  }));

  const markChapter = createMutation(() => ({
    mutationFn: (data: { chapterId: string; userId: string }) =>
      markChapterFn(data.chapterId, data.userId),
  }));

  const unmarkChapter = createMutation(() => ({
    mutationFn: (data: { chapterId: string; userId: string }) =>
      unmarkChapterFn(data.chapterId, data.userId),
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
      <p>
        View Page: {params.serieId} - {params.chapterNumber}
      </p>
      <p>Page: {searchParams.page}</p>
      <button
        onClick={() => {
          if (!chapter.data || !auth.token) return;

          // markChapter.mutate({
          //   chapterId: chapter.data.id,
          //   userId: auth.token,
          // });
        }}
      >
        Mark Chapter
      </button>

      <button
        onClick={() => {
          if (!chapter.data || !auth.token) return;

          // unmarkChapter.mutate({
          //   chapterId: chapter.data.id,
          //   userId: auth.token,
          // });
        }}
      >
        Unmark Chapter
      </button>

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
          <p>{chapter.data?.number}</p>

          <a href={`/serie/${chapter.data?.serieId}`}>Goto Serie</a>

          <Show when={chapter.data?.nextChapter}>
            <a
              href={`/view/${chapter.data?.serieId}/${chapter.data?.nextChapter}`}
            >
              Next Chapter
            </a>
          </Show>

          <Show when={chapter.data?.prevChapter}>
            <a
              href={`/view/${chapter.data?.serieId}/${chapter.data?.prevChapter}`}
            >
              Prev Chapter
            </a>
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
