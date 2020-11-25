<svelte:head>
	<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
	<script src="https://cdn.quilljs.com/1.3.6/quill.js" on:load={quillLoaded}></script>
</svelte:head>

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
        comments = quill.root.innerHTML.split("<script")[0].split("javascript:")[0]; // paranoia
        onOK({comments:comments, insert:insert, chapter:chapter, tags:tags});
        close();
    }
    
    $: onChange(comments, insert)

    let quill;
    let quillReady = false;

    let mounted = false;
    import { onMount } from 'svelte';
    onMount(async () => {
		mounted = true;
		if (quillReady) {
				loadQuill();
		}
  });

	function quillLoaded() {
			quillReady = true;
			if (mounted) {
					loadQuill();
			}
	}
    
    function loadQuill() {
		quill = new Quill('#quill-container', {
			modules: {
				toolbar: [
					['bold', 'italic'],
					['link', 'blockquote'],
					[{ list: 'ordered' }, { list: 'bullet' }],
				],
			},
			placeholder: 'Add commentary',
			theme: 'snow'
        });
        quill.focus();
    }
</script>
  
  <style>
      .buttons {
          display: flex;
          justify-content: space-between;
      }
      #quill-container {
		min-height: 16rem;
      }
  </style>
  
  <h2>Add/edit comments, chapter, and tags</h2>

    <label for="quill-container">Comments</label>
    <input type=checkbox bind:checked={insert}/><em>Insert comments after this item, as a separate timeline entry</em>
    <div id="quill-container">{@html comments}</div>
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