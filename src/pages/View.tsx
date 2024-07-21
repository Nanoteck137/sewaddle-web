import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import {
  HiSolidArchiveBox,
  HiSolidArrowLongLeft,
  HiSolidArrowLongRight,
  HiSolidBookmark,
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
import toast from "solid-toast";
import { useApiClient } from "../context/ApiClientContext";
import { useAuth } from "../context/AuthContext";

type Layout = "paged" | "scroll";

const View = () => {
  const params = useParams<{ serieId: string; chapterNumber: string }>();

  const [searchParams, setSearchParams] = useSearchParams<{
    page: string;
  }>();

  const apiClient = useApiClient();
  const auth = useAuth();
  const user = auth.user();

  const chapter = createQuery(() => ({
    queryKey: [params.serieId, "chapters", params.chapterNumber],
    queryFn: async () => {
      const res = await apiClient.getChapterById(
        params.serieId,
        params.chapterNumber,
      );
      if (res.status === "error") {
        throw new Error(res.error.message);
      }
      return res.data;
    },
  }));

  const markChapter = createMutation(() => ({
    mutationFn: (data: { serieId: string; chapterNumber: number }) =>
      apiClient.markChapters({
        serieId: data.serieId,
        chapters: [data.chapterNumber],
      }),

    onError: () => {
      toast.error("Failed to mark chapter read");
    },

    onSuccess: () => {
      toast.success("Marked chapter read");
    },
  }));

  const updateBookmark = createMutation(() => ({
    mutationFn: () =>
      apiClient.updateBookmark({
        serieId: chapter.data!.serieId,
        chapter: chapter.data!.number,
        page: currentPage(),
      }),
    onError: () => {
      toast.error("Failed to update bookmark");
    },
    onSuccess: () => {
      toast.success("Updated bookmark");
    },
  }));

  const currentPage = createMemo(() => {
    if (searchParams.page) {
      return parseInt(searchParams.page);
    }

    return 0;
  });

  const [layout, setLayout] = createSignal<Layout>("paged");

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
      if (showLastChapter()) {
        navigate(
          `/view/${chapter.data?.serieId}/${chapter.data?.nextChapter}`,
        );
        setShowLastChapter(false);
      } else {
        setShowLastChapter(true);

        if (!!user()) {
          markChapter.mutate({
            serieId: chapter.data.serieId,
            chapterNumber: chapter.data.number,
          });
        }
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

    // NOTE(patrik): I hate it

    if (layout() == "scroll" && searchParams.page) {
      setTimeout(() => {
        const page = parseInt(searchParams.page || "0");
        console.log(document.getElementById(`page-${page}`));
        document.getElementById(`page-${page}`)?.scrollIntoView();
      }, 400);
    }
  });

  createEffect(() => {
    if (chapter.data && searchParams.page === "last") {
      gotoLastPage();
    }
  });

  createEffect(() => {
    if (layout() == "scroll") {
      const page = parseInt(searchParams.page || "0");
      document.getElementById(`page-${page}`)?.scrollIntoView();
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
        <Switch>
          <Match when={layout() === "paged"}>
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
                class="absolute left-0 h-full w-1/2 cursor-w-resize"
                onClick={nextPage}
              ></button>
              <button
                class="absolute right-0 h-full w-1/2 cursor-e-resize"
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
          </Match>
          <Match when={layout() === "scroll"}>
            <div class="flex justify-center py-20">
              <p
                class="cursor-pointer text-3xl"
                onClick={() => {
                  if (!chapter.data?.prevChapter) return;

                  navigate(
                    `/view/${chapter.data.serieId}/${chapter.data.prevChapter}`,
                  );
                }}
              >
                Previous Chapter
              </p>
            </div>
            <div>
              {chapter.data?.pages.map((page, i) => {
                return (
                  <div id={`page-${i}`} class="flex justify-center">
                    <img class="border" src={page} alt={`Page ${i}`} />
                  </div>
                );
              })}
            </div>
            <div class="flex justify-center py-20">
              <p
                class="cursor-pointer text-3xl"
                onClick={() => {
                  if (!!user() && chapter.data) {
                    markChapter.mutate({
                      serieId: chapter.data.serieId,
                      chapterNumber: chapter.data.number,
                    });
                  }

                  if (!chapter.data?.nextChapter) return;
                  navigate(
                    `/view/${chapter.data.serieId}/${chapter.data.nextChapter}`,
                  );
                }}
              >
                Next Chapter
              </p>
            </div>
          </Match>
        </Switch>

        <div
          class={`fixed h-20 w-full bg-purple-700/80 text-gray-300 transition-[bottom] ${isBottomMenuOpen() ? "bottom-0" : "-bottom-20"}`}
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

            <button onClick={() => updateBookmark.mutate()}>
              <HiSolidBookmark class="h-8 w-8" />
            </button>

            <button
              onClick={() => {
                setLayout((prev) => {
                  switch (prev) {
                    case "paged":
                      return "scroll";
                    case "scroll":
                      return "paged";
                  }
                });
              }}
            >
              <HiSolidArchiveBox class="h-8 w-8" />
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

export default View;
