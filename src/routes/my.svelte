<script context="module" lang="ts">
	export async function preload() {
		let response = await this.fetch('/lines/all/my.json');
		let json = await response.json();
		let lines: { slug: string; sha: string }[] = json.lines;
		return { lines };
	}
</script>

<script lang="ts">
	export let lines: { slug: string; path:string, sha: string }[];
    import { stores } from '@sapper/app';
	const { session } = stores();

	import firebase from 'firebase/app';
	import 'firebase/auth';

    async function linkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		let result = null;
		try {
			result = await firebase.auth().currentUser.linkWithPopup(provider);
			console.log("result", result);
		} catch(error) {
			console.log('link error code', error.code);
			console.log('link error message', error.message);
			console.log('link error email', error.email);
			console.log('link error credential', error.credential);
			return alert(`Account link error: ${error.message}`);
		}
		let response =  await fetch('/linkUser.json', {
				method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(result)
		});
		let json = await response.json();
		if (json.success === false) {
			alert("GitHub link error");
		}
	}
	async function unlinkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		await firebase.auth().currentUser.unlink(provider.providerId);
		alert("Unlinked");
    }
    
    async function checkUsername() {

    }
    async function saveUsername() {

    }

    let username;
    let usernameChecked = false;
    let identities = [];
    import { onMount } from 'svelte';
    onMount(async () => {
        username = $session.slUser.username;
		identities = $session.slUser.identities || [];
		console.log("ids", $session);
	});
</script>

<svelte:head>
	<title>My Scrylines</title>
</svelte:head>

<h2>My Account</h2>

<b>Name</b> {$session.slUser.name}
<b>Email</b> {$session.slUser.email}

{#if identities.includes("google.com")}
	{#if identities.includes("github.com")}
		<button style="float:right;" on:click={unlinkGitHub}>Unlink GitHub</button>
	{:else}
		<button style="float:right;" on:click={linkGitHub}>Link GitHub</button>
	{/if}
{/if}

<hr/>

<label for="handle">My Scryline Username:</label>
{#if !username}
    <input id="handle" type="text" size=30 bind:value={username}/>
    {#if usernameChecked}
        <button on:click={saveUsername}>Save</button>
    {:else}
        <button on:click={checkUsername}>Check Availability</button>
    {/if}
{/if}

<h2>My Scrylines</h2>

<ul>
	{#each lines as line}
		<li><a rel="prefetch" href="lines/{line.path}/{line.slug}">{line.slug}</a></li>
	{/each}
</ul>
