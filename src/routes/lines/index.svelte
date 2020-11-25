<script context="module" lang="ts">
	export async function preload() {
		let response = await this.fetch('/lines/all.json');
		let json = await response.json();
		let posts: { slug: string; sha: string }[] = json;
		return { posts };
	}
</script>

<script lang="ts">
	export let posts: { slug: string; sha: string }[];
</script>

<style>
	ul {
		margin: 0 0 1em 0;
		line-height: 1.5;
	}
</style>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1>Recent posts</h1>

<ul>
	{#each posts as post}
		<li><a rel="prefetch" href="lines/{post.slug}">{post.slug}</a></li>
	{/each}
</ul>
