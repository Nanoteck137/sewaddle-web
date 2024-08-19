<script>
  const { data } = $props();
</script>

<div class="flex flex-col">
  {#each data.series as serie}
    <a href={`/series/${serie.slug}`}>{serie.name}</a>
  {/each}
</div>
