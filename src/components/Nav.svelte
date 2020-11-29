<script lang="ts">
	import { stores } from '@sapper/app';
	const { session } = stores();

	export let segment: string;

	import firebase from 'firebase/app';
	import 'firebase/auth';

	import Overlay from 'svelte-overlay';

	let loggedIn;
	import { onMount } from 'svelte';
	onMount(async () => {
		loggedIn = $session.slUser.uid;
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
				if (json.success) {
					$session.slUser = json.slUser;
				} else {
					alert("Login error");
				}
			} else {
				console.log("logging out server");
				let response =  await fetch('/session.json', {
					method: 'DELETE',
					headers: { "Content-Type": "application/json" },
				});
				let json = await response.json();
				if (json.success) {
					$session.slUser = {email:""};
				} else {
					alert("Logout error");
				}
			}
			loggedIn = $session.slUser.uid;
		});
	});

	async function loginWithGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return login(provider, "google.com");
	}
	async function loginWithGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		provider.addScope('public_repo');
		return login(provider, "github.com");
	}
	async function login(provider, site) {
		let result = null;
		try {
			result = await firebase.auth().signInWithPopup(provider);
			if (site=="github.com") {
				let response =  await fetch('/linkUser.json', {
					method: 'POST',
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({result, ...{site:site}})
				});
				let json = await response.json();
				if (json.success === false) {
					alert("GitHub credential add error");
				}
			}
		} catch(error) {
			console.log('auth error code', error.code);
			console.log('auth error message', error.message);
			console.log('auth error email', error.email);
			console.log('auth error credential', error.credential);
			if (error.code=="auth/account-exists-with-different-credential") {
				alert(`An account already exists with the email address ${error.email} -- log in the other way and then link your ${providerName} account from My Scrylines`);
			} else {
				alert(`Signin error: ${error.message}`);
			}
		}
	}

	function goToMy() {
		location.href = "/my";
	}

	function logout() {
		firebase.auth().signOut();
		location.href = "/";
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
		display:flex;
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
		padding:10px;
		width:5rem;
		align-items: center;
		margin:10px 0px 10px 0px;
	}

	.loginButtons button {
		border: 0px;
		margin:0px;
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
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">Home</a></li>
		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">About</a></li>
		<li><a rel=prefetch aria-current="{segment === 'lines' ? 'page' : undefined}" href="lines">Timelines</a></li>
		<li class="spacer">&nbsp;</li>
		<li>
			{#if loggedIn}
				<Overlay closeOnClickOutside>
					<button slot="parent" class="defaultButton" let:toggle on:click={toggle}>My &#x25BC;</button>
					<div slot="content" class="loginButtons" let:close>
						<button on:click={goToMy}>Scrylines</button>
						<button class="defaultButton" on:click={logout}>Logout</button>
					</div>
				</Overlay>
				<button class="defaultButton" on:click={newLine}>New</button>
			{:else}
				<Overlay closeOnClickOutside>
					<button slot="parent" class="defaultButton" let:toggle on:click={toggle}>Login &#x25BC;</button>
					<div slot="content" class="loginButtons" let:close>
						<button on:click={loginWithGoogle}>Google</button>
						<button on:click={loginWithGitHub}>GitHub</button>
					</div>
				</Overlay>
			{/if}
		</li>
	</ul>
</nav>
