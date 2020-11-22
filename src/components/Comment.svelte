<script>
    import { getContext } from 'svelte';
    export let onCancel = () => {};
    export let onOK = () => {};
    export let initialComments;
  
    const { close } = getContext('simple-modal');
      
    let insert;
    let comments = initialComments;
    let onChange = () => {};
      
    function _onCancel() {
        onCancel();
        close();
    }
      
    function _onOK() {
        onOK(comments, insert);
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
  
  <h2>Add comments to / after this item</h2>

    <input type=checkbox bind:checked={insert}/><em>Insert after this item, as a separate timeline entry</em>
    <textarea type="text" rows=4 bind:value={comments} autofocus></textarea>
  
  <div class="buttons">
      <button on:click={_onCancel}>
          Cancel
      </button>
      <button on:click={_onOK}>
          OK
      </button>
  </div>