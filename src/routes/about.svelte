<svelte:head>
	<title>About</title>
</svelte:head>

<script>
	import { stores } from '@sapper/app';
	const { session } = stores();
    import { onMount } from 'svelte';
    onMount(async () => {
		console.log("mount");
	});
</script>

<h1>About Scryline</h1>

<p>
	Between the pandemic, the US election, Brexit, etc., 2020 has proved it is increasingly hard to make sense of our world.
	Doing so often requires synthesizing key developments and vital information scattered across articles on different
	media sites, Medium blogs, Substack posts, tweets, YouTube videos, and more.
</p>

<p>
	What's more, traditional journalism often still treats articles as dead once published, rejecting subsequent expert
	commentary; refrains from linking to primary sources; and fails to provide important context.  As the media landscape
	grows more fragmented, aggregation tools will become more necessary.
</p>

<p>
	Scryline is a simple timeline aggregation tool intended to help provide context and clarity to online news.
</p>


