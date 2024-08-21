<script lang="ts">
  import { Bookmark, BookPlus, EllipsisVertical } from "lucide-svelte";

  const { data } = $props();

  let showPopupMenu = $state("");
</script>

<div class="flex flex-col gap-2 px-5">
  <div class="flex justify-center md:fixed md:h-full">
    <div class="w-[280px]">
      <img
        class="h-[360px] w-[280px] rounded object-cover"
        src={data.serie.cover}
        alt=""
      />
      <div class="h-2"></div>
      <p class="line-clamp-2 text-center font-bold">{data.serie.name}</p>
      <p>{data.serie.user?.bookmark?.chapterSlug}</p>
    </div>
  </div>
  <div class="md:ml-4 md:pl-[280px]">
    <div class="flex flex-col gap-2">
      {#each data.chapters as chapter}
        <div class="group relative flex items-center gap-2 border-b pb-1 pr-4">
          <div class="flex flex-grow items-center gap-2">
            <img
              class="h-14 w-10 rounded object-cover"
              loading="lazy"
              src={chapter.coverArt}
              alt="Chapter Cover"
            />
            <div class="flex flex-col gap-2">
              <a
                class="line-clamp-1 font-medium"
                title={chapter.title}
                href={`/view/${chapter.serieSlug}/${chapter.slug}`}
              >
                {chapter.title}
              </a>
              {#if chapter.user?.isMarked}
                <p class="line-clamp-1 text-sm font-light">Read</p>
              {/if}
            </div>
          </div>
          <div>
            <button
              class="rounded-full p-1 hover:bg-black/20"
              onclick={() => {
                showPopupMenu = chapter.slug;
              }}
            >
              <EllipsisVertical size="30" />
            </button>
          </div>

          <div
            class={`popup absolute right-7 top-full z-50 -translate-y-4 rounded bg-red-400 ${showPopupMenu === chapter.slug ? "" : "hidden"}`}
          >
            <div class="flex flex-col">
              <form action="?/markChapter" method="post">
                <input
                  name="serieSlug"
                  value={data.serie.slug}
                  type="hidden"
                />
                <input name="chapterSlug" value={chapter.slug} type="hidden" />
                <button
                  class="flex w-full gap-1 rounded px-4 py-2 hover:bg-red-200"
                >
                  <BookPlus />
                  <p>Mark as Read</p>
                </button>
              </form>

              <form action="?/setBookmark" method="post">
                <input
                  name="serieSlug"
                  value={data.serie.slug}
                  type="hidden"
                />
                <input name="chapterSlug" value={chapter.slug} type="hidden" />
                <button
                  class="flex w-full gap-1 rounded px-4 py-2 hover:bg-red-200"
                >
                  <Bookmark />
                  <p>Set as Bookmark</p>
                </button>
              </form>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

{#if showPopupMenu !== ""}
  <button
    class="fixed inset-0 z-40 bg-purple-400/50"
    onclick={() => {
      showPopupMenu = "";
    }}
  >
  </button>
{/if}
