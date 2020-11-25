<script lang="ts">
	import { stores } from '@sapper/app';
	const { session } = stores();

	export let segment: string;

	import firebase from 'firebase/app';
	import 'firebase/auth';

	import { onMount } from 'svelte';
    onMount(async () => {
		const firebaseConfig = {
			apiKey: 'AIzaSyANqcb0it-tn1Veri5Sw4kAa_la_rzAmX8',
			authDomain: 'hfc-rubric.firebaseapp.com',
			databaseURL: 'https://hfc-rubric.firebaseio.com',
			projectId: 'hfc-rubric',
			storageBucket: 'hfc-rubric.appspot.com',
			messagingSenderId: '424177396554',
			appId: '1:424177396554:web:e7f6f9c4297bc5512eefb3',
			measurementId: 'G-73KMG0QGE3',
		};
		firebase.initializeApp(firebaseConfig);
	});

	function login() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth()
		.signInWithPopup(provider)
		.then(function(result) {
			console.log("result", result);
			console.log('logged in', result.user.email);
		})
		.catch(function(error) {
			console.log('auth error code', error.code);
			console.log('auth error message', error.message);
			console.log('auth error email', error.email);
			console.log('auth error credential', error.credential);
		});
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
