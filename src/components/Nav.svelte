<script lang="ts">
	import { stores } from '@sapper/app';
	const { session } = stores();

	export let segment: string;

	import firebase from 'firebase/app';
	import 'firebase/auth';

	import { onMount } from 'svelte';
    onMount(async () => {
		var firebaseConfig = {
			apiKey: "AIzaSyC0pWxpoHg9YahhjASvv2RSsM-o43bcyXk",
			authDomain: "scryliner.firebaseapp.com",
			databaseURL: "https://scryliner.firebaseio.com",
			projectId: "scryliner",
			storageBucket: "scryliner.appspot.com",
			messagingSenderId: "350222598486",
			appId: "1:350222598486:web:e35a87ad9b4c03774ad6f7",
			measurementId: "G-7KHLE3WKF1"
		};
		firebase.initializeApp(firebaseConfig);

		firebase.auth().onAuthStateChanged(async (user) => {
			if (user) {
				console.log("logging in server");
				let token = await user.getIdToken(false)
				let response =  await fetch('/session.json', {
					method: 'POST',
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token })
				});
				let json = await response.json();
				if (json.success === false) {
					alert("Login error");
				}
			} else {
				console.log("logging out server");
				let response =  await fetch('/session.json', {
					method: 'DELETE',
					headers: { "Content-Type": "application/json" },
				});
				let json = await response.json();
				if (json.success === false) {
					alert("Logout error");
				}
			}
		});
	});

	async function login() {
		let result = null;
		var provider = new firebase.auth.GoogleAuthProvider();
		try {
			result = await firebase.auth().signInWithPopup(provider);
			console.log("result", result);
		} catch(error) {
			alert("Signin error");
			console.log('auth error code', error.code);
			console.log('auth error message', error.message);
			console.log('auth error email', error.email);
			console.log('auth error credential', error.credential);
		}
		if (result) {
		}
	}

	function logout() {
		firebase.auth().signOut();
		location.reload();
	}

	function newLine() {
		window.location.href="/lines/new";
	}

</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	button {
		float:right;
		padding:10px;
		margin:10px 0px 10px 0px;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: #4557bb;
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a></li>
		<li><a rel=prefetch aria-current="{segment === 'lines' ? 'page' : undefined}" href="lines">lines</a></li>
		{#if $session.user}
			<button on:click={logout}>Logout</button>
			<button on:click={newLine}>New</button>
		{:else}
			<button on:click={login}>Login</button>
		{/if}
	</ul>
</nav>
