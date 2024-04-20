import { useParams, useSearchParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import {
  HiSolidChevronLeft,
  HiSolidChevronRight,
  HiSolidXMark,
} from "solid-icons/hi";
import { Match, Show, Switch, createMemo, createSignal } from "solid-js";
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
    if (nextPage < chapter.data.pages.length) {
      setSearchParams({ page: nextPage.toString() });
    }
  };

  const prevPage = () => {
    if (!chapter.data) return;

    const prevPage = currentPage() - 1;
    if (prevPage >= 0) {
      setSearchParams({ page: prevPage.toString() });
    }
  };

  const [showMenu, setShowMenu] = createSignal(false);

  return (
    <Switch>
      <Match when={chapter.isLoading}>
        <p>Loading...</p>
      </Match>

      <Match when={chapter.isError}>
        <p>Error: {chapter.error?.message}</p>
      </Match>

      <Match when={chapter.isSuccess}>
        <Show when={page()}>
          <button
            class="absolute left-0 h-full w-1/2 bg-red-300/60"
            onClick={nextPage}
          ></button>
          <button
            class="absolute right-0 h-full w-1/2 bg-blue-300/60"
            onClick={prevPage}
          ></button>

          <div class="flex h-screen w-full items-center justify-center py-2">
            <img
              class="max-h-full border-2 object-scale-down"
              src={page()}
              alt="Page"
            />
          </div>
        </Show>

        <div
          class={`fixed h-20 w-full bg-purple-700/60 transition-[bottom] ${showMenu() ? "bottom-0" : "-bottom-20"}`}
        >
          <button
            class="absolute -top-6 right-[50%] h-6 w-10 translate-x-[50%] bg-red-500"
            onClick={() => setShowMenu((val) => !val)}
          ></button>

          <div class="flex h-full w-full items-center justify-center">
            <a href={`/serie/${chapter.data?.serieId}`}>
              <HiSolidXMark class="h-8 w-8" />
            </a>
            <button onClick={nextPage}>
              <HiSolidChevronLeft class="h-8 w-8" />
            </button>
            <button onClick={prevPage}>
              <HiSolidChevronRight class="h-8 w-8" />
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

export default View;
