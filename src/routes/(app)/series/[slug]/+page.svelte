<script lang="ts">
  const { data } = $props();
</script>

<p>{data.serie.name}</p>
<p>{data.serie.chapterCount}</p>
<p>{data.serie.cover}</p>

<div class="flex flex-col">
  {#each data.chapters as chapter}
    <a href={`/view/${data.serie.slug}/${chapter.slug}`}>{chapter.title}</a>
  {/each}
</div>
