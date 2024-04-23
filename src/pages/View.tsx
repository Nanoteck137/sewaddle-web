import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import {
  HiSolidArrowLongLeft,
  HiSolidArrowLongRight,
  HiSolidChevronDoubleLeft,
  HiSolidChevronDoubleRight,
  HiSolidChevronLeft,
  HiSolidChevronRight,
  HiSolidChevronUp,
  HiSolidXMark,
} from "solid-icons/hi";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import { useApiClient } from "../context/ApiClientContext";

// async function markChapterFn(chapterId: string, userToken: string) {
//   console.log("Mark Chapter", chapterId, userToken);
//   const res = await fetch(
//     `http://localhost:3000/api/v1/chapters/${chapterId}/mark`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//       },
//     },
//   );

//   console.log(await res.json());
// }

// async function unmarkChapterFn(chapterId: string, userToken: string) {
//   console.log("Unmark Chapter", chapterId, userToken);
//   const res = await fetch(
//     `http://localhost:3000/api/v1/chapters/${chapterId}/unmark`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//       },
//     },
//   );

//   console.log(await res.json());
// }

const View = () => {
  const params = useParams<{ serieId: string; chapterNumber: string }>();

  const [searchParams, setSearchParams] = useSearchParams<{
    page: string;
  }>();

  const apiClient = useApiClient();

  // const auth = useAuth();

  const chapter = createQuery(() => ({
    queryKey: [params.serieId, "chapters", params.chapterNumber],
    // TODO(patrik): Remove parseInt here
    queryFn: () =>
      apiClient.getChapterById(params.serieId, parseInt(params.chapterNumber)),
  }));

  const markChapter = createMutation(() => ({
    mutationFn: () =>
      apiClient.markChapters(chapter.data!.serieId, [chapter.data!.number]),
  }));

  // const unmarkChapter = createMutation(() => ({
  //   mutationFn: (data: { chapterId: string; userId: string }) =>
  //     unmarkChapterFn(data.chapterId, data.userId),
  // }));

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

  const navigate = useNavigate();
  const [showLastChapter, setShowLastChapter] = createSignal(false);

  const nextPage = () => {
    if (!chapter.data) return;

    const page = currentPage();
    const nextPage = page + 1;
    const isLastPage = page === chapter.data.pages.length - 1;

    if (isLastPage) {
      if (apiClient.user) markChapter.mutate();

      if (showLastChapter()) {
        console.log("Goto next chapter");
        navigate(
          `/view/${chapter.data?.serieId}/${chapter.data?.nextChapter}`,
        );
        setShowLastChapter(false);
      } else {
        setShowLastChapter(true);
      }
    } else {
      if (nextPage < chapter.data.pages.length) {
        setSearchParams({ page: nextPage.toString() });
      }
    }
  };

  const prevPage = () => {
    if (!chapter.data) return;

    const prevPage = currentPage() - 1;
    if (prevPage >= 0) {
      setSearchParams({ page: prevPage.toString() });
    }
    setShowLastChapter(false);
  };

  const gotoFirstPage = () => {
    setSearchParams({ page: 0 });
  };

  const gotoLastPage = () => {
    setSearchParams({ page: (chapter.data?.pages.length || 0) - 1 });
  };

  onMount(() => {
    setShowLastChapter(false);
  });

  createEffect(() => {
    if (chapter.data && searchParams.page === "last") {
      gotoLastPage();
    }
  });

  const [isBottomMenuOpen, setBottomMenuOpen] = createSignal(false);

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
          <Show when={showLastChapter()}>
            <div class="absolute left-[50%] top-[50%] z-10 -translate-x-[50%] -translate-y-[50%] rounded bg-red-800 p-10 text-center">
              <p class="text-white">Last Chapter</p>
              {/* <a
                href={`/view/${chapter.data?.serieId}/${chapter.data?.nextChapter}`}
                class="text-blue-300"
              >
                Goto Next Chapter
              </a> */}
            </div>
          </Show>

          <button
            class="absolute left-0 h-full w-1/2 cursor-w-resize bg-red-300/60"
            onClick={nextPage}
          ></button>
          <button
            class="absolute right-0 h-full w-1/2 cursor-e-resize bg-blue-300/60"
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
          class={`fixed h-20 w-full bg-purple-700/60 transition-[bottom] ${isBottomMenuOpen() ? "bottom-0" : "-bottom-20"}`}
        >
          <button
            class="absolute -top-6 right-[50%] flex h-6 w-10 translate-x-[50%] items-center justify-center rounded-t-md bg-red-500"
            onClick={() => setBottomMenuOpen((val) => !val)}
          >
            <HiSolidChevronUp
              class={`h-6 w-6 transition-[rotate] ${isBottomMenuOpen() ? "rotate-180" : ""}`}
            />
          </button>

          <div class="flex h-full w-full items-center justify-center">
            <a href={`/serie/${chapter.data?.serieId}`}>
              <HiSolidXMark class="h-8 w-8" />
            </a>
            <button onClick={gotoLastPage}>
              <HiSolidArrowLongLeft class="h-8 w-8" />
            </button>
            <Show
              when={chapter.data?.nextChapter}
              fallback={
                <p>
                  <HiSolidChevronDoubleLeft class="h-8 w-8 text-blue-200" />
                </p>
              }
            >
              <a
                href={`/view/${chapter.data?.serieId}/${chapter.data?.nextChapter}`}
              >
                <HiSolidChevronDoubleLeft class="h-8 w-8" />
              </a>
            </Show>
            <button onClick={nextPage}>
              <HiSolidChevronLeft class="h-8 w-8" />
            </button>
            <button onClick={prevPage}>
              <HiSolidChevronRight class="h-8 w-8" />
            </button>
            <Show
              when={chapter.data?.prevChapter}
              fallback={
                <p>
                  <HiSolidChevronDoubleRight class="h-8 w-8 text-blue-200" />
                </p>
              }
            >
              <a
                href={`/view/${chapter.data?.serieId}/${chapter.data?.prevChapter}`}
              >
                <HiSolidChevronDoubleRight class="h-8 w-8" />
              </a>
            </Show>
            <button onClick={gotoFirstPage}>
              <HiSolidArrowLongRight class="h-8 w-8" />
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

export default View;
