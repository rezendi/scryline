<script lang="ts">
    import Line from "../../components/Line.svelte";
    let line = { title:"", entries:[] }
  </script>
  
  <svelte:head>
      <title>New Line</title>
  </svelte:head>
  
  <style>
    .page{
      max-width: 47rem;
      padding: 1rem 2rem 3rem;
      margin-left: auto;
      margin-right: auto;
    }
  </style>  
    
  <div class="page">
    <Line {line}/>
  </div>
  