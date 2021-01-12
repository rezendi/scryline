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

<h2>Scryline</h2>

<p>Make sense of the world.</p>

<h3>Recent timelines:</h3>

<ul>
	{#each lines as line}
		<li><a rel="prefetch" href="lines/{line.path}/{line.slug}">{line.title}</a></li>
	{/each}
</ul>
