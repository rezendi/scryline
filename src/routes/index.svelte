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

<svelte:head>
	<title>Scryline</title>
</svelte:head>

<style>
	h1 {
		text-align: center;
		margin: 0 auto;
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}
	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<h2>Scryline</h2>

<p>Make sense of the world.</p>

<h3>Recent timelines:</h3>

<ul>
	{#each lines as line}
		<li><a rel="prefetch" href="lines/{line.path}/{line.slug}">{line.title}</a></li>
	{/each}
</ul>
