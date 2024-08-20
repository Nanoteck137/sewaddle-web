<script lang="ts">
  const { data } = $props();
</script>

<p>{data.serie.name}</p>
<p>{data.serie.chapterCount}</p>
<p>{data.serie.cover}</p>

<p>Bookmark: {data.serie.user?.bookmark?.chapterSlug}</p>

<div class="flex flex-col">
  {#each data.chapters as chapter}
    <a href={`/view/${data.serie.slug}/${chapter.slug}`}
      >{chapter.title} - {chapter.user?.isMarked}</a
    >
  {/each}
</div>
