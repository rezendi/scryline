<script context="module" lang="ts">
	export async function preload() {
		let response = await this.fetch('/lines/all/all.json');
		let json = await response.json();
		let lines: { slug:string; path:string, title:string, sha:string }[] = json.lines;
		return { lines };
	}
</script>

<script lang="ts">
	export let lines: { slug:string; path:string, title:string, sha:string }[];
</script>

<style>
	ul {
		margin: 0 0 1em 0;
		line-height: 1.5;
	}
</style>

<svelte:head>
	<title>Recent lines</title>
</svelte:head>

<h1>Recent lines</h1>

<ul>
	{#each lines as line}
		{#if !line.branch}
			<li><a rel="prefetch" href="lines/{line.path}/{line.slug}">{line.title}</a></li>
		{/if}
	{/each}
</ul>
