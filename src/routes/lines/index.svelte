<script context="module" lang="ts">
	export async function preload() {
		let response = await this.fetch('/lines/all.json');
		let json = await response.json();
		let lines: { slug: string; sha: string }[] = json;
		return { lines };
	}
</script>

<script lang="ts">
	export let lines: { slug: string; sha: string }[];
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
		<li><a rel="prefetch" href="lines/{line.slug}">{line.slug}</a></li>
	{/each}
</ul>
