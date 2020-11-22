<script>
    import { getContext } from 'svelte';
    export let onCancel = () => {};
    export let onOK = () => {};
    export let initialComments, initialChapter, initialTags;
  
    const { close } = getContext('simple-modal');
      
    let insert;
    let comments = initialComments;
    let chapter = initialChapter;
    let tags = initialTags;
    let onChange = () => {};
      
    function _onCancel() {
        onCancel();
        close();
    }
      
    function _onOK() {
        onOK({comments:comments, insert:insert, chapter:chapter, tags:tags});
        close();
    }
    
    $: onChange(comments, insert)
  </script>
  
  <style>
    h2 {
          font-size: 1.1rem;
          text-align: center;
      }
      
      textarea {
          width: 100%;
      }
      
      .buttons {
          display: flex;
          justify-content: space-between;
      }
      
      .close {
          position: absolute;
          top: -2rem;
          right: 0;
          background: black;
      }
  </style>
  
  <button class="close" on:click={_onCancel}>
      Close
  </button>
  
  <h2>Add/edit comments, chapter, and tags</h2>

    <label for="comments">Comments</label>
    <input type=checkbox bind:checked={insert}/><em>Insert comments after this item, as a separate timeline entry</em>
    <textarea id="comments" type="text" rows=4 bind:value={comments} autofocus></textarea>
    <label for="chapter">Chapter</label>
    <input id="chapter" type="text" rows=4 bind:value={chapter}/>
    <label for="tags">Tags</label>
    <input id="tags" type="text" rows=4 bind:value={tags}/>
    
  <div class="buttons">
      <button on:click={_onCancel}>
          Cancel
      </button>
      <button on:click={_onOK}>
          OK
      </button>
  </div>