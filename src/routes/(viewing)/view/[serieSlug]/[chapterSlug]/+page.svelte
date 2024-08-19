<script lang="ts">
  const { data } = $props();
</script>

<p>View Chapter (W.I.P) {data.layout}</p>

<div>
  <a href={`?page=${data.page + 1}`}>Next Page</a>
  <a href={`?page=${data.page - 1}`}>Prev Page</a>
</div>

{#if data.layout === "paged"}
  <a href={`?page=${data.page}&layout=scroll`}>Scroll Layout</a>
{:else}
  <a href={`?page=${data.page}&layout=paged`}>Paged Layout</a>
{/if}

<div>
  {#if data.chapter.nextChapter}
    <a
      href={`/view/${data.chapter.serieSlug}/${data.chapter.nextChapter}?layout=${data.layout}`}
      >Next Chapter</a
    >
  {/if}

  {#if data.chapter.prevChapter}
    <a
      href={`/view/${data.chapter.serieSlug}/${data.chapter.prevChapter}?page=last&layout=${data.layout}`}
      >Prev Chapter</a
    >
  {/if}
</div>

{#if data.layout === "paged"}
  <img src={data.chapter.pages[data.page]} alt={`Page ${data.page + 1}`} />
{:else}
  <div class="flex flex-col">
    {#if data.chapter.prevChapter}
      <a
        href={`/view/${data.chapter.serieSlug}/${data.chapter.prevChapter}?page=last&layout=${data.layout}`}
        >Prev Chapter</a
      >
    {/if}

    {#each data.chapter.pages as page, i}
      <img id={`page-${i}`} src={page} alt={`Page ${i + 1}`} />
    {/each}

    {#if data.chapter.nextChapter}
      <a
        href={`/view/${data.chapter.serieSlug}/${data.chapter.nextChapter}?layout=${data.layout}`}
        >Next Chapter</a
      >
    {/if}
  </div>
{/if}
