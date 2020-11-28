<script lang="ts">
    import Line from "../../components/Line.svelte";
    let line = { title:"", entries:[] }
</script>

<svelte:head>
    <title>New Line</title>
</svelte:head>

<div class="page">
  <Line {line}/>
</div>
  