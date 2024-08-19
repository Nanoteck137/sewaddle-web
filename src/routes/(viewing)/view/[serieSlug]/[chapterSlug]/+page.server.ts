import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

type Layout = "paged" | "scroll";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const layoutParam = url.searchParams.get("layout");

  let layout: Layout = "paged";
  if (layoutParam === "scroll") {
    layout = "scroll";
  }

  const page = url.searchParams.get("page");
  if (!page && layout === "paged") {
    throw redirect(301, url.pathname + "?page=0");
  }

  const chapter = await locals.apiClient.getChapterById(
    params.serieSlug,
    params.chapterSlug,
  );
  if (!chapter.success) {
    throw error(chapter.error.code, { message: chapter.error.message });
  }

  let pageNum = 0;
  if (layout === "paged") {
    if (page === "last") {
      throw redirect(
        301,
        url.pathname + "?page=" + (chapter.data.pages.length - 1).toString(),
      );
    } else {
      pageNum = parseInt(page || "0");
    }
  }

  const isFirstPage = pageNum <= 0;
  const isLastPage = pageNum >= chapter.data.pages.length - 1;

  return {
    chapter: chapter.data,
    page: pageNum,
    isFirstPage,
    isLastPage,
    layout,
  };
};
