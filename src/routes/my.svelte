<script lang="ts">
    import { stores } from '@sapper/app';
	const { session } = stores();

	import firebase from 'firebase/app';
	import 'firebase/auth';

    async function linkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		return linkProvider(provider, "github.com");
	}
	async function linkGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return linkProvider(provider, "google.com");
	}
	async function linkProvider(provider, site) {
		let result = null;
		try {
			result = await firebase.auth().currentUser.linkWithPopup(provider);
			firebase.auth().currentUser.reload();
			location.href = "/";
			// console.log("result", result);
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
			body: JSON.stringify({result, ...{site:site}})
		});
		let json = await response.json();
		if (json.success === false) {
			alert("Link user error");
		}
	}

	async function unlinkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		return unlinkProvider(provider, "github.com");
	}
	async function unlinkGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return unlinkProvider(provider, "google.com");
	}
	async function unlinkProvider(provider, site) {
		if (!confirm("We have to log you out after unlinking a provider; then you can log back in with the other. That OK?")) {
			return;
		}
		await firebase.auth().currentUser.unlink(provider.providerId);
		firebase.auth().currentUser.reload();
		let response =  await fetch('/linkUser.json', {
			method: 'DELETE',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({site})
		});
		let json = await response.json();
		alert("Unlinked");
		firebase.auth().signOut();
		location.href = "/";
    }
    
    let username='', usernameSet = false, usernameChecked = false;

	async function checkUsername() {
		console.log("checking", username);
		let response = await fetch('/username.json?check='+username);
		let json = await response.json();
		if (json.success) {
			usernameChecked = true;
		}
		alert(json.message);
    }

	async function saveUsername() {
		let response = await fetch('/username.json', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({username})
		});
		let json = await response.json();
		if (json.success) {
			$session.sUser.username = json.username;
			usernameSet = true;
		}
    }

	let lines = [];
    let identities = [];
    import { onMount } from 'svelte';
    onMount(async () => {
		if (!$session.sUser.uid) {
			return location.href = "/";
		}
		username = $session.sUser.username || '';
		usernameSet = username.length > 3;
		identities = $session.sUser.identities || [];
		// console.log("identities", identities);
		let response = await fetch('/lines/all/my.json');
		let json = await response.json();
		lines = json.lines;
	});
</script>

<svelte:head>
	<title>My Scrylines</title>
</svelte:head>

<h2>My Account</h2>

<b>Name</b> {$session.sUser.name}
<b>Email</b> {$session.sUser.email}
<b>GitHub</b> {$session.sUser.github || 'n/a'}

{#if identities.includes("google.com")}
	{#if identities.includes("github.com")}
		<button style="float:right;" on:click={unlinkGitHub}>Unlink GitHub</button>
	{:else}
		<button style="float:right;" on:click={linkGitHub}>Link GitHub</button>
	{/if}
{/if}

{#if identities.includes("github.com")}
	{#if identities.includes("google.com")}
		<button style="float:right;" on:click={unlinkGoogle}>Unlink Google</button>
	{:else}
		<button style="float:right;" on:click={linkGoogle}>Link Google</button>
	{/if}
{/if}

<hr/>

<label for="handle">My Scryline Username:</label>
{#if !usernameSet}
    <input id="handle" type="text" size=30 bind:value={username}/>
    {#if usernameChecked}
        <button on:click={saveUsername}>Save</button>
    {:else}
        <button on:click={checkUsername}>Check Availability</button>
	{/if}
{:else}
	<b>{username}</b>
{/if}

<h2>My Scrylines</h2>

<ul>
	{#each lines as line}
		<li><a rel="prefetch" href="lines/{line.path}/{line.slug}">{line.slug}</a></li>
	{/each}
</ul>
