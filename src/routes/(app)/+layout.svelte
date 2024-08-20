<script lang="ts">
  import { page } from "$app/stores";
  import "../../app.css";

  const { data, children } = $props();
</script>

{#if data.user}
  <p>{data.user?.username}</p>
{/if}

<form action="/sync" method="post">
  <input name="redirectTo" type="hidden" value={$page.url.pathname} />
  <button>Run Sync</button>
</form>

{@render children()}
