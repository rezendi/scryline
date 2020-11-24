<script lang="ts">
	import Nav from '../components/Nav.svelte';
	export let segment: string;

	import { stores } from '@sapper/app';
    const { session } = stores();

	import firebase from 'firebase/app';
	import 'firebase/auth';

	import { onMount } from 'svelte';
    onMount(async () => {
        firebase.auth().onIdTokenChanged(async (user) => {
            try {
                if (!user) {
                    console.log(`User does not exist`);
                    $session.user = false;
                    return;
                }
                const token = await user.getIdToken();
                $session.user = user;
            } catch (e) {
                console.log(`Something went wrong`);
                $session.user = false;
                return;
            }
        });
	});
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: #f0f0f0;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>