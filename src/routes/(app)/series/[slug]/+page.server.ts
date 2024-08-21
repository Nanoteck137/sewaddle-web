import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const serie = await locals.apiClient.getSerieById(params.slug);
  if (!serie.success) {
    throw error(serie.error.code, { message: serie.error.message });
  }

  const chapters = await locals.apiClient.getSerieChapters(params.slug);
  if (!chapters.success) {
    throw error(chapters.error.code, { message: chapters.error.message });
  }

  return {
    serie: serie.data,
    chapters: chapters.data.chapters,
  };
};

export const actions: Actions = {
  markChapter: async ({ locals, request }) => {
    if (!locals.loggedIn) throw error(400, "Not logged in");

    const formData = await request.formData();

    const serieSlug = formData.get("serieSlug");
    if (!serieSlug) {
      throw error(500, "'serieSlug' not set");
    }

    const chapterSlug = formData.get("chapterSlug");
    if (!chapterSlug) {
      throw error(500, "'chapterSlug' not set");
    }

    const res = await locals.apiClient.markChapters({
      serieSlug: serieSlug.toString(),
      chapters: [chapterSlug.toString()],
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }
  },

  setBookmark: async ({ locals, request }) => {
    if (!locals.loggedIn) throw error(400, "Not logged in");

    const formData = await request.formData();

    const serieSlug = formData.get("serieSlug");
    if (!serieSlug) {
      throw error(500, "'serieSlug' not set");
    }

    const chapterSlug = formData.get("chapterSlug");
    if (!chapterSlug) {
      throw error(500, "'chapterSlug' not set");
    }

    const res = await locals.apiClient.updateBookmark({
      serieSlug: serieSlug.toString(),
      chapterSlug: chapterSlug.toString(),
      page: 0,
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }
  },
};
